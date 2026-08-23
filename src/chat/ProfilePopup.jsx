import React, { useEffect, useRef } from "react";
import { C, Avatar } from "./helpers.jsx";

/* ============================================================
   프로필 팝업 — 채팅에서 아바타/이름을 클릭하면 뜨는 상세 카드
   ============================================================ */
export default function ProfilePopup({ name, displayName, avatarUrl, color, online, lastSeen, isAdmin, onClose, onMention }) {
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const lastSeenText = (() => {
    if (online) return "온라인";
    if (!lastSeen) return "오프라인";
    const diffMin = Math.round((Date.now() - new Date(lastSeen).getTime()) / 60000);
    if (diffMin < 60) return `${diffMin}분 전 활동`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}시간 전 활동`;
    return `${Math.round(diffHr / 24)}일 전 활동`;
  })();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(32,33,36,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 95 }}>
      <div
        ref={ref}
        className="v2-toolbar-in"
        style={{
          width: 320,
          maxWidth: "90vw",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
          overflow: "hidden",
          fontFamily: C.font,
        }}
      >
        {/* 배경 배너 */}
        <div style={{ height: 72, background: `linear-gradient(135deg, ${color}, ${color}cc)` }} />

        <div style={{ padding: "0 22px 22px", marginTop: -40 }}>
          <div style={{ position: "relative", width: 76, marginBottom: 12 }}>
            <div style={{ border: "4px solid #fff", borderRadius: "50%", width: 76, height: 76, boxSizing: "border-box", overflow: "hidden" }}>
              <Avatar url={avatarUrl} color={color} label={displayName} size={68} />
            </div>
            <span
              style={{
                position: "absolute",
                right: 2,
                bottom: 2,
                width: 15,
                height: 15,
                borderRadius: "50%",
                background: online ? C.green : "#bdc1c6",
                border: "3px solid #fff",
                boxSizing: "content-box",
              }}
            />
          </div>

          <div style={{ fontSize: 19, fontWeight: 600, color: C.text }}>{displayName}</div>
          <div style={{ fontSize: 13.5, color: C.textFaint, marginTop: 2 }}>@{name}</div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: online ? C.green : "#bdc1c6" }} />
            <span style={{ color: online ? C.green : C.textFaint }}>{lastSeenText}</span>
            {isAdmin && (
              <span style={{ marginLeft: "auto", background: "#e8f0fe", color: C.blue, fontSize: 11.5, fontWeight: 600, padding: "3px 8px", borderRadius: 8 }}>관리자</span>
            )}
          </div>

          {onMention && (
            <button
              onClick={() => {
                onMention(name);
                onClose();
              }}
              style={{
                width: "100%",
                marginTop: 18,
                padding: "10px 0",
                borderRadius: 20,
                border: `1px solid ${C.border}`,
                background: "#fff",
                color: C.text,
                fontSize: 13.5,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: C.font,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              @{name} 멘션하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
