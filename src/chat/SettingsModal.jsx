import React, { useState, useRef } from "react";
import { sbSelect, sbUpdate, sbDelete, hashPassword } from "../AuthGate.jsx";
import { C, Avatar, initials, avatarColor, validateImageFile, compressImage, uploadImage } from "./helpers.jsx";

const PALETTE = ["#1a73e8", "#d93025", "#1e8e3e", "#f9ab00", "#9334e6", "#e37400", "#12b5cb", "#e52592", "#795548", "#5f6368"];

export default function SettingsModal({ currentUser, nickname, avatarUrl, color, isAdmin, userId, onSave, onClose }) {
  const [tab, setTab] = useState("profile"); // profile | password

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(32,33,36,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 90,
        fontFamily: C.font,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: 460,
          maxWidth: "92vw",
          maxHeight: "86vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ padding: "22px 26px 0" }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>설정</div>
          <div style={{ display: "flex", gap: 4, marginTop: 16, borderBottom: `1px solid ${C.border}` }}>
            {[
              ["profile", "프로필"],
              ["password", "비밀번호"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "10px 6px",
                  marginRight: 18,
                  fontSize: 14,
                  fontWeight: 500,
                  color: tab === id ? C.blue : C.textSub,
                  borderBottom: tab === id ? `2px solid ${C.blue}` : "2px solid transparent",
                  cursor: "pointer",
                  fontFamily: C.font,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 26px", overflowY: "auto", flex: 1 }}>
          {tab === "profile" && (
            <ProfileTab currentUser={currentUser} nickname={nickname} avatarUrl={avatarUrl} color={color} isAdmin={isAdmin} userId={userId} onSave={onSave} onClose={onClose} />
          )}
          {tab === "password" && <PasswordTab userId={userId} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ currentUser, nickname, avatarUrl, color, isAdmin, userId, onSave, onClose }) {
  const [value, setValue] = useState(nickname || "");
  const [pickedColor, setPickedColor] = useState(color);
  const [pickedAvatar, setPickedAvatar] = useState(avatarUrl || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef(null);

  async function handleAvatarPick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const v = validateImageFile(file);
    if (v) {
      setErr(v);
      return;
    }
    setErr("");
    setUploadingAvatar(true);
    try {
      const compressed = await compressImage(file);
      const url = await uploadImage(compressed);
      setPickedAvatar(url);
    } catch (e2) {
      setErr(`업로드 실패: ${e2.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const ok = await onSave(value, pickedColor, pickedAvatar);
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => onClose(), 550);
    } else {
      setErr("저장 실패. 다시 시도해주세요.");
    }
  }

  async function deleteAccount() {
    const confirmed = window.confirm(
      "정말 내 계정을 삭제할까요?\n\n· 이 비밀번호로 다시 접속할 수 없습니다\n· 프로필 설정이 모두 사라집니다\n· 이미 보낸 메시지는 남아 있습니다\n\n이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;
    const typed = window.prompt(`확인을 위해 본인 이름(${currentUser})을 정확히 입력해주세요.`);
    if (typed !== currentUser) return;

    setDeleting(true);
    try {
      await sbDelete("users", `id=eq.${userId}`);
      alert("계정이 삭제되었습니다.");
      window.location.reload();
    } catch (e) {
      setErr(`삭제 실패: ${e.message}`);
      setDeleting(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <Avatar url={pickedAvatar} color={pickedColor} label={value || currentUser} size={56} />
        <div>
          <div style={{ fontSize: 17, fontWeight: 500, color: C.text }}>{value || currentUser}</div>
          <div style={{ fontSize: 13, color: C.textFaint }}>@{currentUser}{isAdmin && " · 관리자"}</div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleAvatarPick} style={{ display: "none" }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploadingAvatar}
          style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: C.font }}
        >
          {uploadingAvatar ? "업로드 중..." : "📷 사진 올리기"}
        </button>
        {pickedAvatar && (
          <button
            onClick={() => setPickedAvatar(null)}
            style={{ padding: "9px 14px", borderRadius: 8, border: `1px solid #fad2cf`, background: "#fce8e6", color: C.red, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: C.font }}
          >
            제거
          </button>
        )}
      </div>

      <label style={{ fontSize: 12, fontWeight: 600, color: C.textSub }}>닉네임</label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={currentUser}
        maxLength={20}
        style={{ width: "100%", marginTop: 6, padding: "10px 13px", borderRadius: 8, border: `1px solid ${C.border}`, outline: "none", fontSize: 14.5, fontFamily: C.font, boxSizing: "border-box" }}
      />

      <label style={{ fontSize: 12, fontWeight: 600, color: C.textSub, display: "block", marginTop: 16 }}>
        프로필 색상 {pickedAvatar && <span style={{ color: C.textFaint, fontWeight: 400 }}>(사진 없을 때만 표시)</span>}
      </label>
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => setPickedColor(c)}
            style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: pickedColor === c ? "3px solid #202124" : "3px solid transparent", cursor: "pointer", padding: 0 }}
          />
        ))}
      </div>

      {err && <div style={{ color: C.red, fontSize: 13, marginTop: 14 }}>{err}</div>}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: "100%",
          marginTop: 20,
          padding: "11px 0",
          borderRadius: 24,
          border: "none",
          background: saving ? "#a6c8f7" : C.blue,
          color: "#fff",
          fontWeight: 500,
          fontSize: 14.5,
          cursor: saving ? "default" : "pointer",
          fontFamily: C.font,
        }}
      >
        {saving ? "저장 중..." : saved ? "저장됨 ✓" : "저장"}
      </button>

      <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
        <div style={{ color: C.red, fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>위험 구역</div>
        <div
          onClick={deleting ? undefined : deleteAccount}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #fad2cf",
            cursor: deleting ? "default" : "pointer",
            opacity: deleting ? 0.6 : 1,
          }}
        >
          <span style={{ fontSize: 20 }}>🗑️</span>
          <div>
            <div style={{ color: C.red, fontWeight: 500, fontSize: 14 }}>{deleting ? "삭제 중..." : "내 계정 삭제"}</div>
            <div style={{ color: C.textFaint, fontSize: 12 }}>이 비밀번호로 다시 접속할 수 없게 됩니다</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordTab({ userId, onClose }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [hasPassword, setHasPassword] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [isErr, setIsErr] = useState(false);

  async function handleSave() {
    setMsg("");
    setIsErr(false);
    if (newPw.length < 4) {
      setIsErr(true);
      setMsg("비밀번호는 4자 이상으로 해주세요.");
      return;
    }
    if (newPw !== newPw2) {
      setIsErr(true);
      setMsg("새 비밀번호가 서로 다릅니다.");
      return;
    }
    setSaving(true);
    try {
      const rows = await sbSelect("users", `id=eq.${userId}&select=password_hash`);
      const oldHash = await hashPassword(oldPw);
      if (oldHash !== rows[0]?.password_hash) {
        setIsErr(true);
        setMsg("현재 비밀번호가 올바르지 않습니다.");
        setSaving(false);
        return;
      }
      const dup = await sbSelect("users", `password_hash=eq.${await hashPassword(newPw)}&select=id`);
      if (dup.length > 0) {
        setIsErr(true);
        setMsg("이미 사용 중인 비밀번호입니다.");
        setSaving(false);
        return;
      }
      const newHash = await hashPassword(newPw);
      await sbUpdate("users", `id=eq.${userId}`, { password_hash: newHash });
      setMsg("비밀번호가 변경되었습니다 ✓");
      setTimeout(() => onClose(), 700);
    } catch (e) {
      setIsErr(true);
      setMsg(`저장 실패: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = { width: "100%", marginTop: 6, padding: "10px 13px", borderRadius: 8, border: `1px solid ${C.border}`, outline: "none", fontSize: 14.5, fontFamily: C.font, boxSizing: "border-box" };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: C.textSub, display: "block", marginTop: 14 };

  return (
    <div>
      <div
        style={{ background: "#fef7e0", border: "1px solid #fdd663", borderRadius: 10, padding: "12px 14px", marginBottom: 4, fontSize: 12.5, color: "#7a5b00", lineHeight: 1.6 }}
      >
        평소 쓰는 비밀번호는 사용하지 마세요. 이 채팅에서만 쓰는 새 비밀번호로 정해주세요.
      </div>

      <label style={labelStyle}>현재 비밀번호</label>
      <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>새 비밀번호</label>
      <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="4자 이상" style={inputStyle} />

      <label style={labelStyle}>새 비밀번호 확인</label>
      <input type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSave()} style={inputStyle} />

      {msg && <div style={{ color: isErr ? C.red : C.green, fontSize: 13, marginTop: 12 }}>{msg}</div>}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: "100%",
          marginTop: 20,
          padding: "11px 0",
          borderRadius: 24,
          border: "none",
          background: saving ? "#a6c8f7" : C.blue,
          color: "#fff",
          fontWeight: 500,
          fontSize: 14.5,
          cursor: saving ? "default" : "pointer",
          fontFamily: C.font,
        }}
      >
        {saving ? "저장 중..." : "비밀번호 변경"}
      </button>
    </div>
  );
}
