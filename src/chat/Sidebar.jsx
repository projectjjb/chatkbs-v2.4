import React, { useState } from "react";
import { C, Avatar, isOnline } from "./helpers.jsx";

/* ============================================================
   왼쪽 아이콘 레일 (서버 전환: 채팅 / 문서 / 게임)
   ============================================================ */
export function IconRail({ currentView, onChangeView, serverInitial }) {
  const items = [
    { id: "chat", label: serverInitial || "C", isChat: true },
    {
      id: "docs",
      label: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="13" y2="17" />
        </svg>
      ),
    },
    {
      id: "game",
      label: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="3" />
          <line x1="7" y1="12" x2="11" y2="12" />
          <line x1="9" y1="10" x2="9" y2="14" />
          <circle cx="16" cy="11" r="1" fill="currentColor" />
          <circle cx="18.5" cy="13.5" r="1" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        width: 68,
        background: C.bgRail,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 14,
        gap: 8,
        flexShrink: 0,
      }}
    >
      {items.map((item) => {
        const active = currentView === item.id;
        return (
          <div
            key={item.id}
            onClick={() => onChangeView(item.id)}
            title={item.id}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: active ? C.blue : "#fff",
              color: active ? "#fff" : C.textSub,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: active ? "none" : "0 1px 2px rgba(60,64,67,0.15)",
              transition: "all 0.15s",
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   채널 사이드바 (가운데 칸)
   ============================================================ */
export function ChannelSidebar({
  serverName,
  onEditServerName,
  channels,
  activeChannel,
  onSelectChannel,
  onlineUsers,
  currentUser,
  displayName,
  userAvatar,
  userColor,
  profileMap,
  onOpenSettings,
  isAdmin,
  onOpenAdmin,
  myAvatarUrl,
  myColor,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(serverName);

  function commitName() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== serverName) onEditServerName(draft.trim());
  }

  const online = onlineUsers.filter((u) => u.online);
  const offline = onlineUsers.filter((u) => !u.online);

  return (
    <div
      style={{
        width: 300,
        background: C.bgSide,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* 서버 이름 */}
      <div
        onClick={() => {
          if (!editing) {
            setDraft(serverName);
            setEditing(true);
          }
        }}
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          borderBottom: `1px solid ${C.border}`,
          cursor: editing ? "default" : "pointer",
          flexShrink: 0,
        }}
      >
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === "Enter" && commitName()}
            maxLength={30}
            style={{
              width: "100%",
              fontSize: 17,
              fontWeight: 500,
              color: C.text,
              border: "none",
              outline: `1px solid ${C.blue}`,
              borderRadius: 4,
              padding: "4px 6px",
              fontFamily: C.font,
            }}
          />
        ) : (
          <span style={{ fontSize: 17, fontWeight: 500, color: C.text }}>{serverName}</span>
        )}
      </div>

      {/* 채널 목록 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
        <div
          style={{
            color: C.textFaint,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            padding: "6px 10px",
            textTransform: "uppercase",
          }}
        >
          채널
        </div>
        {channels.map((c) => {
          const active = activeChannel === c.id;
          return (
            <div
              key={c.id}
              onClick={() => onSelectChannel(c.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 12px",
                borderRadius: 8,
                marginBottom: 2,
                cursor: "pointer",
                background: active ? C.bgActive : "transparent",
                color: active ? C.blueDark : C.text,
                fontSize: 14.5,
                fontWeight: active ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = C.bgHover;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ color: active ? C.blueDark : C.textFaint, fontSize: 16 }}>#</span>
              {c.name}
            </div>
          );
        })}

        {/* 온라인 사용자 */}
        {onlineUsers.length > 0 && (
          <>
            <div
              style={{
                color: C.textFaint,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.5,
                padding: "16px 10px 6px",
                textTransform: "uppercase",
              }}
            >
              온라인 — {online.length}
            </div>
            {online.map((u) => (
              <UserRow key={u.name} u={u} />
            ))}
            {offline.length > 0 && (
              <>
                <div
                  style={{
                    color: C.textFaint,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    padding: "16px 10px 6px",
                    textTransform: "uppercase",
                  }}
                >
                  오프라인 — {offline.length}
                </div>
                {offline.map((u) => (
                  <UserRow key={u.name} u={u} dim />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {isAdmin && (
        <div style={{ padding: "0 12px 8px" }}>
          <button
            onClick={onOpenAdmin}
            style={{
              width: "100%",
              padding: "9px 0",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: "#fff",
              color: C.text,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: C.font,
            }}
          >
            🛡️ 관리자 패널
          </button>
        </div>
      )}

      {/* 내 프로필 */}
      <div
        onClick={onOpenSettings}
        style={{
          height: 60,
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 10,
          cursor: "pointer",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Avatar url={myAvatarUrl} color={myColor || avatarColorFallback(currentUser)} label={displayName(currentUser)} size={34} online showStatus />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayName(currentUser)}
          </div>
          <div style={{ fontSize: 11.5, color: C.green }}>온라인{isAdmin ? " · 관리자" : ""}</div>
        </div>
        <span style={{ marginLeft: "auto", color: C.textFaint, fontSize: 16 }}>⚙</span>
      </div>
    </div>
  );
}

function avatarColorFallback(name) {
  return "#1a73e8";
}

function UserRow({ u, dim }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 10px",
        borderRadius: 8,
        opacity: dim ? 0.55 : 1,
      }}
    >
      <Avatar url={u.avatarUrl} color={u.color} label={u.display} size={26} online={u.online} showStatus />
      <span style={{ fontSize: 13.5, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {u.display}
      </span>
    </div>
  );
}
