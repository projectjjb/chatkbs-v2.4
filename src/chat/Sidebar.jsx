import React, { useState } from "react";
import { C, Avatar } from "./helpers.jsx";

/* ============================================================
   Google Chat 로고 (헤더용, 초록 말풍선)
   ============================================================ */
function ChatLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#1ba672" />
      <circle cx="8" cy="10.5" r="1.4" fill="#fff" />
      <circle cx="12" cy="10.5" r="1.4" fill="#fff" />
      <circle cx="16" cy="10.5" r="1.4" fill="#fff" />
    </svg>
  );
}

function SpaceIcon({ children, bg }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: bg || "#e8eaed",
        color: "#5f6368",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

const GridDots = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="6" rx="1.5" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
  </svg>
);

const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const GameIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <line x1="7" y1="12" x2="11" y2="12" />
    <line x1="9" y1="10" x2="9" y2="14" />
    <circle cx="16" cy="11" r="1" fill="currentColor" />
    <circle cx="18.5" cy="13.5" r="1" fill="currentColor" />
  </svg>
);

/* ============================================================
   통합 사이드바 (사진 구조: 헤더 / 카드버튼 / 사용자목록 / 스페이스 / 내프로필)
   ============================================================ */
export function ChannelSidebar({
  serverName,
  onEditServerName,
  channels,
  activeChannel,
  currentView,
  onSelectChannel,
  onChangeView,
  onlineUsers,
  currentUser,
  displayName,
  isAdmin,
  onOpenAdmin,
  onOpenSettings,
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
    <div style={{ width: 300, background: C.bgSide, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      {/* 헤더: 로고 + 서버 이름(클릭해서 수정) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px 10px" }}>
        <ChatLogo />
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === "Enter" && commitName()}
            maxLength={30}
            style={{ flex: 1, fontSize: 20, fontWeight: 500, color: C.text, border: "none", outline: `1px solid ${C.blue}`, borderRadius: 4, padding: "2px 6px", fontFamily: C.font }}
          />
        ) : (
          <span
            onClick={() => {
              setDraft(serverName);
              setEditing(true);
            }}
            title="클릭해서 이름 수정"
            style={{ fontSize: 20, fontWeight: 500, color: C.text, cursor: "pointer" }}
          >
            {serverName}
          </span>
        )}
      </div>

      {/* 알약 모양 카드 버튼 (사진의 "+새 채팅" 자리) */}
      <div style={{ padding: "6px 14px 14px" }}>
        <button
          onClick={isAdmin ? onOpenAdmin : onOpenSettings}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "11px 0",
            borderRadius: 20,
            border: "none",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(60,64,67,0.25)",
            color: C.text,
            fontSize: 14.5,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: C.font,
          }}
        >
          <span style={{ fontSize: 16 }}>{isAdmin ? "🛡️" : "⚙️"}</span>
          {isAdmin ? "관리자 패널" : "설정"}
        </button>
      </div>

      {/* 바로가기 (사진 구조: 홈/멘션/별표표시함에 해당하는 자리) */}
      <div style={{ padding: "2px 8px 4px" }}>
        <SectionHeader label="바로가기" />
        <ShortcutRow icon="🏠" label="홈" active onClick={() => onChangeView("chat")} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}>
        {/* 온라인/오프라인 사용자 목록 (사진의 "채팅 메시지" DM 목록에 해당) */}
        {onlineUsers.length > 0 && (
          <>
            <SectionHeader label="채팅 메시지" />
            {online.map((u) => (
              <UserRow key={u.name} u={u} />
            ))}
            {offline.map((u) => (
              <UserRow key={u.name} u={u} dim />
            ))}
            <div style={{ height: 6 }} />
          </>
        )}

        {/* 스페이스 (채널 + 문서 + 게임) */}
        <SectionHeader label="스페이스" />

        {channels.map((c) => {
          const active = currentView === "chat" && activeChannel === c.id;
          return (
            <SpaceRow
              key={c.id}
              active={active}
              icon={
                <SpaceIcon>
                  <GridDots />
                </SpaceIcon>
              }
              label={c.name}
              onClick={() => {
                onChangeView("chat");
                onSelectChannel(c.id);
              }}
            />
          );
        })}
        <SpaceRow
          active={currentView === "docs"}
          icon={
            <SpaceIcon bg="#e3f2fd">
              <span style={{ color: "#1967d2" }}>
                <DocIcon />
              </span>
            </SpaceIcon>
          }
          label="공유 문서"
          onClick={() => onChangeView("docs")}
        />
        <SpaceRow
          active={currentView === "game"}
          icon={
            <SpaceIcon bg="#fce8e6">
              <span style={{ color: "#d93025" }}>
                <GameIcon />
              </span>
            </SpaceIcon>
          }
          label="게임"
          onClick={() => onChangeView("game")}
        />
      </div>

      {/* 내 프로필 */}
      <div
        onClick={onOpenSettings}
        style={{ height: 60, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 10, cursor: "pointer", flexShrink: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Avatar url={myAvatarUrl} color={myColor} label={displayName(currentUser)} size={34} online showStatus />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName(currentUser)}</div>
          <div style={{ fontSize: 11.5, color: C.green }}>온라인{isAdmin ? " · 관리자" : ""}</div>
        </div>
        <span style={{ marginLeft: "auto", color: C.textFaint, fontSize: 16 }}>⚙</span>
      </div>
    </div>
  );
}

function SectionHeader({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.textSub, fontSize: 13, fontWeight: 500, padding: "10px 10px 4px" }}>
      <span style={{ fontSize: 10, color: C.textFaint }}>▾</span>
      {label}
    </div>
  );
}

function ShortcutRow({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "8px 10px",
        borderRadius: 8,
        cursor: "pointer",
        background: active ? C.bgActive : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = C.bgHover;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: 17, width: 20, textAlign: "center" }}>{icon}</span>
      <span style={{ fontSize: 14, color: active ? C.blueDark : C.text, fontWeight: active ? 600 : 400 }}>{label}</span>
    </div>
  );
}

function SpaceRow({ active, icon, label, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 10px", borderRadius: 8, marginBottom: 1, cursor: "pointer", background: active ? C.bgActive : "transparent" }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = C.bgHover;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      <span style={{ fontSize: 14, color: active ? C.blueDark : C.text, fontWeight: active ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

function UserRow({ u, dim }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 10px", borderRadius: 8, opacity: dim ? 0.55 : 1 }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Avatar url={u.avatarUrl} color={u.color} label={u.display} size={30} online={u.online} showStatus />
      <span style={{ fontSize: 14, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.display}</span>
    </div>
  );
}
