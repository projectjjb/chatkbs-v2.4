import React, { useState, useRef, useEffect } from "react";
import { sbSelect, sbInsert, sbUpdate, sbDelete, SUPABASE_URL, SUPABASE_ANON_KEY } from "../AuthGate.jsx";

/* ============================================================
   Google Chat 색상 팔레트
   ============================================================ */
export const C = {
  bg: "#ffffff",
  bgSide: "#f8fafd",
  bgRail: "#f1f3f4",
  bgHover: "#e8eaed",
  bgInput: "#f1f3f4",
  bgActive: "#e8f0fe",
  text: "#202124",
  textSub: "#5f6368",
  textFaint: "#80868b",
  border: "#dadce0",
  blue: "#1a73e8",
  blueDark: "#1967d2",
  red: "#d93025",
  yellow: "#f9ab00",
  green: "#1e8e3e",
  bubbleMe: "#e8f0fe",
  bubbleOther: "#f1f3f4",
  font: "'Google Sans', Roboto, arial, sans-serif",
};

/* ============================================================
   실시간 구독 (Supabase Realtime WebSocket)
   ============================================================ */
function subscribeToTable(table, onInsert, onUpdate, onDelete) {
  const wsUrl =
    SUPABASE_URL.replace("https://", "wss://") +
    `/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`;
  const ws = new WebSocket(wsUrl);
  let ref = 1;

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        topic: `realtime:public:${table}`,
        event: "phx_join",
        payload: {},
        ref: ref++,
      })
    );
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: ref++ }));
      }
    }, 25000);
    ws._heartbeat = heartbeat;
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.event === "INSERT" && msg.payload?.record) onInsert?.(msg.payload.record);
      else if (msg.event === "UPDATE" && msg.payload?.record) onUpdate?.(msg.payload.record);
      else if (msg.event === "DELETE" && msg.payload?.old_record) onDelete?.(msg.payload.old_record);
    } catch (e) {}
  };

  return () => {
    clearInterval(ws._heartbeat);
    ws.close();
  };
}

/* ============================================================
   이미지 업로드 (Supabase Storage)
   ============================================================ */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "지원하지 않는 파일 형식입니다 (PNG, JPG, GIF, WEBP만 가능)";
  if (file.size > MAX_IMAGE_BYTES) return "파일이 너무 큽니다 (최대 8MB)";
  return null;
}

const MAX_IMAGE_DIMENSION = 1600;
export async function compressImage(file) {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.round(bitmap.width * scale);
  const targetH = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, 0.8));
  if (!blob || blob.size >= file.size) return file;
  const ext = outputType === "image/png" ? "png" : "jpg";
  return new File([blob], `compressed.${ext}`, { type: outputType });
}

export async function uploadImage(file) {
  const ext = file.name.split(".").pop() || "png";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const url = `${SUPABASE_URL}/storage/v1/object/chat-images/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!res.ok) throw new Error(`이미지 업로드 실패: ${res.status}`);
  return `${SUPABASE_URL}/storage/v1/object/public/chat-images/${path}`;
}

/* ============================================================
   기타 헬퍼
   ============================================================ */
export function initials(name) {
  return name?.trim()?.[0]?.toUpperCase() || "?";
}

const AVATAR_PALETTE = ["#1a73e8", "#d93025", "#1e8e3e", "#f9ab00", "#9334e6", "#e37400", "#12b5cb", "#e52592"];
export function avatarColor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[h];
}

export function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

// 마지막 접속이 2분 이내면 온라인
export function isOnline(lastSeen, isMe) {
  if (isMe) return true;
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < 120000;
}

/* ============================================================
   Avatar — 사진 있으면 사진, 없으면 이니셜
   ============================================================ */
export function Avatar({ url, color, label, size = 40, online, showStatus = false }) {
  const common = { width: size, height: size, borderRadius: "50%", flexShrink: 0, display: "block" };
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {url ? (
        <img src={url} alt="프로필" style={{ ...common, objectFit: "cover" }} />
      ) : (
        <div
          style={{
            ...common,
            background: color,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: size * 0.4,
          }}
        >
          {initials(label)}
        </div>
      )}
      {showStatus && (
        <span
          style={{
            position: "absolute",
            right: -1,
            bottom: -1,
            width: Math.max(9, size * 0.28),
            height: Math.max(9, size * 0.28),
            borderRadius: "50%",
            background: online ? C.green : "#bdc1c6",
            border: "2px solid #fff",
            boxSizing: "content-box",
          }}
        />
      )}
    </div>
  );
}
