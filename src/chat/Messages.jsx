import React, { useState, useRef, useEffect } from "react";
import { C, Avatar, formatTime, avatarColor, initials, EMOJI_LIST } from "./helpers.jsx";
import { MessageBody, SpoilerImage } from "./markdown.jsx";

/* ============================================================
   이모지 선택기
   ============================================================ */
const EMOJI_CHOICES = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👀", "🤔", "🙌", "✅", "❓"];

export function EmojiPicker({ onPick, onClose, align = "left" }) {
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        bottom: "100%",
        [align === "right" ? "right" : "left"]: 0,
        marginBottom: 8,
        background: "#fff",
        borderRadius: 10,
        padding: 8,
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 2,
        boxShadow: "0 2px 10px rgba(60,64,67,0.3)",
        border: `1px solid ${C.border}`,
        zIndex: 30,
      }}
    >
      {EMOJI_CHOICES.map((e) => (
        <button
          key={e}
          onClick={() => onPick(e)}
          style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", padding: "6px 8px", borderRadius: 6 }}
          onMouseEnter={(ev) => (ev.currentTarget.style.background = C.bgHover)}
          onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

function summarizeReactions(reactions, currentUser) {
  if (!reactions || typeof reactions !== "object") return [];
  return Object.entries(reactions)
    .map(([emoji, users]) => ({
      emoji,
      count: Array.isArray(users) ? users.length : 0,
      mine: Array.isArray(users) && users.includes(currentUser),
    }))
    .filter((r) => r.count > 0);
}

/* ============================================================
   메시지 리스트
   ============================================================ */
export function MessageList({
  messages,
  loading,
  currentUser,
  displayName,
  userAvatar,
  userColor,
  isUserOnline,
  onDelete,
  onReply,
  onToggleReaction,
  mentionNames,
  scrollRef,
  onScroll,
  onImageLoad,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [pickerFor, setPickerFor] = useState(null);

  return (
    <div ref={scrollRef} onScroll={onScroll} style={{ flex: 1, overflowY: "auto", padding: "18px 28px" }}>
      {loading && <div style={{ color: C.textFaint, fontSize: 14 }}>불러오는 중...</div>}
      {!loading && messages.length === 0 && (
        <div style={{ color: C.textFaint, fontSize: 14 }}>아직 메시지가 없습니다. 첫 메시지를 보내보세요!</div>
      )}

      {messages.map((m, idx) => {
        const prev = messages[idx - 1];
        const grouped =
          prev &&
          prev.author === m.author &&
          !m.reply_to_author &&
          !prev.image_url === !m.image_url &&
          new Date(m.created_at) - new Date(prev.created_at) < 5 * 60 * 1000;

        const reactions = summarizeReactions(m.reactions, currentUser);
        const isMe = m.author === currentUser;
        const hovered = hoveredId === m.id;
        const pickerOpen = pickerFor === m.id;
        const showToolbar = hovered || pickerOpen;

        return (
          <div
            key={m.id}
            id={`v2msg-${m.id}`}
            className={idx === messages.length - 1 ? "v2-msg-in" : undefined}
            onMouseEnter={() => setHoveredId(m.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              marginTop: grouped ? 2 : 14,
              padding: "3px 10px",
              marginLeft: -10,
              marginRight: -10,
              borderRadius: 10,
              background: hovered ? "#f8f9fa" : "transparent",
              position: "relative",
            }}
          >
            {m.reply_to_author && (
              <div
                onClick={() => {
                  const t = document.getElementById(`v2msg-${m.reply_to_id}`);
                  if (t) {
                    t.scrollIntoView({ behavior: "smooth", block: "center" });
                    t.style.background = C.bgActive;
                    setTimeout(() => (t.style.background = "transparent"), 1200);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginLeft: isMe ? 0 : 44,
                  marginRight: isMe ? 44 : 0,
                  marginBottom: 2,
                  color: C.textFaint,
                  fontSize: 12.5,
                  cursor: "pointer",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                }}
              >
                <span>↳</span>
                <Avatar url={userAvatar(m.reply_to_author)} color={userColor(m.reply_to_author)} label={displayName(m.reply_to_author)} size={15} />
                <span style={{ color: C.textSub, fontWeight: 600 }}>{displayName(m.reply_to_author)}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.reply_to_text}</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, flexDirection: isMe ? "row-reverse" : "row" }}>
              <div style={{ width: 36, flexShrink: 0 }}>
                {!grouped && (
                  <Avatar
                    url={userAvatar(m.author)}
                    color={userColor(m.author)}
                    label={displayName(m.author)}
                    size={36}
                    online={isUserOnline(m.author)}
                    showStatus
                  />
                )}
                {grouped && hovered && (
                  <div style={{ color: C.textFaint, fontSize: 10, textAlign: "center", marginTop: 2 }}>{formatTime(m.created_at)}</div>
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                {!grouped && (
                  <div style={{ marginBottom: 2 }}>
                    {!isMe && <span style={{ color: C.text, fontWeight: 600, fontSize: 14.5 }}>{displayName(m.author)}</span>}
                    <span style={{ color: C.textFaint, fontSize: 12, marginLeft: isMe ? 0 : 8, marginRight: isMe ? 8 : 0 }}>{formatTime(m.created_at)}</span>
                    {isMe && <span style={{ color: C.text, fontWeight: 600, fontSize: 14.5 }}>{displayName(m.author)}</span>}
                  </div>
                )}

                {/* 말풍선: 내용 길이에 맞춰 좁게, 최대 폭만 제한 */}
                {m.text && (
                  <div
                    style={{
                      display: "inline-block",
                      maxWidth: "min(480px, 78%)",
                      width: "fit-content",
                      background: isMe ? C.bubbleMe : C.bubbleOther,
                      color: isMe ? C.bubbleMeText : C.bubbleOtherText,
                      borderRadius: 16,
                      padding: "8px 14px",
                      fontSize: 14.5,
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                      textAlign: "left",
                    }}
                  >
                    <MessageBody text={m.text} messageId={m.id} mentionNames={mentionNames} me={currentUser} />
                  </div>
                )}

                {m.image_url &&
                  (m.image_spoiler ? (
                    <SpoilerImage src={m.image_url} onOpen={() => onImageLoad?.(idx)} />
                  ) : (
                    <img
                      src={m.image_url}
                      alt="첨부 이미지"
                      onClick={() => window.open(m.image_url, "_blank")}
                      onLoad={() => onImageLoad?.(idx)}
                      style={{
                        marginTop: 4,
                        width: "100%",
                        maxWidth: 380,
                        minWidth: 180,
                        maxHeight: 380,
                        borderRadius: 14,
                        display: "block",
                        cursor: "pointer",
                        objectFit: "contain",
                        background: C.bgRail,
                      }}
                    />
                  ))}

                {reactions.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      marginTop: -6,
                      flexWrap: "wrap",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {reactions.map((r) => (
                      <button
                        key={r.emoji}
                        onClick={() => onToggleReaction(m, r.emoji)}
                        className="v2-reaction-pop"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          background: C.reactionBg,
                          border: r.mine ? `1.5px solid ${C.blue}` : "1.5px solid transparent",
                          borderRadius: 12,
                          padding: "1px 7px",
                          fontSize: 12,
                          color: C.reactionText,
                          fontWeight: 500,
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(60,64,67,0.2)",
                        }}
                      >
                        <span style={{ fontSize: 12.5 }}>{r.emoji}</span>
                        <span>{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {showToolbar && (
              <div
                className="v2-toolbar-in"
                onMouseEnter={() => setHoveredId(m.id)}
                style={{
                  position: "absolute",
                  top: -14,
                  [isMe ? "right" : "left"]: 48,
                  background: "#fff",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  display: "flex",
                  boxShadow: "0 2px 8px rgba(60,64,67,0.2)",
                  zIndex: 20,
                }}
              >
                <button onClick={() => onReply(m)} title="답글" style={toolBtnStyle}>
                  ↩️
                </button>
                <div style={{ position: "relative" }}>
                  <button onClick={() => setPickerFor(pickerOpen ? null : m.id)} title="반응" style={toolBtnStyle}>
                    🙂
                  </button>
                  {pickerOpen && (
                    <EmojiPicker align={isMe ? "right" : "left"} onPick={(e) => { onToggleReaction(m, e); setPickerFor(null); }} onClose={() => setPickerFor(null)} />
                  )}
                </div>
                {isMe && (
                  <button onClick={() => onDelete(m)} title="삭제" style={{ ...toolBtnStyle, color: C.red }}>
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const toolBtnStyle = {
  background: "transparent",
  border: "none",
  fontSize: 15,
  padding: "7px 9px",
  cursor: "pointer",
};

/* ============================================================
   메시지 입력창
   ============================================================ */
export function MessageInput({
  channelName,
  input,
  onInputChange,
  onSend,
  replyingTo,
  onCancelReply,
  displayName,
  pendingImage,
  onPickImage,
  onCancelImage,
  pendingSpoiler,
  onToggleSpoiler,
  uploading,
  fileInputRef,
  onFileSelected,
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiSuggest, setEmojiSuggest] = useState(null); // :검색어 자동완성
  const [showHelp, setShowHelp] = useState(false); // / 명령어 도움말

  useEffect(() => {
    if (!input) {
      setEmojiSuggest(null);
      setShowHelp(false);
    }
  }, [input]);

  function handleChange(value) {
    onInputChange(value);
    setShowHelp(value.startsWith("/"));

    const m = value.match(/(?:^|\s):([\w가-힣]{1,20})$/);
    if (m) {
      const q = m[1].toLowerCase();
      const list = EMOJI_LIST.filter((item) => item.names.some((n) => n.toLowerCase().includes(q))).slice(0, 24);
      setEmojiSuggest(list.length > 0 ? { list } : null);
    } else {
      setEmojiSuggest(null);
    }
  }

  function insertEmoji(emoji) {
    onInputChange(input.replace(/:[\w가-힣]{1,20}$/, emoji));
    setEmojiSuggest(null);
  }

  function runCommand(raw) {
    const [cmd, ...rest] = raw.slice(1).split(" ");
    const arg = rest.join(" ");
    switch (cmd) {
      case "spoiler":
        onInputChange(`<${arg}>`);
        return true;
      case "shrug":
        onInputChange(`${arg} ¯\\_(ツ)_/¯`.trim());
        return true;
      case "clear":
        onInputChange("");
        setShowHelp(false);
        return true;
      case "help":
        onInputChange("");
        setShowHelp(true);
        return true;
      default:
        return false;
    }
  }

  return (
    <div style={{ padding: "10px 24px 20px", position: "relative" }}>
      {/* / 명령어 도움말 */}
      {showHelp && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: 24,
            right: 24,
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 8,
            boxShadow: "0 2px 12px rgba(60,64,67,0.25)",
            border: `1px solid ${C.border}`,
            maxHeight: 320,
            overflowY: "auto",
            zIndex: 40,
          }}
        >
          <div style={{ color: C.text, fontWeight: 600, fontSize: 14, marginBottom: 10 }}>명령어 &amp; 사용법</div>
          {[
            ["/help", "이 도움말 보기"],
            ["/spoiler 내용", "스포일러로 감싸기"],
            ["/shrug", "¯\\_(ツ)_/¯ 붙이기"],
            ["/clear", "입력창 비우기"],
          ].map(([cmd, desc]) => (
            <div key={cmd} style={{ display: "flex", gap: 10, marginBottom: 5, fontSize: 13 }}>
              <code style={{ color: C.blue, minWidth: 120 }}>{cmd}</code>
              <span style={{ color: C.textSub }}>{desc}</span>
            </div>
          ))}
          <div style={{ color: C.text, fontWeight: 600, fontSize: 14, margin: "14px 0 8px", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            채팅 문법
          </div>
          {[
            ["<내용>", "스포일러 (클릭하면 열림, Tab으로 전체 보기)"],
            ["@이름", "멘션"],
            ["**굵게**", "굵은 글씨"],
            ["*기울임*", "기울인 글씨"],
            ["~~취소선~~", "취소선"],
            ["`코드`", "인라인 코드"],
            ["# 제목", "제목 (1~6단계)"],
            ["- 목록", "글머리 목록"],
            ["> 인용", "인용문"],
            [":검색어", "이모지 찾기 (Enter로 바로 삽입)"],
          ].map(([syntax, desc]) => (
            <div key={syntax} style={{ display: "flex", gap: 10, marginBottom: 5, fontSize: 13 }}>
              <code style={{ color: C.yellow, minWidth: 120 }}>{syntax}</code>
              <span style={{ color: C.textSub }}>{desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* : 이모지 자동완성 */}
      {emojiSuggest && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: 24,
            background: "#fff",
            borderRadius: 12,
            padding: 8,
            marginBottom: 8,
            boxShadow: "0 2px 12px rgba(60,64,67,0.25)",
            border: `1px solid ${C.border}`,
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 2,
            zIndex: 40,
          }}
        >
          {emojiSuggest.list.map((item) => (
            <button
              key={item.e}
              onClick={() => insertEmoji(item.e)}
              title={item.names.join(", ")}
              style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", padding: "6px 8px", borderRadius: 6 }}
              onMouseEnter={(ev) => (ev.currentTarget.style.background = C.bgHover)}
              onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
            >
              {item.e}
            </button>
          ))}
        </div>
      )}

      {replyingTo && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: C.bgRail,
            borderRadius: "10px 10px 0 0",
            padding: "8px 14px",
            fontSize: 13,
            color: C.textSub,
          }}
        >
          <span>
            <b style={{ color: C.text }}>{displayName(replyingTo.author)}</b>에게 답장
          </span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.textFaint }}>
            {replyingTo.text || (replyingTo.image_url ? "[사진]" : "")}
          </span>
          <button onClick={onCancelReply} style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer" }}>
            ✕
          </button>
        </div>
      )}

      {pendingImage && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.bgRail, borderRadius: 10, padding: 10, marginTop: replyingTo ? 0 : 8 }}>
          <img src={pendingImage.previewUrl} alt="미리보기" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }} />
          <div style={{ flex: 1, fontSize: 13, color: C.textSub }}>{pendingImage.file.name}</div>
          <button
            onClick={onToggleSpoiler}
            style={{
              background: pendingSpoiler ? C.blue : "#fff",
              color: pendingSpoiler ? "#fff" : C.textSub,
              border: `1px solid ${pendingSpoiler ? C.blue : C.border}`,
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            🙈 스포일러{pendingSpoiler ? " ✓" : ""}
          </button>
          <button onClick={onCancelImage} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
            취소
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          border: `1px solid ${C.border}`,
          borderRadius: replyingTo ? "0 0 24px 24px" : 24,
          padding: "6px 10px",
          marginTop: replyingTo ? 0 : 0,
          boxShadow: "0 1px 3px rgba(60,64,67,0.12)",
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={onFileSelected} style={{ display: "none" }} />
        <button onClick={() => fileInputRef.current?.click()} title="사진 첨부" style={{ ...iconBtnStyle }}>
          📎
        </button>

        <input
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowHelp(false);
              setEmojiSuggest(null);
              return;
            }
            if (e.key !== "Enter" || e.shiftKey) return;

            // 이모지 자동완성이 떠 있으면 Enter로 첫 항목 바로 확정
            if (emojiSuggest?.list?.length) {
              e.preventDefault();
              insertEmoji(emojiSuggest.list[0].e);
              return;
            }
            // "/" 명령어면 실행하고 전송하지 않음
            if (input.startsWith("/") && runCommand(input)) {
              e.preventDefault();
              return;
            }
            e.preventDefault();
            onSend();
          }}
          placeholder={uploading ? "이미지 업로드 중..." : `#${channelName}에 메시지 보내기  ( / 입력하면 도움말 )`}
          disabled={uploading}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14.5, padding: "9px 6px", fontFamily: C.font, color: C.text, background: "transparent" }}
        />

        <div style={{ position: "relative" }}>
          <button onClick={() => setShowEmoji((v) => !v)} title="이모지" style={iconBtnStyle}>
            🙂
          </button>
          {showEmoji && (
            <EmojiPicker
              align="right"
              onPick={(e) => {
                onInputChange(input + e);
                setShowEmoji(false);
              }}
              onClose={() => setShowEmoji(false)}
            />
          )}
        </div>

        <button
          onClick={onSend}
          disabled={uploading || (!input.trim() && !pendingImage)}
          style={{
            background: "transparent",
            border: "none",
            color: (input.trim() || pendingImage) && !uploading ? C.blue : C.textFaint,
            fontWeight: 600,
            fontSize: 13.5,
            cursor: (input.trim() || pendingImage) && !uploading ? "pointer" : "default",
            padding: "8px 14px",
          }}
        >
          {uploading ? "전송 중" : "전송"}
        </button>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  background: "transparent",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  color: C.textSub,
};
