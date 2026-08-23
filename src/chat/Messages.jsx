import React, { useState, useRef, useEffect } from "react";
import { C, Avatar, formatTime, avatarColor, initials, EMOJI_LIST } from "./helpers.jsx";
import { MessageBody, SpoilerImage } from "./markdown.jsx";
import { IconReply, IconSmile, IconTrash, IconEyeOff, IconBold, IconAttach, IconUpload, IconMic, IconSend, IconChevronDown } from "./icons.jsx";

/* ============================================================
   이모지 선택기
   ============================================================ */
// 호버 툴팁에 "OO님이 [이름] 이모티콘으로 반응함"을 표시하기 위한 한글 이름
const EMOJI_CHOICES = [
  { e: "👍", name: "엄지척" },
  { e: "❤️", name: "빨간색-하트" },
  { e: "😂", name: "웃겨서-눈물" },
  { e: "😮", name: "놀람" },
  { e: "😢", name: "슬픔" },
  { e: "🔥", name: "불꽃" },
  { e: "🎉", name: "축하-폭죽" },
  { e: "👀", name: "쳐다보는-눈" },
  { e: "🤔", name: "생각" },
  { e: "🙌", name: "만세" },
  { e: "✅", name: "체크표시" },
  { e: "❓", name: "물음표" },
];
function emojiName(e) {
  return EMOJI_CHOICES.find((x) => x.e === e)?.name || e;
}

export function EmojiPicker({ onPick, onClose, align = "left" }) {
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        bottom: "100%",
        [align === "right" ? "right" : "left"]: 0,
        marginBottom: 8,
        background: "#fff",
        borderRadius: 10,
        padding: 8,
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 2,
        boxShadow: "0 2px 10px rgba(60,64,67,0.3)",
        border: `1px solid ${C.border}`,
        zIndex: 30,
      }}
    >
      {EMOJI_CHOICES.map((item) => (
        <button
          key={item.e}
          onClick={() => onPick(item.e)}
          title={item.name}
          style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", padding: "6px 8px", borderRadius: 6 }}
          onMouseEnter={(ev) => (ev.currentTarget.style.background = C.bgHover)}
          onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
        >
          {item.e}
        </button>
      ))}
    </div>
  );
}

function summarizeReactions(reactions, currentUser) {
  if (!reactions || typeof reactions !== "object") return [];
  return Object.entries(reactions)
    .map(([emoji, users]) => ({
      emoji,
      users: Array.isArray(users) ? users : [],
      count: Array.isArray(users) ? users.length : 0,
      mine: Array.isArray(users) && users.includes(currentUser),
    }))
    .filter((r) => r.count > 0);
}

// 연속 메시지 뭉치에서 "아바타가 있는 쪽" 모서리를 좁혀 붙어있는 느낌을 낸다.
// 내 메시지(isMe)는 아바타가 오른쪽에 있으므로 우측 모서리가, 남 메시지는 좌측 모서리가 좁아진다.
// CSS border-radius 순서: top-left, top-right, bottom-right, bottom-left
function bubbleRadius(pos, isMe) {
  const R = 16;
  const r = 5;
  if (pos === "solo") return `${R}px`;

  // 뭉치 안에서 좁혀야 할 모서리 자리(위/아래 각각 아바타 쪽 한 곳)를 계산
  const narrowTop = pos === "middle" || pos === "last"; // 위쪽 인접 모서리를 좁힐지
  const narrowBottom = pos === "middle" || pos === "first"; // 아래쪽 인접 모서리를 좁힐지

  const topLeft = !isMe && narrowTop ? r : R;
  const topRight = isMe && narrowTop ? r : R;
  const bottomRight = isMe && narrowBottom ? r : R;
  const bottomLeft = !isMe && narrowBottom ? r : R;

  return `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
}

/* ============================================================
   메시지 리스트
   ============================================================ */
export function MessageList({
  messages,
  loading,
  currentUser,
  displayName,
  userAvatar,
  userColor,
  isUserOnline,
  onDelete,
  onReply,
  onToggleReaction,
  onOpenProfile,
  mentionNames,
  scrollRef,
  onScroll,
  onImageLoad,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [pickerFor, setPickerFor] = useState(null);

  return (
    <div ref={scrollRef} onScroll={onScroll} style={{ flex: 1, overflowY: "auto", padding: "18px 28px" }}>
      {loading && <div style={{ color: C.textFaint, fontSize: 14 }}>불러오는 중...</div>}
      {!loading && messages.length === 0 && (
        <div style={{ color: C.textFaint, fontSize: 14 }}>아직 메시지가 없습니다. 첫 메시지를 보내보세요!</div>
      )}

      {messages.map((m, idx) => {
        const prev = messages[idx - 1];
        const next = messages[idx + 1];

        function sameGroup(a, b) {
          return a && b && a.author === b.author && !b.reply_to_author && !a.image_url === !b.image_url && new Date(b.created_at) - new Date(a.created_at) < 5 * 60 * 1000;
        }

        const groupedWithPrev = sameGroup(prev, m);
        const groupedWithNext = sameGroup(m, next);
        const grouped = groupedWithPrev; // 아바타/이름 표시 여부는 기존 로직 그대로 유지

        // 말풍선 뭉치에서의 위치: 인접한 쪽 모서리를 좁혀서 "붙어있는 느낌"을 낸다
        // solo: 사방 둥긂 / first: 아래쪽만 좁힘 / middle: 위아래 둘 다 좁힘 / last: 위쪽만 좁힘
        let bubblePos = "solo";
        if (groupedWithPrev && groupedWithNext) bubblePos = "middle";
        else if (groupedWithNext) bubblePos = "first";
        else if (groupedWithPrev) bubblePos = "last";

        const reactions = summarizeReactions(m.reactions, currentUser);
        const isMe = m.author === currentUser;
        const hovered = hoveredId === m.id;
        const pickerOpen = pickerFor === m.id;
        const showToolbar = hovered || pickerOpen;

        return (
          <div
            key={m.id}
            id={`v2msg-${m.id}`}
            className={idx === messages.length - 1 ? "v2-msg-in" : undefined}
            onMouseEnter={() => setHoveredId(m.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              marginTop: grouped ? 2 : 14,
              padding: "3px 10px",
              marginLeft: -10,
              marginRight: -10,
              borderRadius: 10,
              background: hovered ? "#f8f9fa" : "transparent",
              position: "relative",
            }}
          >
            {m.deleted ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#e8eaed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M4 21v-1a7 7 0 0 1 14 0v1" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: C.textFaint, fontStyle: "italic" }}>
                  {isMe ? "회원님이" : `${displayName(m.author)}님이`} 메시지를 삭제했습니다.
                </span>
              </div>
            ) : (
              <>
            {m.reply_to_author && (
              <div
                onClick={() => {
                  const t = document.getElementById(`v2msg-${m.reply_to_id}`);
                  if (t) {
                    t.scrollIntoView({ behavior: "smooth", block: "center" });
                    t.style.background = C.bgActive;
                    setTimeout(() => (t.style.background = "transparent"), 1200);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginLeft: isMe ? 0 : 44,
                  marginRight: isMe ? 44 : 0,
                  marginBottom: 2,
                  color: C.textFaint,
                  fontSize: 12.5,
                  cursor: "pointer",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                }}
              >
                <span>↳</span>
                <Avatar url={userAvatar(m.reply_to_author)} color={userColor(m.reply_to_author)} label={displayName(m.reply_to_author)} size={15} />
                <span style={{ color: C.textSub, fontWeight: 600 }}>{displayName(m.reply_to_author)}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.reply_to_text}</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, flexDirection: isMe ? "row-reverse" : "row" }}>
              <div style={{ width: 36, flexShrink: 0 }}>
                {!grouped && (
                  <div onClick={() => onOpenProfile?.(m.author)} style={{ cursor: onOpenProfile ? "pointer" : "default", width: 36 }}>
                    <Avatar
                      url={userAvatar(m.author)}
                      color={userColor(m.author)}
                      label={displayName(m.author)}
                      size={36}
                      online={isUserOnline(m.author)}
                      showStatus
                    />
                  </div>
                )}
                {grouped && hovered && (
                  <div style={{ color: C.textFaint, fontSize: 10, textAlign: "center", marginTop: 2 }}>{formatTime(m.created_at)}</div>
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                {!grouped && (
                  <div style={{ marginBottom: 2 }}>
                    {!isMe && (
                      <span onClick={() => onOpenProfile?.(m.author)} style={{ color: C.text, fontWeight: 600, fontSize: 14.5, cursor: onOpenProfile ? "pointer" : "default" }}>
                        {displayName(m.author)}
                      </span>
                    )}
                    <span style={{ color: C.textFaint, fontSize: 12, marginLeft: isMe ? 0 : 8, marginRight: isMe ? 8 : 0 }}>{formatTime(m.created_at)}</span>
                    {isMe && (
                      <span onClick={() => onOpenProfile?.(m.author)} style={{ color: C.text, fontWeight: 600, fontSize: 14.5, cursor: onOpenProfile ? "pointer" : "default" }}>
                        {displayName(m.author)}
                      </span>
                    )}
                  </div>
                )}

                {/* 말풍선: 내용 길이에 맞춰 좁게, 연속 메시지는 인접 모서리가 좁아짐 */}
                {m.text && (
                  <div
                    style={{
                      display: "inline-block",
                      maxWidth: "min(480px, 78%)",
                      width: "fit-content",
                      background: isMe ? C.bubbleMe : C.bubbleOther,
                      color: isMe ? C.bubbleMeText : C.bubbleOtherText,
                      borderRadius: bubbleRadius(bubblePos, isMe),
                      padding: "8px 14px",
                      fontSize: 14.5,
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                      textAlign: "left",
                    }}
                  >
                    <MessageBody text={m.text} messageId={m.id} mentionNames={mentionNames} me={currentUser} />
                  </div>
                )}

                {m.image_url &&
                  (m.image_spoiler ? (
                    <SpoilerImage src={m.image_url} onOpen={() => onImageLoad?.(idx)} />
                  ) : (
                    <img
                      src={m.image_url}
                      alt="첨부 이미지"
                      onClick={() => window.open(m.image_url, "_blank")}
                      onLoad={() => onImageLoad?.(idx)}
                      style={{
                        marginTop: 4,
                        width: "100%",
                        maxWidth: 380,
                        minWidth: 180,
                        maxHeight: 380,
                        borderRadius: 14,
                        display: "block",
                        cursor: "pointer",
                        objectFit: "contain",
                        background: C.bgRail,
                      }}
                    />
                  ))}

                {(reactions.length > 0 || hovered) && (
                  <ReactionRow
                    reactions={reactions}
                    isMe={isMe}
                    displayName={displayName}
                    currentUser={currentUser}
                    onToggle={(emoji) => onToggleReaction(m, emoji)}
                    onAddClick={() => setPickerFor(pickerFor === `add-${m.id}` ? null : `add-${m.id}`)}
                    showAddPicker={pickerFor === `add-${m.id}`}
                    onPickNew={(emoji) => {
                      onToggleReaction(m, emoji);
                      setPickerFor(null);
                    }}
                    onCloseAddPicker={() => setPickerFor(null)}
                  />
                )}
              </div>
            </div>

            {showToolbar && (
              <div
                className="v2-toolbar-in"
                onMouseEnter={() => setHoveredId(m.id)}
                style={{
                  position: "absolute",
                  top: -14,
                  [isMe ? "right" : "left"]: 48,
                  background: "#fff",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  display: "flex",
                  boxShadow: "0 2px 8px rgba(60,64,67,0.2)",
                  zIndex: 20,
                }}
              >
                <button onClick={() => onReply(m)} title="답글" style={toolBtnStyle}>
                  <IconReply width={16} height={16} />
                </button>
                <div style={{ position: "relative" }}>
                  <button onClick={() => setPickerFor(pickerOpen ? null : m.id)} title="반응" style={toolBtnStyle}>
                    <IconSmile width={16} height={16} />
                  </button>
                  {pickerOpen && (
                    <EmojiPicker align={isMe ? "right" : "left"} onPick={(e) => { onToggleReaction(m, e); setPickerFor(null); }} onClose={() => setPickerFor(null)} />
                  )}
                </div>
                {isMe && (
                  <button onClick={() => onDelete(m)} title="삭제" style={{ ...toolBtnStyle, color: C.red }}>
                    <IconTrash width={16} height={16} />
                  </button>
                )}
              </div>
            )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   리액션 한 줄 — 배지들 + 상시 노출되는 + 추가 버튼
   ============================================================ */
function ReactionRow({ reactions, isMe, displayName, currentUser, onToggle, onAddClick, showAddPicker, onPickNew, onCloseAddPicker }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginTop: 4,
        flexWrap: "wrap",
        justifyContent: isMe ? "flex-end" : "flex-start",
        position: "relative",
        zIndex: 1,
      }}
    >
      {isMe && <AddReactionBtn onClick={onAddClick} />}

      {reactions.map((r) => (
        <ReactionBadge key={r.emoji} r={r} displayName={displayName} currentUser={currentUser} onClick={() => onToggle(r.emoji)} />
      ))}

      {!isMe && <AddReactionBtn onClick={onAddClick} />}

      {showAddPicker && <EmojiPicker align={isMe ? "right" : "left"} onPick={onPickNew} onClose={onCloseAddPicker} />}
    </div>
  );
}

function AddReactionBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="반응 추가"
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        border: `1px solid ${C.border}`,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: C.textFaint,
        flexShrink: 0,
        position: "relative",
      }}
    >
      <IconSmile width={13} height={13} />
    </button>
  );
}

// 내가 누른 반응 = 진한 파랑 배경 + 흰 텍스트
// 안 누른 반응  = 흰 배경 + 회색 테두리
// 마우스를 올리면 검은 툴팁으로 "누가 어떤 이모지로 반응했는지" 표시
function ReactionBadge({ r, displayName, currentUser, onClick }) {
  const [hover, setHover] = useState(false);

  const names = r.users.map((u) => (u === currentUser ? "나" : displayName(u)));
  const nameLabel = names.length <= 3 ? names.join(", ") : `${names.slice(0, 3).join(", ")} 외 ${names.length - 3}명`;
  const tooltipText = `${nameLabel}님이 ${emojiName(r.emoji)} 이모티콘으로 반응함`;

  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button
        onClick={onClick}
        className="v2-reaction-pop"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: r.mine ? C.blue : "#fff",
          border: r.mine ? `1px solid ${C.blue}` : `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "2px 8px",
          fontSize: 12.5,
          color: r.mine ? "#fff" : C.text,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 13 }}>{r.emoji}</span>
        <span>{r.count}</span>
      </button>

      {hover && (
        <div
          className="v2-toolbar-in"
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 6,
            background: "#3c4043",
            color: "#fff",
            fontSize: 12,
            padding: "6px 10px",
            borderRadius: 6,
            width: "max-content",
            maxWidth: 220,
            textAlign: "center",
            lineHeight: 1.4,
            zIndex: 30,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {tooltipText}
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #3c4043" }} />
        </div>
      )}
    </div>
  );
}

const toolBtnStyle = {
  background: "transparent",
  border: "none",
  fontSize: 15,
  padding: "7px 9px",
  cursor: "pointer",
};

/* ============================================================
   메시지 입력창
   ============================================================ */
export function MessageInput({
  channelName,
  input,
  onInputChange,
  onSend,
  replyingTo,
  onCancelReply,
  displayName,
  pendingImage,
  onPickImage,
  onCancelImage,
  pendingSpoiler,
  onToggleSpoiler,
  uploading,
  fileInputRef,
  onFileSelected,
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiSuggest, setEmojiSuggest] = useState(null); // :검색어 자동완성
  const [showHelp, setShowHelp] = useState(false); // / 명령어 도움말
  const [showFormatBar, setShowFormatBar] = useState(false); // A 서식 툴바
  const inputRef = useRef(null);

  // 선택 영역이 있으면 그 부분을 감싸고, 없으면 커서 위치에 빈 문법을 넣고
  // 그 사이에 커서를 둔다 (** | ** 처럼)
  function wrapSelection(before, after = before) {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    const selected = input.slice(start, end);
    const next = input.slice(0, start) + before + selected + after + input.slice(end);
    onInputChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = selected ? start + before.length + selected.length + after.length : start + before.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  function insertLinePrefix(prefix) {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? input.length;
    // 현재 커서가 있는 줄의 맨 앞을 찾는다
    const lineStart = input.lastIndexOf("\n", start - 1) + 1;
    const next = input.slice(0, lineStart) + prefix + input.slice(lineStart);
    onInputChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + prefix.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  useEffect(() => {
    if (!input) {
      setEmojiSuggest(null);
      setShowHelp(false);
    }
  }, [input]);

  function handleChange(value) {
    onInputChange(value);
    setShowHelp(value.startsWith("/"));

    const m = value.match(/(?:^|\s):([\w가-힣]{1,20})$/);
    if (m) {
      const q = m[1].toLowerCase();
      const list = EMOJI_LIST.filter((item) => item.names.some((n) => n.toLowerCase().includes(q))).slice(0, 24);
      setEmojiSuggest(list.length > 0 ? { list } : null);
    } else {
      setEmojiSuggest(null);
    }
  }

  function insertEmoji(emoji) {
    onInputChange(input.replace(/:[\w가-힣]{1,20}$/, emoji));
    setEmojiSuggest(null);
  }

  function runCommand(raw) {
    const [cmd, ...rest] = raw.slice(1).split(" ");
    const arg = rest.join(" ");
    switch (cmd) {
      case "spoiler":
        onInputChange(`<${arg}>`);
        return true;
      case "shrug":
        onInputChange(`${arg} ¯\\_(ツ)_/¯`.trim());
        return true;
      case "clear":
        onInputChange("");
        setShowHelp(false);
        return true;
      case "help":
        onInputChange("");
        setShowHelp(true);
        return true;
      default:
        return false;
    }
  }

  return (
    <div style={{ padding: "10px 24px 20px", position: "relative" }}>
      {/* A 서식 툴바 - 사진 스펙: B I U A(밑줄표시) S | 목록 인용 링크 코드 */}
      {showFormatBar && (
        <div
          className="v2-toolbar-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "#fff",
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: "6px 10px",
            marginBottom: 8,
            width: "fit-content",
            boxShadow: "0 1px 4px rgba(60,64,67,0.15)",
          }}
        >
          <FormatBtn label="B" bold onClick={() => wrapSelection("**")} title="굵게" />
          <FormatBtn label="I" italic onClick={() => wrapSelection("*")} title="기울임" />
          <FormatBtn label="U" underline onClick={() => wrapSelection("__")} title="밑줄" />
          <FormatBtn label="A" underline color={C.blue} onClick={() => wrapSelection("==")} title="형광펜 강조" />
          <FormatBtn label="S" strike onClick={() => wrapSelection("~~")} title="취소선" />
          <Divider />
          <FormatIconBtn onClick={() => insertLinePrefix("- ")} title="목록">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
              <circle cx="4" cy="6" r="1.4" fill="currentColor" /><circle cx="4" cy="12" r="1.4" fill="currentColor" /><circle cx="4" cy="18" r="1.4" fill="currentColor" />
            </svg>
          </FormatIconBtn>
          <FormatIconBtn onClick={() => insertLinePrefix("> ")} title="인용">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 8c-2.2 0-4 1.8-4 4v4h4v-4H5c0-1.1.9-2 2-2V8zm10 0c-2.2 0-4 1.8-4 4v4h4v-4h-2c0-1.1.9-2 2-2V8z" />
            </svg>
          </FormatIconBtn>
          <FormatIconBtn onClick={() => wrapSelection("[", "](url)")} title="링크">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </FormatIconBtn>
          <FormatIconBtn onClick={() => wrapSelection("`")} title="인라인 코드">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </FormatIconBtn>
          <FormatIconBtn onClick={() => wrapSelection("```\n", "\n```")} title="코드 블록">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="9" x2="10" y2="9" /><line x1="7" y1="13" x2="14" y2="13" />
            </svg>
          </FormatIconBtn>
        </div>
      )}

      {/* / 명령어 도움말 */}
      {showHelp && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: 24,
            right: 24,
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 8,
            boxShadow: "0 2px 12px rgba(60,64,67,0.25)",
            border: `1px solid ${C.border}`,
            maxHeight: 320,
            overflowY: "auto",
            zIndex: 40,
          }}
        >
          <div style={{ color: C.text, fontWeight: 600, fontSize: 14, marginBottom: 10 }}>명령어 &amp; 사용법</div>
          {[
            ["/help", "이 도움말 보기"],
            ["/spoiler 내용", "스포일러로 감싸기"],
            ["/shrug", "¯\\_(ツ)_/¯ 붙이기"],
            ["/clear", "입력창 비우기"],
          ].map(([cmd, desc]) => (
            <div key={cmd} style={{ display: "flex", gap: 10, marginBottom: 5, fontSize: 13 }}>
              <code style={{ color: C.blue, minWidth: 120 }}>{cmd}</code>
              <span style={{ color: C.textSub }}>{desc}</span>
            </div>
          ))}
          <div style={{ color: C.text, fontWeight: 600, fontSize: 14, margin: "14px 0 8px", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            채팅 문법
          </div>
          {[
            ["<내용>", "스포일러 (클릭하면 열림, Tab으로 전체 보기)"],
            ["@이름", "멘션"],
            ["**굵게**", "굵은 글씨"],
            ["*기울임*", "기울인 글씨"],
            ["~~취소선~~", "취소선"],
            ["`코드`", "인라인 코드"],
            ["# 제목", "제목 (1~6단계)"],
            ["- 목록", "글머리 목록"],
            ["> 인용", "인용문"],
            [":검색어", "이모지 찾기 (Enter로 바로 삽입)"],
          ].map(([syntax, desc]) => (
            <div key={syntax} style={{ display: "flex", gap: 10, marginBottom: 5, fontSize: 13 }}>
              <code style={{ color: C.yellow, minWidth: 120 }}>{syntax}</code>
              <span style={{ color: C.textSub }}>{desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* : 이모지 자동완성 */}
      {emojiSuggest && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: 24,
            background: "#fff",
            borderRadius: 12,
            padding: 8,
            marginBottom: 8,
            boxShadow: "0 2px 12px rgba(60,64,67,0.25)",
            border: `1px solid ${C.border}`,
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 2,
            zIndex: 40,
          }}
        >
          {emojiSuggest.list.map((item) => (
            <button
              key={item.e}
              onClick={() => insertEmoji(item.e)}
              title={item.names.join(", ")}
              style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", padding: "6px 8px", borderRadius: 6 }}
              onMouseEnter={(ev) => (ev.currentTarget.style.background = C.bgHover)}
              onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
            >
              {item.e}
            </button>
          ))}
        </div>
      )}

      {replyingTo && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: C.bgRail,
            borderRadius: "10px 10px 0 0",
            padding: "8px 14px",
            fontSize: 13,
            color: C.textSub,
          }}
        >
          <span>
            <b style={{ color: C.text }}>{displayName(replyingTo.author)}</b>에게 답장
          </span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.textFaint }}>
            {replyingTo.text || (replyingTo.image_url ? "[사진]" : "")}
          </span>
          <button onClick={onCancelReply} style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer" }}>
            ✕
          </button>
        </div>
      )}

      {pendingImage && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.bgRail, borderRadius: 10, padding: 10, marginTop: replyingTo ? 0 : 8 }}>
          <img src={pendingImage.previewUrl} alt="미리보기" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }} />
          <div style={{ flex: 1, fontSize: 13, color: C.textSub }}>{pendingImage.file.name}</div>
          <button
            onClick={onToggleSpoiler}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: pendingSpoiler ? C.blue : "#fff",
              color: pendingSpoiler ? "#fff" : C.textSub,
              border: `1px solid ${pendingSpoiler ? C.blue : C.border}`,
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <IconEyeOff width={14} height={14} />
            스포일러{pendingSpoiler ? " ✓" : ""}
          </button>
          <button onClick={onCancelImage} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
            취소
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: C.bgActive,
          border: "none",
          borderRadius: replyingTo ? "0 0 26px 26px" : 26,
          padding: "6px 8px 6px 18px",
          boxShadow: "none",
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={onFileSelected} style={{ display: "none" }} />

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowHelp(false);
              setEmojiSuggest(null);
              return;
            }
            if (e.key !== "Enter" || e.shiftKey) return;

            // 이모지 자동완성이 떠 있으면 Enter로 첫 항목 바로 확정
            if (emojiSuggest?.list?.length) {
              e.preventDefault();
              insertEmoji(emojiSuggest.list[0].e);
              return;
            }
            // "/" 명령어면 실행하고 전송하지 않음
            if (input.startsWith("/") && runCommand(input)) {
              e.preventDefault();
              return;
            }
            e.preventDefault();
            onSend();
          }}
          placeholder={uploading ? "이미지 업로드 중..." : `#${channelName}에 메시지 보내기`}
          disabled={uploading}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14.5, padding: "9px 6px", fontFamily: C.font, color: C.text, background: "transparent" }}
        />

        {/* 서식(A) - 클릭하면 서식 툴바가 펼쳐짐 */}
        <button
          onClick={() => setShowFormatBar((v) => !v)}
          title="서식"
          style={{ ...iconBtnStyle, color: showFormatBar ? C.blue : iconBtnStyle.color }}
        >
          <span style={{ fontWeight: 600, fontSize: 15, textDecoration: showFormatBar ? "underline" : "none" }}>A</span>
        </button>

        {/* 이모지 */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowEmoji((v) => !v)} title="이모지" style={iconBtnStyle}>
            <IconSmile width={17} height={17} />
          </button>
          {showEmoji && (
            <EmojiPicker
              align="right"
              onPick={(e) => {
                onInputChange(input + e);
                setShowEmoji(false);
              }}
              onClose={() => setShowEmoji(false)}
            />
          )}
        </div>

        {/* 사진 첨부 */}
        <button onClick={() => fileInputRef.current?.click()} title="사진 첨부" style={iconBtnStyle}>
          <IconAttach width={17} height={17} />
        </button>

        {/* 파일 업로드 (같은 파일선택창 재사용) */}
        <button onClick={() => fileInputRef.current?.click()} title="파일 업로드" style={iconBtnStyle}>
          <IconUpload width={17} height={17} />
        </button>

        {/* 음성(자리만, 텍스트 채팅이라 비활성) */}
        <button title="음성 메시지" disabled style={{ ...iconBtnStyle, opacity: 0.4, cursor: "default" }}>
          <IconMic width={17} height={17} />
        </button>

        <div style={{ width: 1, height: 20, background: "rgba(60,64,67,0.2)", margin: "0 4px" }} />

        <button
          title="전송 옵션"
          style={{
            width: 20,
            height: 34,
            border: "none",
            background: "transparent",
            color: C.textFaint,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconChevronDown width={12} height={12} />
        </button>

        <button
          onClick={onSend}
          disabled={uploading || (!input.trim() && !pendingImage)}
          title="전송"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: (input.trim() || pendingImage) && !uploading ? C.blue : "transparent",
            border: "none",
            color: (input.trim() || pendingImage) && !uploading ? "#fff" : C.textFaint,
            cursor: (input.trim() || pendingImage) && !uploading ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {uploading ? "…" : <IconSend width={15} height={15} style={{ marginLeft: -1 }} />}
        </button>
      </div>
    </div>
  );
}

function FormatBtn({ label, onClick, title, bold, italic, underline, strike, color }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30,
        height: 30,
        border: "none",
        background: "transparent",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: bold ? 700 : 400,
        fontStyle: italic ? "italic" : "normal",
        textDecoration: underline ? "underline" : strike ? "line-through" : "none",
        fontSize: 14,
        color: color || C.text,
        fontFamily: C.font,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {label}
    </button>
  );
}

function FormatIconBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.textSub }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 18, background: C.border, margin: "0 4px" }} />;
}

const iconBtnStyle = {
  background: "transparent",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  color: C.textSub,
};
