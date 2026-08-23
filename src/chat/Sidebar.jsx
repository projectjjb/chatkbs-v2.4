import React, { useState } from "react";
import { C, Avatar } from "./helpers.jsx";
import { IconHome, IconShield, IconGear, IconGrid, IconDoc, IconGame, IconEdit } from "./icons.jsx";

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
    <div style={{ width: 32, height: 32, borderRadius: 8, background: bg || "#e8eaed", color: "#5f6368", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {children}
    </div>
  );
}

/* ============================================================
   통합 사이드바
   ============================================================ */
export function ChannelSidebar({
  serverName,
  onEditServerName,
  channels,
  activeChannel,
  currentView,
  onSelectChannel,
  onChangeView,
  onRenameChannel,
  onReorderChannels,
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
  const [editingChannelId, setEditingChannelId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  function handleDrop(targetId) {
    if (dragId == null || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const ids = channels.map((c) => c.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const reordered = [...channels];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    onReorderChannels?.(reordered);
    setDragId(null);
    setDragOverId(null);
  }
  const [channelDraft, setChannelDraft] = useState("");

  function commitName() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== serverName) onEditServerName(draft.trim());
  }

  function startRenameChannel(c) {
    setEditingChannelId(c.id);
    setChannelDraft(c.name);
  }

  function commitChannelRename(c) {
    setEditingChannelId(null);
    const trimmed = channelDraft.trim();
    if (trimmed && trimmed !== c.name) onRenameChannel?.(c.id, trimmed);
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

      {/* 카드 버튼 */}
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
          <span style={{ color: C.textSub, display: "flex" }}>{isAdmin ? <IconShield width={16} height={16} /> : <IconGear width={16} height={16} />}</span>
          {isAdmin ? "관리자 패널" : "설정"}
        </button>
      </div>

      {/* 바로가기 — 홈은 실제로 홈 화면으로 이동 */}
      <div style={{ padding: "2px 8px 4px" }}>
        <SectionHeader label="바로가기" />
        <ShortcutRow icon={<IconHome width={17} height={17} />} label="홈" active={currentView === "home"} onClick={() => onChangeView("home")} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}>
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

        {/* 스페이스 — 더블클릭하면 이름을 그 자리에서 바꿀 수 있음 */}
        <SectionHeader label="스페이스" />

        {channels.map((c) => {
          const active = currentView === "chat" && activeChannel === c.id;
          const isEditing = editingChannelId === c.id;
          return (
            <SpaceRow
              key={c.id}
              active={active}
              editing={isEditing}
              editValue={channelDraft}
              onEditChange={setChannelDraft}
              onEditCommit={() => commitChannelRename(c)}
              onEditCancel={() => setEditingChannelId(null)}
              onDoubleClick={() => startRenameChannel(c)}
              onRenameClick={() => startRenameChannel(c)}
              draggable={!isEditing}
              isDragging={dragId === c.id}
              isDragOver={dragOverId === c.id && dragId !== c.id}
              onDragStart={() => setDragId(c.id)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverId(c.id);
              }}
              onDragLeave={() => setDragOverId((prev) => (prev === c.id ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(c.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setDragOverId(null);
              }}
              icon={
                <SpaceIcon>
                  <span style={{ color: "#5f6368" }}>
                    <IconGrid />
                  </span>
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
                <IconDoc width={16} height={16} />
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
                <IconGame width={16} height={16} />
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
        <span style={{ marginLeft: "auto", color: C.textFaint, display: "flex" }}>
          <IconGear width={16} height={16} />
        </span>
      </div>
    </div>
  );
}

function SectionHeader({ label }) {
  return <div style={{ color: C.textSub, fontSize: 13, fontWeight: 500, padding: "10px 10px 4px" }}>{label}</div>;
}

function ShortcutRow({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: active ? C.bgActive : "transparent" }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = C.bgHover;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ width: 20, display: "flex", justifyContent: "center", color: active ? C.blueDark : C.textSub }}>{icon}</span>
      <span style={{ fontSize: 14, color: active ? C.blueDark : C.text, fontWeight: active ? 600 : 400 }}>{label}</span>
    </div>
  );
}

function SpaceRow({
  active,
  icon,
  label,
  onClick,
  editing,
  editValue,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onDoubleClick,
  onRenameClick,
  draggable,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={editing ? undefined : onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={onDoubleClick ? "더블클릭하면 이름을 바꿀 수 있어요 · 드래그해서 순서를 바꿀 수 있어요" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "7px 10px",
        borderRadius: 8,
        marginBottom: 1,
        cursor: editing ? "default" : draggable ? "grab" : "pointer",
        background: active ? C.bgActive : "transparent",
        opacity: isDragging ? 0.4 : 1,
        borderTop: isDragOver ? `2px solid ${C.blue}` : "2px solid transparent",
        transition: "opacity 0.12s ease",
      }}
      onMouseEnterCapture={(e) => {
        if (!active && !editing) e.currentTarget.style.background = C.bgHover;
      }}
      onMouseLeaveCapture={(e) => {
        if (!active && !editing) e.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      {editing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={onEditCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEditCommit();
            if (e.key === "Escape") onEditCancel();
          }}
          maxLength={24}
          style={{ flex: 1, fontSize: 14, border: "none", outline: `1px solid ${C.blue}`, borderRadius: 4, padding: "2px 6px", fontFamily: C.font, background: "#fff" }}
        />
      ) : (
        <>
          <span style={{ flex: 1, fontSize: 14, color: active ? C.blueDark : C.text, fontWeight: active ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
          {onRenameClick && hover && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRenameClick();
              }}
              title="이름 바꾸기"
              style={{ background: "none", border: "none", cursor: "pointer", color: C.textFaint, padding: 2, display: "flex", flexShrink: 0 }}
            >
              <IconEdit width={13} height={13} />
            </button>
          )}
        </>
      )}
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
