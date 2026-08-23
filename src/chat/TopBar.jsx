import React, { useState, useRef, useEffect } from "react";
import { C, Avatar } from "./helpers.jsx";
import { IconMenu, IconSearch, IconHelp, IconGear, IconExpand, IconApps, IconDoc, IconGame, IconX, IconChevronDown } from "./icons.jsx";

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
   상단 전체폭 헤더바
   - 검색: 실제로 채널/메시지를 필터링해서 결과 드롭다운으로 보여줌
   - 도움말: 실제 도움말 패널
   - 설정: 실제 SettingsModal 오픈
   - 앱그리드: 우리 서비스 안의 문서/게임으로 바로가기
   ============================================================ */
export default function TopBar({
  currentUser,
  displayName,
  avatarUrl,
  color,
  schoolLabel,
  onSearchResults, // (results) => void — 검색 결과 클릭 시 상위로 전달
  channels,
  messages,
  onOpenSettings,
  onGoHome,
  onGoDocs,
  onGoGame,
}) {
  const [status, setStatus] = useState("away");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const menuRef = useRef(null);
  const helpRef = useRef(null);
  const appsRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowStatusMenu(false);
      if (helpRef.current && !helpRef.current.contains(e.target)) setShowHelp(false);
      if (appsRef.current && !appsRef.current.contains(e.target)) setShowApps(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = STATUS_OPTIONS.find((s) => s.id === status);

  // 실제 검색: 채널 이름 + 메시지 텍스트/작성자 안에서 찾는다
  const q = query.trim().toLowerCase();
  const channelHits = q ? (channels || []).filter((c) => c.name.toLowerCase().includes(q)) : [];
  const messageHits = q
    ? (messages || [])
        .filter((m) => m.text && (m.text.toLowerCase().includes(q) || displayName(m.author).toLowerCase().includes(q)))
        .slice(-8)
        .reverse()
    : [];
  const hasResults = channelHits.length > 0 || messageHits.length > 0;

  return (
    <div style={{ height: 56, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: "#fff", flexShrink: 0 }}>
      {/* 왼쪽: 메뉴 + 로고 (홈으로 이동) */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button onClick={onGoHome} style={menuIconStyle} title="홈">
          <IconMenu style={{ color: "#5f6368" }} />
        </button>
        <div onClick={onGoHome} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <ChatLogoSmall />
          <span style={{ fontSize: 20, color: C.text, fontFamily: "'Google Sans', Roboto, arial, sans-serif" }}>Chat</span>
        </div>
      </div>

      {/* 가운데: 실제 동작하는 검색 */}
      <div style={{ flex: 1, maxWidth: 720, margin: "0 auto", position: "relative" }} ref={searchRef}>
        <div style={{ display: "flex", alignItems: "center", background: C.bgRail, borderRadius: 24, padding: "8px 16px", gap: 10 }}>
          <IconSearch style={{ color: "#5f6368", flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="채팅 검색"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14.5, color: C.text, fontFamily: C.font }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setShowResults(false);
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", color: "#5f6368" }}
            >
              <IconX width={14} height={14} />
            </button>
          )}
        </div>

        {showResults && q && (
          <div
            className="v2-toolbar-in"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 6,
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(60,64,67,0.25)",
              border: `1px solid ${C.border}`,
              maxHeight: 380,
              overflowY: "auto",
              zIndex: 60,
              padding: 8,
            }}
          >
            {!hasResults && <div style={{ padding: 14, fontSize: 13.5, color: C.textFaint, textAlign: "center" }}>검색 결과가 없습니다</div>}

            {channelHits.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textFaint, padding: "6px 10px" }}>스페이스</div>
                {channelHits.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSearchResults?.({ type: "channel", channelId: c.id });
                      setShowResults(false);
                      setQuery("");
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ color: C.textFaint }}>#</span>
                    {c.name}
                  </div>
                ))}
              </div>
            )}

            {messageHits.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textFaint, padding: "6px 10px" }}>메시지</div>
                {messageHits.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSearchResults?.({ type: "message", channelId: m.channel_id, messageId: m.id });
                      setShowResults(false);
                      setQuery("");
                    }}
                    style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{displayName(m.author)}</div>
                    <div style={{ fontSize: 13, color: C.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 오른쪽 */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {/* 상태 변경 - 실제로 값이 바뀌고 유지됨 */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setShowStatusMenu((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", borderRadius: 16, padding: "6px 10px", cursor: "pointer", fontSize: 13.5, color: C.text, fontFamily: C.font }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", border: `2px solid ${current.color}`, background: status === "online" ? current.color : "transparent" }} />
            {current.label}
            <IconChevronDown width={12} height={12} style={{ color: C.textFaint }} />
          </button>
          {showStatusMenu && (
            <div className="v2-toolbar-in" style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, background: "#fff", borderRadius: 10, boxShadow: "0 2px 10px rgba(60,64,67,0.3)", border: `1px solid ${C.border}`, minWidth: 170, zIndex: 50, padding: 6 }}>
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

        {/* 도움말 - 실제 안내 패널 */}
        <div style={{ position: "relative" }} ref={helpRef}>
          <IconBtn title="도움말" onClick={() => setShowHelp((v) => !v)}>
            <IconHelp />
          </IconBtn>
          {showHelp && (
            <div className="v2-toolbar-in" style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, background: "#fff", borderRadius: 12, boxShadow: "0 4px 16px rgba(60,64,67,0.25)", border: `1px solid ${C.border}`, width: 300, zIndex: 50, padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 10 }}>도움말</div>
              {[
                ["/help", "명령어 도움말 열기"],
                ["/spoiler 내용", "스포일러로 감싸기"],
                [":검색어", "이모지 찾기"],
                ["Tab 길게 누르기", "모든 스포일러 잠깐 보기"],
                ["@이름", "멘션하기"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <code style={{ color: C.blue, minWidth: 110 }}>{k}</code>
                  <span style={{ color: C.textSub }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 설정 - 실제 SettingsModal 오픈 */}
        <IconBtn title="설정" onClick={onOpenSettings}>
          <IconGear />
        </IconBtn>

        <IconBtn title="확장">
          <IconExpand />
        </IconBtn>

        {/* 앱 그리드 - 우리 서비스의 다른 화면으로 실제 이동 */}
        <div style={{ position: "relative" }} ref={appsRef}>
          <IconBtn title="앱" onClick={() => setShowApps((v) => !v)}>
            <IconApps />
          </IconBtn>
          {showApps && (
            <div className="v2-toolbar-in" style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, background: "#fff", borderRadius: 12, boxShadow: "0 4px 16px rgba(60,64,67,0.25)", border: `1px solid ${C.border}`, width: 200, zIndex: 50, padding: 8 }}>
              <AppMenuItem icon={<IconDoc />} label="공유 문서" onClick={() => { onGoDocs?.(); setShowApps(false); }} />
              <AppMenuItem icon={<IconGame />} label="게임" onClick={() => { onGoGame?.(); setShowApps(false); }} />
            </div>
          )}
        </div>

        {schoolLabel && <span style={{ fontSize: 12.5, color: C.textSub, marginLeft: 4, whiteSpace: "nowrap" }}>{schoolLabel}</span>}
        <Avatar url={avatarUrl} color={color} label={displayName(currentUser)} size={30} />
      </div>
    </div>
  );
}

function AppMenuItem({ icon, label, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 14, color: C.text }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ color: C.textSub, display: "flex" }}>{icon}</span>
      {label}
    </div>
  );
}

function IconBtn({ title, children, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#5f6368" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}

const menuIconStyle = { width: 36, height: 36, borderRadius: "50%", border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
