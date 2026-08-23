import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import DiagBoundary from "./DiagBoundary.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <DiagBoundary>
    <App />
  </DiagBoundary>
);

// 여기까지 왔다는 건 렌더링 호출 자체는 성공했다는 뜻.
// 그래도 화면에 안 보인다면 root 바깥의 다른 요소(예: 로딩 오버레이)가
// 남아있는 경우이므로, 성공 시 확실히 걷어낸다.
requestAnimationFrame(() => {
  const stuck = document.getElementById("pre-fallback");
  if (stuck) stuck.remove();
});
