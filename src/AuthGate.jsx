import React, { useState, useEffect, useRef } from "react";

// ============================================
//  Supabase 설정 — 새 프로젝트 값으로 교체하세요
// ============================================
export const SUPABASE_URL = "https://oelncvszshshowfpkjjj.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbG5jdnN6c2hzaG93ZnBrampqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NTk4OTEsImV4cCI6MjEwMzAzNTg5MX0.3wkI6s2qLie6i2q2GK8l3FO6jpSvm6V47MQh9tWXRXs";

export const SB_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export const CONFIGURED = !SUPABASE_URL.includes("YOUR-PROJECT-ID");

export async function sbSelect(table, query = "") {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?apikey=${SUPABASE_ANON_KEY}&${query}`,
    { headers: SB_HEADERS }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${table} 조회 실패: ${res.status} ${body}`);
  }
  return res.json();
}

export async function sbInsert(table, body) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?apikey=${SUPABASE_ANON_KEY}`,
    {
      method: "POST",
      headers: { ...SB_HEADERS, Prefer: "return=representation" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`${table} 저장 실패: ${res.status} ${err}`);
  }
  return res.json();
}

export async function sbUpdate(table, filter, body) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?apikey=${SUPABASE_ANON_KEY}&${filter}`,
    {
      method: "PATCH",
      headers: { ...SB_HEADERS, Prefer: "return=representation" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`${table} 수정 실패: ${res.status} ${err}`);
  }
  const rows = await res.json();
  if (Array.isArray(rows) && rows.length === 0) {
    throw new Error("변경된 항목이 없습니다 (권한 정책 확인 필요)");
  }
  return rows;
}

export async function sbDelete(table, filter) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?apikey=${SUPABASE_ANON_KEY}&${filter}`,
    { method: "DELETE", headers: SB_HEADERS }
  );
  if (!res.ok) throw new Error(`${table} 삭제 실패: ${res.status}`);
}

// 비밀번호는 평문 대신 해시로 저장
export async function hashPassword(password) {
  const data = new TextEncoder().encode(`${password}::chatv2::salt`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ============================================
//  Google 로고
// ============================================
function GoogleLogo({ size = 92 }) {
  return (
    <svg viewBox="0 0 272 92" style={{ height: size, display: "block" }}>
      <path
        fill="#EA4335"
        d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
      />
      <path
        fill="#FBBC05"
        d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
      />
      <path
        fill="#4285F4"
        d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
      />
      <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z" />
      <path
        fill="#EA4335"
        d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
      />
      <path
        fill="#4285F4"
        d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"
      />
    </svg>
  );
}

// ============================================
//  Google 검색 화면 (위장)
// ============================================
function GoogleSearch({ onSignupOpen, onLogin, onFail }) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(e) {
    e?.preventDefault();
    const v = q.trim();
    if (!v) return;
    setQ("");

    // "password" → 회원가입 팝업
    if (v.toLowerCase() === "password") {
      onSignupOpen();
      return;
    }
    // 그 외에는 로그인 시도 (실패하면 404로 넘어감)
    onLogin(v);
  }

  const linkStyle = {
    color: "#000",
    textDecoration: "none",
    fontSize: 13,
    padding: "0 8px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "arial, sans-serif",
        color: "#202124",
      }}
    >
      {/* 상단 바 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 15px",
          fontSize: 13,
        }}
      >
        <div style={{ display: "flex", gap: 2 }}>
          <span style={linkStyle}>Google 정보</span>
          <span style={linkStyle}>스토어</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={linkStyle}>Gmail</span>
          <span style={linkStyle}>이미지</span>
          <div
            style={{
              width: 40,
              height: 40,
              display: "grid",
              gridTemplateColumns: "repeat(3, 4px)",
              gridTemplateRows: "repeat(3, 4px)",
              gap: 3,
              alignContent: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#5f6368" }} />
            ))}
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#dfe1e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 가운데 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: -60,
          padding: "0 20px",
        }}
      >
        <div style={{ marginBottom: 26 }}>
          <GoogleLogo size={100} />
        </div>

        <form onSubmit={submit} style={{ width: "100%", maxWidth: 584 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 46,
              border: "1px solid #dfe1e5",
              borderRadius: 24,
              padding: "0 8px 0 20px",
              boxShadow: focused ? "0 1px 6px rgba(32,33,36,.28)" : "none",
              transition: "box-shadow 0.2s, border-color 0.2s",
              borderColor: focused ? "transparent" : "#dfe1e5",
              gap: 12,
            }}
          >
            {/* + 아이콘 (사진과 이미지로 검색) */}
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="#5f6368" strokeWidth="2" fill="none" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>

            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 16,
                fontFamily: "arial, sans-serif",
                color: "#202124",
                background: "transparent",
                minWidth: 0,
              }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
              {/* 화상 키보드 */}
              <div style={{ width: 22, height: 22, borderRadius: 4, background: "#202124", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <line x1="6" y1="10" x2="6" y2="10" />
                  <line x1="10" y1="10" x2="10" y2="10" />
                  <line x1="14" y1="10" x2="14" y2="10" />
                  <line x1="18" y1="10" x2="18" y2="10" />
                  <line x1="8" y1="14" x2="16" y2="14" />
                </svg>
              </div>

              {/* 마이크 (구글 4색) */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                <path fill="#34a853" d="M11 18.92h2V22h-2z" />
                <path fill="#fbbc05" d="M7.05 13.9c-.5-.9-.8-1.9-.8-2.9H4.5c0 1.4.4 2.8 1.1 4l1.45-1.1z" />
                <path fill="#ea4335" d="M12 16.5c-1.2 0-2.3-.4-3.2-1.1l-1.45 1.1A6.9 6.9 0 0 0 12 18.5c3.5 0 6.4-2.6 6.4-6.5h-1.75c0 2.6-2 4.5-4.65 4.5z" />
              </svg>

              {/* 카메라(이미지로 검색) */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>

              {/* AI 모드 알약 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f8f9fa",
                  borderRadius: 20,
                  padding: "6px 12px",
                  fontSize: 13,
                  color: "#3c4043",
                  fontFamily: "'Google Sans', arial, sans-serif",
                  cursor: "pointer",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" fill="#4285f4" />
                  <circle cx="19" cy="5" r="1.4" fill="#ea4335" />
                </svg>
                AI 모드
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 29 }}>
            <button
              type="submit"
              style={{
                background: "#f8f9fa",
                border: "1px solid #f8f9fa",
                borderRadius: 4,
                color: "#3c4043",
                fontSize: 14,
                padding: "0 16px",
                height: 36,
                cursor: "pointer",
                fontFamily: "arial, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid #dadce0";
                e.currentTarget.style.boxShadow = "0 1px 1px rgba(0,0,0,.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid #f8f9fa";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Google 검색
            </button>
            <button
              type="submit"
              style={{
                background: "#f8f9fa",
                border: "1px solid #f8f9fa",
                borderRadius: 4,
                color: "#3c4043",
                fontSize: 14,
                padding: "0 16px",
                height: 36,
                cursor: "pointer",
                fontFamily: "arial, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid #dadce0";
                e.currentTarget.style.boxShadow = "0 1px 1px rgba(0,0,0,.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid #f8f9fa";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              I'm Feeling Lucky
            </button>
          </div>
        </form>
      </div>

      {/* 하단 */}
      <div style={{ background: "#f2f2f2", fontSize: 14, color: "#70757a" }}>
        <div style={{ padding: "15px 30px", borderBottom: "1px solid #dadce0" }}>대한민국</div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "15px 30px",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", gap: 30 }}>
            <span>광고</span>
            <span>비즈니스</span>
            <span>검색의 원리</span>
          </div>
          <div style={{ display: "flex", gap: 30 }}>
            <span>개인정보처리방침</span>
            <span>약관</span>
            <span>설정</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
//  Google 404 화면
// ============================================
function Google404() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "arial, sans-serif",
        padding: "30px 40px",
      }}
    >
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", maxWidth: 900 }}>
        <div style={{ flex: "1 1 340px", minWidth: 280 }}>
          <div style={{ marginBottom: 26 }}>
            <GoogleLogo size={40} />
          </div>
          <p style={{ fontSize: 15, color: "#202124", margin: "0 0 22px" }}>
            <b>404.</b> <span style={{ color: "#5f6368" }}>That's an error.</span>
          </p>
          <p style={{ fontSize: 15, color: "#202124", margin: 0, lineHeight: 1.6 }}>
            The requested URL <code>/404</code> was not found on this server.
            <br />
            <span style={{ color: "#5f6368" }}>That's all we know.</span>
          </p>
        </div>

        {/* 부서진 로봇 */}
        <div style={{ flex: "0 0 auto", opacity: 0.9 }}>
          <svg width="240" height="180" viewBox="0 0 240 180" fill="none" stroke="#4285f4" strokeWidth="1.6">
            <rect x="86" y="42" width="62" height="46" rx="3" />
            <rect x="98" y="56" width="38" height="18" rx="2" />
            <circle cx="107" cy="65" r="3" fill="#4285f4" />
            <circle cx="127" cy="65" r="3" fill="#4285f4" />
            <path d="M100 80h34" />
            <path d="M117 42V30" />
            <circle cx="117" cy="26" r="4" />
            <rect x="94" y="96" width="46" height="40" rx="3" />
            <path d="M104 106h26M104 116h26" />
            <path d="M86 62c-10 4-20 2-28-4M148 62c10 4 20 2 28-4" />
            <path d="M58 58l-8-6M50 52l-10 4M182 58l8-6M190 52l10 4" />
            <ellipse cx="46" cy="150" rx="16" ry="7" transform="rotate(-20 46 150)" />
            <ellipse cx="196" cy="146" rx="15" ry="7" transform="rotate(25 196 146)" />
            <ellipse cx="76" cy="160" rx="12" ry="6" transform="rotate(10 76 160)" />
            <ellipse cx="164" cy="162" rx="13" ry="6" transform="rotate(-15 164 162)" />
            <circle cx="120" cy="152" r="5" />
            <circle cx="136" cy="160" r="4" />
            <path d="M92 146l-6 10M100 150l-4 12" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ============================================
//  회원가입 팝업
// ============================================
function SignupModal({ onClose, onDone }) {
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit() {
    setErr("");
    if (!name.trim()) return setErr("이름을 입력해주세요.");
    if (pw.length < 4) return setErr("비밀번호는 4자 이상으로 해주세요.");
    if (pw !== pw2) return setErr("비밀번호가 서로 다릅니다.");

    setSaving(true);
    try {
      const hash = await hashPassword(pw);

      // 같은 비밀번호가 이미 있으면 로그인 구분이 안 되므로 막는다
      const dup = await sbSelect("users", `password_hash=eq.${hash}&select=id`);
      if (dup.length > 0) {
        setErr("이미 사용 중인 비밀번호입니다. 다른 걸로 정해주세요.");
        setSaving(false);
        return;
      }

      // 첫 가입자는 자동으로 관리자 + 승인 상태
      const all = await sbSelect("users", "select=id&limit=1");
      const isFirst = all.length === 0;

      await sbInsert("users", {
        name: name.trim(),
        password_hash: hash,
        status: isFirst ? "approved" : "pending",
        is_admin: isFirst,
      });

      onDone(isFirst);
    } catch (e) {
      setErr(`가입 실패: ${e.message}`);
      setSaving(false);
    }
  }

  const inputStyle = {
    width: "100%",
    marginTop: 6,
    padding: "11px 13px",
    borderRadius: 6,
    border: "1px solid #dadce0",
    outline: "none",
    fontSize: 15,
    fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "#5f6368",
    display: "block",
    marginTop: 14,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(32,33,36,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        fontFamily: "'Google Sans', Roboto, arial, sans-serif",
        animation: "v2fade 0.18s ease",
      }}
    >
      <style>{`
        @keyframes v2fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes v2pop { from { opacity:0; transform: translateY(10px) scale(0.98) } to { opacity:1; transform:none } }
      `}</style>
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          width: 400,
          maxWidth: "90vw",
          padding: "28px 30px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
          animation: "v2pop 0.22s cubic-bezier(0.2,0.8,0.3,1)",
        }}
      >
        <div style={{ marginBottom: 4 }}>
          <GoogleLogo size={26} />
        </div>
        <div style={{ fontSize: 20, color: "#202124", marginTop: 14 }}>계정 만들기</div>
        <div style={{ fontSize: 13, color: "#5f6368", marginTop: 5 }}>
          가입 후 관리자 승인을 받아야 이용할 수 있습니다.
        </div>

        <label style={labelStyle}>이름</label>
        <input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={inputStyle}
        />

        <label style={labelStyle}>비밀번호</label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="4자 이상"
          style={inputStyle}
        />

        <label style={labelStyle}>비밀번호 확인</label>
        <input
          type="password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={inputStyle}
        />

        <div
          style={{
            background: "#fef7e0",
            border: "1px solid #fdd663",
            borderRadius: 6,
            padding: "10px 12px",
            marginTop: 16,
            fontSize: 12,
            color: "#7a5b00",
            lineHeight: 1.6,
          }}
        >
          이 비밀번호가 곧 <b>로그인 수단</b>입니다. 검색창에 이 비밀번호를 입력하면 들어올 수 있어요.
          평소 쓰는 비밀번호는 사용하지 마세요.
        </div>

        {err && (
          <div style={{ color: "#d93025", fontSize: 13, marginTop: 12 }}>{err}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#1a73e8",
              fontSize: 14,
              fontWeight: 500,
              padding: "9px 14px",
              borderRadius: 4,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            취소
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{
              background: saving ? "#a6c8f7" : "#1a73e8",
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              padding: "9px 22px",
              borderRadius: 4,
              cursor: saving ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {saving ? "처리 중..." : "가입"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
//  로딩 (흰 화면 잠깐)
// ============================================
function BlankLoading() {
  return <div style={{ minHeight: "100vh", background: "#fff" }} />;
}

function NotConfigured() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "arial, sans-serif",
        color: "#5f6368",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div>
        <div style={{ fontSize: 18, color: "#202124", marginBottom: 8 }}>
          Supabase 설정이 필요합니다
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7 }}>
          코드 상단의 <code>SUPABASE_URL</code>과 <code>SUPABASE_ANON_KEY</code>를
          <br />
          새 프로젝트 값으로 바꿔주세요.
        </div>
      </div>
    </div>
  );
}

// ============================================
//  최상위 — 위장 레이어 흐름 제어
// ============================================
export default function AuthGate({ children }) {
  // search → loading → notfound → chat
  const [stage, setStage] = useState("search");
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);

  if (!CONFIGURED) return <NotConfigured />;

  // 검색창에 입력된 값으로 로그인 시도
  async function tryLogin(value) {
    setStage("loading");
    try {
      const hash = await hashPassword(value);
      const rows = await sbSelect(
        "users",
        `password_hash=eq.${hash}&select=id,name,status,is_admin,nickname,avatar_url,avatar_color`
      );

      // 승인된 사용자만 통과. 미승인·미존재 모두 똑같이 404로 위장한다.
      if (rows.length > 0 && rows[0].status === "approved") {
        setUser(rows[0]);
        // 로딩을 아주 잠깐 보여준 뒤 입장
        setTimeout(() => setStage("chat"), 180);
        return;
      }
    } catch (e) {
      // 화면은 여전히 404로 위장하되, 개발자 도구 콘솔에는 원인을 남겨서
      // "왜 로그인이 안 되는지" 나중에 추적할 수 있게 한다.
      console.error("[login]", e.message);
    }
    const delay = 100 + Math.random() * 200; // 0.1~0.3초
    setTimeout(() => setStage("notfound"), delay);
  }

  if (stage === "loading") return <BlankLoading />;
  if (stage === "notfound") return <Google404 />;
  if (stage === "chat" && user) {
    return typeof children === "function" ? children(user) : children;
  }

  return (
    <>
      <GoogleSearch
        onSignupOpen={() => setShowSignup(true)}
        onLogin={tryLogin}
        onFail={() => setStage("notfound")}
      />
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onDone={() => setShowSignup(false)}
        />
      )}
    </>
  );
}
