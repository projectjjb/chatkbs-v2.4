import React from "react";
import AuthGate from "./AuthGate.jsx";

// 단계 2에서 Google Chat UI로 교체될 자리
function ChatPlaceholder({ user }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Google Sans', Roboto, arial, sans-serif", background: "#f8fafd"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, color: "#202124" }}>로그인 성공</div>
        <div style={{ fontSize: 15, color: "#5f6368", marginTop: 8 }}>
          {user.nickname || user.name}님 환영합니다
          {user.is_admin && <span style={{ color: "#1a73e8" }}> (관리자)</span>}
        </div>
        <div style={{ fontSize: 13, color: "#80868b", marginTop: 20 }}>
          다음 단계에서 Google Chat UI가 여기에 들어갑니다.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AuthGate>{(user) => <ChatPlaceholder user={user} />}</AuthGate>;
}
