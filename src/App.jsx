import React from "react";
import AuthGate from "./AuthGate.jsx";
import ChatApp from "./chat/ChatApp.jsx";

export default function App() {
  return <AuthGate>{(user) => <ChatApp user={user} />}</AuthGate>;
}
