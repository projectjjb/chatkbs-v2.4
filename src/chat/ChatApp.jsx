import React, { useState, useRef, useEffect } from "react";
import { sbSelect, sbInsert, sbUpdate, sbDelete, SUPABASE_URL, SUPABASE_ANON_KEY } from "../AuthGate.jsx";
import { C, Avatar, formatTime, avatarColor, initials, isOnline, validateImageFile, compressImage, uploadImage } from "./helpers.jsx";
import { IconRail, ChannelSidebar } from "./Sidebar.jsx";
import { MessageList, MessageInput } from "./Messages.jsx";
import { useTabRevealSpoilers } from "./markdown.jsx";
import SettingsModal from "./SettingsModal.jsx";
import AdminPanel from "./AdminPanel.jsx";

/* ============================================================
   실시간 구독 헬퍼
   ============================================================ */
function subscribeToTable(table, onInsert, onUpdate, onDelete) {
  const wsUrl = SUPABASE_URL.replace("https://", "wss://") + `/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`;
  const ws = new WebSocket(wsUrl);
  let ref = 1;
  ws.onopen = () => {
    ws.send(JSON.stringify({ topic: `realtime:public:${table}`, event: "phx_join", payload: {}, ref: ref++ }));
    const hb = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: ref++ }));
    }, 25000);
    ws._hb = hb;
  };
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.event === "INSERT" && msg.payload?.record) onInsert?.(msg.payload.record);
      else if (msg.event === "UPDATE" && msg.payload?.record) onUpdate?.(msg.payload.record);
      else if (msg.event === "DELETE" && msg.payload?.old_record) onDelete?.(msg.payload.old_record);
    } catch (e) {}
  };
  return () => {
    clearInterval(ws._hb);
    ws.close();
  };
}

/* ============================================================
   메인 채팅 앱
   ============================================================ */
export default function ChatApp({ user }) {
  const currentUser = user.name; // 고유 식별자 (@이름)
  const isAdmin = Boolean(user.is_admin);

  useTabRevealSpoilers();

  const [currentView, setCurrentView] = useState("chat");
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingSpoiler, setPendingSpoiler] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [connError, setConnError] = useState("");

  const [serverName, setServerName] = useState("Chat");
  const [profileMap, setProfileMap] = useState({}); // { name: { nickname, avatar_color, avatar_url, last_seen } }
  const [myColor, setMyColor] = useState(user.avatar_color || null);
  const [myAvatarUrl, setMyAvatarUrl] = useState(user.avatar_url || null);
  const [nickname, setNickname] = useState(user.nickname || "");

  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showJumpDown, setShowJumpDown] = useState(false);

  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const isNearBottomRef = useRef(true);

  function displayName(name) {
    return profileMap[name]?.nickname || name;
  }
  function userAvatar(name) {
    return profileMap[name]?.avatar_url || null;
  }
  function userColor(name) {
    return profileMap[name]?.avatar_color || avatarColor(name);
  }
  function isUserOnline(name) {
    return isOnline(profileMap[name]?.last_seen, name === currentUser);
  }

  const allUserNames = React.useMemo(() => {
    const set = new Set();
    Object.entries(profileMap).forEach(([name, p]) => {
      set.add(name);
      if (p?.nickname) set.add(p.nickname);
    });
    return Array.from(set);
  }, [profileMap]);

  /* ---------------- 서버 이름 로드 ---------------- */
  useEffect(() => {
    let cancelled = false;
    function load() {
      sbSelect("settings", "select=server_name&id=eq.1")
        .then((rows) => {
          if (!cancelled && rows.length) setServerName(rows[0].server_name);
        })
        .catch(() => {});
    }
    load();
    const t = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  async function saveServerName(name) {
    setServerName(name);
    try {
      await sbUpdate("settings", "id=eq.1", { server_name: name });
    } catch (e) {}
  }

  /* ---------------- 프로필/온라인 상태 ---------------- */
  function refreshProfiles() {
    sbSelect("users", "select=name,nickname,avatar_color,avatar_url,last_seen,status")
      .then((rows) => {
        const map = {};
        rows.forEach((r) => {
          if (r.status !== "approved") return;
          map[r.name] = { nickname: r.nickname, avatar_color: r.avatar_color, avatar_url: r.avatar_url, last_seen: r.last_seen };
        });
        setProfileMap(map);
        const mine = rows.find((r) => r.name === currentUser);
        if (mine?.avatar_color) setMyColor(mine.avatar_color);
        if (mine) setMyAvatarUrl(mine.avatar_url || null);
      })
      .catch(() => {});
  }

  useEffect(() => {
    refreshProfiles();
    const unsub = subscribeToTable(
      "users",
      (r) => refreshProfiles(),
      (r) => {
        setProfileMap((prev) => ({ ...prev, [r.name]: { nickname: r.nickname, avatar_color: r.avatar_color, avatar_url: r.avatar_url, last_seen: r.last_seen } }));
        if (r.name === currentUser) {
          if (r.avatar_color) setMyColor(r.avatar_color);
          setMyAvatarUrl(r.avatar_url || null);
        }
      },
      () => refreshProfiles()
    );
    const poll = setInterval(refreshProfiles, 30000);
    return () => {
      unsub();
      clearInterval(poll);
    };
  }, [currentUser]);

  // 내 접속 시각 갱신 (온라인 표시용)
  useEffect(() => {
    function beat() {
      sbUpdate("users", `id=eq.${user.id}`, { last_seen: new Date().toISOString() }).catch(() => {});
    }
    beat();
    const t = setInterval(beat, 30000);
    return () => clearInterval(t);
  }, [user.id]);

  /* ---------------- 채널 로드 ---------------- */
  useEffect(() => {
    let cancelled = false;
    sbSelect("channels", "select=id,name,kind&kind=eq.text&order=sort_order.asc")
      .then((rows) => {
        if (cancelled) return;
        setChannels(rows);
        if (rows.length > 0) setActiveChannel(rows[0].id);
      })
      .catch(() => setConnError("채널을 불러오지 못했습니다."))
      .finally(() => setLoadingChannels(false));
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------- 메시지 로드 + 실시간 ---------------- */
  const scrollToBottom = (smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    if (smooth) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    else el.scrollTop = el.scrollHeight;
    setShowJumpDown(false);
  };

  const stickRafRef = useRef(null);
  const forceScrollBottom = (duration = 1300) => {
    isNearBottomRef.current = true;
    setShowJumpDown(false);
    if (stickRafRef.current) cancelAnimationFrame(stickRafRef.current);
    const until = performance.now() + duration;
    const tick = () => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
      if (performance.now() < until) stickRafRef.current = requestAnimationFrame(tick);
      else stickRafRef.current = null;
    };
    tick();
  };

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = dist < 120;
    isNearBottomRef.current = near;
    setShowJumpDown(!near);
  }

  useEffect(() => {
    if (activeChannel == null) return;
    let cancelled = false;
    sbSelect(
      "messages",
      `channel_id=eq.${activeChannel}&select=id,author,text,image_url,image_spoiler,reactions,created_at,reply_to_id,reply_to_author,reply_to_text&order=created_at.asc`
    )
      .then((rows) => {
        if (cancelled) return;
        setMessages(rows);
        forceScrollBottom();
      })
      .catch(() => setConnError("메시지를 불러오지 못했습니다."));
    return () => {
      cancelled = true;
    };
  }, [activeChannel]);

  useEffect(() => {
    if (isNearBottomRef.current) scrollToBottom(false);
  }, [messages]);

  useEffect(() => {
    if (activeChannel != null) forceScrollBottom(1300);
  }, [activeChannel]);

  useEffect(() => {
    if (activeChannel == null) return;
    const unsub = subscribeToTable(
      "messages",
      (r) => {
        setMessages((prev) => {
          if (r.channel_id !== activeChannel) return prev;
          if (prev.some((m) => m.id === r.id)) return prev;
          return [...prev, r];
        });
      },
      (r) => setMessages((prev) => prev.map((m) => (m.id === r.id ? { ...m, ...r } : m))),
      (r) => setMessages((prev) => prev.filter((m) => m.id !== r.id))
    );
    return unsub;
  }, [activeChannel]);

  /* ---------------- 전송 ---------------- */
  function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      setConnError(err);
      return;
    }
    setConnError("");
    setPendingImage({ file, previewUrl: URL.createObjectURL(file) });
  }

  function cancelPendingImage() {
    if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
    setPendingSpoiler(false);
  }

  async function sendMessage() {
    const text = input.trim();
    if ((!text && !pendingImage) || activeChannel == null || uploading) return;

    let imageUrl = null;
    const imgToSend = pendingImage;
    const spoiler = pendingSpoiler;
    const reply = replyingTo;
    setInput("");
    setPendingImage(null);
    setPendingSpoiler(false);
    setReplyingTo(null);

    const replyFields = reply
      ? { reply_to_id: reply.id, reply_to_author: reply.author, reply_to_text: (reply.text || (reply.image_url ? "[사진]" : "")).slice(0, 120) }
      : {};

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, author: currentUser, text, image_url: imgToSend?.previewUrl || null, image_spoiler: spoiler, created_at: new Date().toISOString(), ...replyFields },
    ]);
    forceScrollBottom();

    try {
      if (imgToSend) {
        setUploading(true);
        const compressed = await compressImage(imgToSend.file);
        imageUrl = await uploadImage(compressed);
      }
      const [saved] = await sbInsert("messages", { channel_id: activeChannel, author: currentUser, text: text || "", image_url: imageUrl, image_spoiler: spoiler, ...replyFields });
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
    } catch (e) {
      setConnError(e.message || "전송 실패");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setUploading(false);
      if (imgToSend?.previewUrl) URL.revokeObjectURL(imgToSend.previewUrl);
    }
  }

  async function deleteMessage(msg) {
    if (!window.confirm("이 메시지를 삭제할까요?")) return;
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    try {
      await sbDelete("messages", `id=eq.${msg.id}`);
    } catch (e) {
      setMessages((prev) => [...prev, msg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    }
  }

  async function toggleReaction(msg, emoji) {
    const current = msg.reactions && typeof msg.reactions === "object" ? msg.reactions : {};
    const users = Array.isArray(current[emoji]) ? current[emoji] : [];
    const already = users.includes(currentUser);
    const nextUsers = already ? users.filter((u) => u !== currentUser) : [...users, currentUser];
    const next = { ...current };
    if (nextUsers.length > 0) next[emoji] = nextUsers;
    else delete next[emoji];

    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, reactions: next } : m)));
    try {
      await sbUpdate("messages", `id=eq.${msg.id}`, { reactions: next });
    } catch (e) {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, reactions: current } : m)));
    }
  }

  const channelName = channels.find((c) => c.id === activeChannel)?.name || "";

  const onlineUsers = Object.entries(profileMap)
    .filter(([name]) => name !== currentUser)
    .map(([name, p]) => ({
      name,
      display: p.nickname || name,
      avatarUrl: p.avatar_url,
      color: p.avatar_color || avatarColor(name),
      online: isOnline(p.last_seen, false),
    }))
    .sort((a, b) => (b.online === a.online ? a.display.localeCompare(b.display) : b.online ? 1 : -1));

  async function saveProfile(newNickname, newColor, newAvatarUrl) {
    try {
      await sbUpdate("users", `id=eq.${user.id}`, { nickname: newNickname || null, avatar_color: newColor || null, avatar_url: newAvatarUrl || null });
      setNickname(newNickname);
      setMyColor(newColor || null);
      setMyAvatarUrl(newAvatarUrl || null);
      setProfileMap((prev) => ({ ...prev, [currentUser]: { ...prev[currentUser], nickname: newNickname || null, avatar_color: newColor || null, avatar_url: newAvatarUrl || null } }));
      return true;
    } catch (e) {
      return false;
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: C.bg, fontFamily: C.font, overflow: "hidden" }}>
      <IconRail currentView={currentView} onChangeView={setCurrentView} serverInitial={serverName?.trim()?.[0]} />

      {currentView === "chat" && (
        <>
          <ChannelSidebar
            serverName={serverName}
            onEditServerName={saveServerName}
            channels={channels}
            activeChannel={activeChannel}
            onSelectChannel={setActiveChannel}
            onlineUsers={onlineUsers}
            currentUser={currentUser}
            displayName={displayName}
            userAvatar={userAvatar}
            userColor={userColor}
            profileMap={profileMap}
            onOpenSettings={() => setShowSettings(true)}
            isAdmin={isAdmin}
            onOpenAdmin={() => setShowAdmin(true)}
            myAvatarUrl={myAvatarUrl}
            myColor={myColor || avatarColor(currentUser)}
          />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
            <div style={{ height: 56, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <span style={{ color: C.textFaint, fontSize: 19, marginRight: 6 }}>#</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: C.text }}>{channelName}</span>
            </div>

            <MessageList
              messages={messages}
              loading={loadingChannels}
              currentUser={currentUser}
              displayName={displayName}
              userAvatar={userAvatar}
              userColor={userColor}
              isUserOnline={isUserOnline}
              onDelete={deleteMessage}
              onReply={setReplyingTo}
              onToggleReaction={toggleReaction}
              mentionNames={allUserNames}
              scrollRef={scrollRef}
              onScroll={handleScroll}
              onImageLoad={(idx) => {
                if (idx === messages.length - 1 && isNearBottomRef.current) scrollToBottom(false);
              }}
            />

            {showJumpDown && (
              <div
                onClick={() => {
                  isNearBottomRef.current = true;
                  scrollToBottom(true);
                }}
                style={{
                  position: "absolute",
                  bottom: 90,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#fff",
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: "7px 16px",
                  fontSize: 13,
                  color: C.blueDark,
                  fontWeight: 500,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(60,64,67,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                최신 메시지 ↓
              </div>
            )}

            {connError && <div style={{ color: C.red, fontSize: 12, padding: "0 24px 6px" }}>{connError}</div>}

            <MessageInput
              channelName={channelName}
              input={input}
              onInputChange={setInput}
              onSend={sendMessage}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              displayName={displayName}
              pendingImage={pendingImage}
              onPickImage={() => fileInputRef.current?.click()}
              onCancelImage={cancelPendingImage}
              pendingSpoiler={pendingSpoiler}
              onToggleSpoiler={() => setPendingSpoiler((v) => !v)}
              uploading={uploading}
              fileInputRef={fileInputRef}
              onFileSelected={handleFileSelected}
            />
          </div>
        </>
      )}

      {currentView === "docs" && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.textFaint }}>
          문서 기능은 다음 단계에서 추가됩니다.
        </div>
      )}
      {currentView === "game" && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.textFaint }}>
          게임 기능은 다음 단계에서 추가됩니다.
        </div>
      )}

      {showSettings && (
        <SettingsModal
          currentUser={currentUser}
          nickname={nickname}
          avatarUrl={myAvatarUrl}
          color={myColor || avatarColor(currentUser)}
          isAdmin={isAdmin}
          userId={user.id}
          onSave={saveProfile}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAdmin && <AdminPanel currentUserId={user.id} onClose={() => setShowAdmin(false)} />}
    </div>
  );
}
