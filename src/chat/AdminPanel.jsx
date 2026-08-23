import React, { useState, useEffect } from "react";
import { sbSelect, sbUpdate, sbDelete } from "../AuthGate.jsx";
import { C } from "./helpers.jsx";

export default function AdminPanel({ currentUserId, onClose }) {
  const [tab, setTab] = useState("pending"); // pending | all
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    sbSelect("users", "select=id,name,status,is_admin,nickname,created_at&order=created_at.desc")
      .then((rows) => setUsers(rows))
      .catch(() => setErr("목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(u) {
    setBusyId(u.id);
    try {
      await sbUpdate("users", `id=eq.${u.id}`, { status: "approved" });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: "approved" } : x)));
    } catch (e) {
      setErr(`승인 실패: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  }

  async function reject(u) {
    setBusyId(u.id);
    try {
      await sbUpdate("users", `id=eq.${u.id}`, { status: "rejected" });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: "rejected" } : x)));
    } catch (e) {
      setErr(`거절 실패: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  }

  async function removeUser(u) {
    if (u.id === currentUserId) {
      setErr("본인 계정은 삭제할 수 없습니다.");
      return;
    }
    if (!window.confirm(`'${u.name}'을(를) 삭제할까요?`)) return;
    setBusyId(u.id);
    try {
      await sbDelete("users", `id=eq.${u.id}`);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e) {
      setErr(`삭제 실패: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  }

  const pending = users.filter((u) => u.status === "pending");
  const shown = tab === "pending" ? pending : users;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(32,33,36,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 90, fontFamily: C.font }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, width: 520, maxWidth: "92vw", maxHeight: "86vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
      >
        <div style={{ padding: "22px 26px 14px" }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>관리자 패널</div>
          <div style={{ display: "flex", gap: 4, marginTop: 14, borderBottom: `1px solid ${C.border}` }}>
            <TabBtn active={tab === "pending"} onClick={() => setTab("pending")}>
              가입 승인 대기 {pending.length > 0 && <Badge>{pending.length}</Badge>}
            </TabBtn>
            <TabBtn active={tab === "all"} onClick={() => setTab("all")}>
              전체 사용자
            </TabBtn>
          </div>
        </div>

        {err && <div style={{ color: C.red, fontSize: 12, padding: "0 26px 8px" }}>{err}</div>}

        <div style={{ overflowY: "auto", padding: "6px 20px 20px", flex: 1 }}>
          {loading && <div style={{ color: C.textFaint, fontSize: 13, padding: 16 }}>불러오는 중...</div>}
          {!loading && shown.length === 0 && (
            <div style={{ color: C.textFaint, fontSize: 13, padding: 16, textAlign: "center" }}>
              {tab === "pending" ? "승인 대기 중인 가입 요청이 없습니다." : "사용자가 없습니다."}
            </div>
          )}

          {shown.map((u) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 10, background: C.bgSide, marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
                  {u.name}
                  {u.nickname && <span style={{ color: C.textFaint, fontWeight: 400 }}>({u.nickname})</span>}
                  {u.is_admin && <StatusPill color={C.blue} bg="#e8f0fe">관리자</StatusPill>}
                  {u.status === "pending" && <StatusPill color={C.yellow} bg="#fef7e0">대기중</StatusPill>}
                  {u.status === "rejected" && <StatusPill color={C.red} bg="#fce8e6">거절됨</StatusPill>}
                  {u.id === currentUserId && <StatusPill color={C.green} bg="#e6f4ea">나</StatusPill>}
                </div>
                <div style={{ fontSize: 11.5, color: C.textFaint, marginTop: 2 }}>
                  {new Date(u.created_at).toLocaleString("ko-KR")}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {u.status === "pending" && (
                  <>
                    <ActionBtn onClick={() => approve(u)} disabled={busyId === u.id} kind="approve">
                      승인
                    </ActionBtn>
                    <ActionBtn onClick={() => reject(u)} disabled={busyId === u.id} kind="reject">
                      거절
                    </ActionBtn>
                  </>
                )}
                {u.status === "rejected" && (
                  <ActionBtn onClick={() => approve(u)} disabled={busyId === u.id} kind="approve">
                    다시 승인
                  </ActionBtn>
                )}
                <ActionBtn onClick={() => removeUser(u)} disabled={busyId === u.id || u.id === currentUserId} kind="delete">
                  삭제
                </ActionBtn>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "14px 26px", borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={onClose}
            style={{ width: "100%", padding: "10px 0", borderRadius: 24, border: "none", background: C.bgHover, color: C.text, fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: C.font }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: "10px 6px",
        marginRight: 18,
        fontSize: 14,
        fontWeight: 500,
        color: active ? C.blue : C.textSub,
        borderBottom: active ? `2px solid ${C.blue}` : "2px solid transparent",
        cursor: "pointer",
        fontFamily: C.font,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {children}
    </button>
  );
}

function Badge({ children }) {
  return (
    <span style={{ background: C.red, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 10, padding: "1px 7px" }}>{children}</span>
  );
}

function StatusPill({ color, bg, children }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, borderRadius: 8, padding: "1px 7px" }}>{children}</span>
  );
}

function ActionBtn({ onClick, disabled, kind, children }) {
  const styles = {
    approve: { bg: "#e6f4ea", color: C.green, border: "#c6e6cf" },
    reject: { bg: "#fef7e0", color: "#b06000", border: "#fdd663" },
    delete: { bg: "#fce8e6", color: C.red, border: "#fad2cf" },
  }[kind];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        borderRadius: 8,
        padding: "6px 12px",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: C.font,
      }}
    >
      {children}
    </button>
  );
}
