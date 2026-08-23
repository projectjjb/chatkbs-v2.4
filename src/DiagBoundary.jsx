import React from "react";

// 개발자 도구를 못 쓰는 환경(학교 크롬북 등)에서도 원인을 알 수 있도록,
// 렌더링 중 발생한 에러를 화면에 직접 출력한다.
export default class DiagBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // 콘솔이 있는 환경에서는 콘솔에도 남긴다
    try {
      console.error("[DiagBoundary]", error, info);
    } catch (e) {}
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#1e1f22",
            color: "#fff",
            fontFamily: "ui-monospace, Consolas, monospace",
            padding: 24,
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <div style={{ color: "#ed4245", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
            화면 렌더링 중 오류가 발생했습니다
          </div>
          <div style={{ color: "#faa61a", marginBottom: 6 }}>메시지:</div>
          <div style={{ marginBottom: 16 }}>
            {String(this.state.error?.message || this.state.error)}
          </div>
          {this.state.error?.stack && (
            <>
              <div style={{ color: "#faa61a", marginBottom: 6 }}>위치:</div>
              <div style={{ fontSize: 11, color: "#949ba4" }}>
                {String(this.state.error.stack).split("\n").slice(0, 6).join("\n")}
              </div>
            </>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
