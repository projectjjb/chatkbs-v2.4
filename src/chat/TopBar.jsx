import React, { useState, useRef, useEffect } from "react";
import { C, Avatar } from "./helpers.jsx";

function ChatLogoSmall() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#1ba672" />
      <circle cx="8" cy="10.5" r="1.4" fill="#fff" />
      <circle cx="12" cy="10.5" r="1.4" fill="#fff" />
      <circle cx="16" cy="10.5" r="1.4" fill="#fff" />
    </svg>
  );
}

const STATUS_OPTIONS = [
  { id: "away", label: "부재중", color: "#f9ab00" },
  { id: "online", label: "온라인", color: "#1e8e3e" },
  { id: "dnd", label: "다른 용무 중", color: "#d93025" },
];

/* ============================================================
   상단 전체폭 헤더바 (사진 3 구조 그대로)
   ============================================================ */
export default function TopBar({ currentUser, displayName, avatarUrl, color, schoolLabel, onSearch }) {
  const [status, setStatus] = useState("away");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowStatusMenu(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = STATUS_OPTIONS.find((s) => s.id === status);

  return (
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 16,
        borderBottom: `1px solid ${C.border}`,
        background: "#fff",
        flexShrink: 0,
      }}
    >
      {/* 왼쪽: 메뉴 + 로고 */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button style={menuIconStyle} title="메뉴">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ChatLogoSmall />
          <span style={{ fontSize: 20, color: C.text, fontFamily: "'Google Sans', Roboto, arial, sans-serif" }}>Chat</span>
        </div>
      </div>

      {/* 가운데: 검색창 */}
      <div style={{ flex: 1, maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", background: C.bgRail, borderRadius: 24, padding: "8px 16px", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="채팅 검색"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14.5, color: C.text, fontFamily: C.font }}
          />
        </div>
      </div>

      {/* 오른쪽: 상태 + 아이콘들 + 프로필 */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setShowStatusMenu((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              borderRadius: 16,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 13.5,
              color: C.text,
              fontFamily: C.font,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", border: `2px solid ${current.color}`, background: status === "online" ? current.color : "transparent" }} />
            {current.label}
            <span style={{ fontSize: 10, color: C.textFaint }}>▾</span>
          </button>
          {showStatusMenu && (
            <div
              className="v2-toolbar-in"
              style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, background: "#fff", borderRadius: 10, boxShadow: "0 2px 10px rgba(60,64,67,0.3)", border: `1px solid ${C.border}`, minWidth: 170, zIndex: 50, padding: 6 }}
            >
              {STATUS_OPTIONS.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setStatus(s.id);
                    setShowStatusMenu(false);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13.5, color: C.text }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                  {s.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <IconBtn title="도움말">?</IconBtn>
        <IconBtn title="설정">⚙</IconBtn>
        <IconBtn title="확장">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2">
            <polyline points="7 7 3 12 7 17" />
            <polyline points="17 7 21 12 17 17" />
          </svg>
        </IconBtn>
        <IconBtn title="Google 앱">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="#5f6368">
            <circle cx="2" cy="2" r="1.4" /><circle cx="8" cy="2" r="1.4" /><circle cx="14" cy="2" r="1.4" />
            <circle cx="2" cy="8" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="14" cy="8" r="1.4" />
            <circle cx="2" cy="14" r="1.4" /><circle cx="8" cy="14" r="1.4" /><circle cx="14" cy="14" r="1.4" />
          </svg>
        </IconBtn>

        {schoolLabel && <span style={{ fontSize: 12.5, color: C.textSub, marginLeft: 4, whiteSpace: "nowrap" }}>{schoolLabel}</span>}
        <Avatar url={avatarUrl} color={color} label={displayName(currentUser)} size={30} />
      </div>
    </div>
  );
}

function IconBtn({ title, children }) {
  return (
    <button
      title={title}
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: "none",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#5f6368",
        fontSize: 15,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}

const menuIconStyle = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
