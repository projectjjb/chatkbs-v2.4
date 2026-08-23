import React, { useState, useRef, useEffect } from "react";

/* ============================================================
   마크다운 렌더러 + 스포일러 (v1에서 이식, 색상만 Google 톤으로 조정)
   ============================================================ */

// ---------- 스포일러 ----------
// 새로고침하면 다시 가려짐(저장하지 않음). Tab 키를 누르고 있으면 전체가 보임.
const SPOILER_BG = "#5f6368"; // 밝은 배경 위에서도 또렷한 중간 회색
const SPOILER_BG_OPEN = "#e8eaed";

// Tab 키로 전체 스포일러를 잠깐 보여주기 위한 전역 스타일 + 키 리스너
const SPOILER_STYLE_ID = "spoiler-global-style";
export function ensureSpoilerStyle() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SPOILER_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = SPOILER_STYLE_ID;
  style.textContent = `
    body.reveal-spoilers [data-spoiler] {
      background: ${SPOILER_BG_OPEN} !important;
      color: inherit !important;
    }
    body.reveal-spoilers .spoiler-cover {
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
}

export function useTabRevealSpoilers() {
  useEffect(() => {
    ensureSpoilerStyle();
    function onKeyDown(e) {
      if (e.key === "Tab") {
        e.preventDefault(); // 포커스 이동 막기
        document.body.classList.add("reveal-spoilers");
      }
    }
    function onKeyUp(e) {
      if (e.key === "Tab") document.body.classList.remove("reveal-spoilers");
    }
    function onBlur() {
      document.body.classList.remove("reveal-spoilers");
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);
}

// 스포일러 이미지 (회색으로 덮여 있다가 클릭하면 열림)
export function SpoilerImage({ src, onOpen }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        marginTop: 6,
        width: "100%",
        maxWidth: 480,
        minWidth: 220,
        display: "inline-block",
      }}
    >
      <img
        src={src}
        alt="첨부 이미지"
        onClick={() => {
          if (revealed) window.open(src, "_blank");
          else setRevealed(true);
        }}
        onLoad={onOpen}
        style={{
          width: "100%",
          maxWidth: 480,
          minWidth: 220,
          maxHeight: 480,
          borderRadius: 10,
          display: "block",
          cursor: "pointer",
          objectFit: "contain",
          background: "#f1f3f4",
        }}
      />
      {!revealed && (
        <div
          className="spoiler-cover"
          onClick={() => setRevealed(true)}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: SPOILER_BG,
            borderRadius: 10,
            transition: "opacity 0.15s",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 20,
            }}
          >
            🙈 스포일러 · 눌러서 보기
          </div>
        </div>
      )}
    </div>
  );
}

export function MessageBody({ text, messageId, mentionNames = [], me = "" }) {
  const ref = useRef(null);

  const html = markdownToHtml(text, {
    spoilerEnabled: true,
    mentionNames,
    me,
    keyPrefix: `msg${messageId}`,
  });

  // 스포일러 클릭하면 열림 (새로고침하면 다시 가려짐)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onClick(e) {
      const node = e.target.closest?.("[data-spoiler]");
      if (!node || !el.contains(node)) return;
      if (node.dataset.revealed === "1") return;
      node.dataset.revealed = "1";
      node.style.background = SPOILER_BG_OPEN;
      node.style.color = "inherit";
      node.style.cursor = "auto";
      node.style.userSelect = "auto";
    }

    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [html]);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}


// ---------- 마크다운 렌더러 ----------
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 인라인 서식 처리
// opts.spoilerEnabled: true면 <내용>을 스포일러로 처리 (채팅용)
// opts.mentionNames: 멘션으로 인식할 이름 목록, opts.me: 나를 멘션했는지 강조용
function renderInline(text, opts = {}) {
  const { spoilerEnabled = false, keyPrefix = "s", mentionNames = [], me = "" } = opts;

  // 코드/스포일러 안의 내용은 다른 서식이 적용되면 안 되므로 먼저 빼둠
  const holds = [];
  let t = text;

  // 스포일러 <내용>  (escape 전에 처리해야 함)
  if (spoilerEnabled) {
    t = t.replace(/<([^<>\n]+)>/g, (_, inner) => {
      const i = holds.length;
      holds.push(
        `<span data-spoiler="${keyPrefix}-${i}" style="background:${SPOILER_BG};color:transparent;border-radius:5px;padding:0 5px;cursor:pointer;user-select:none;transition:background 0.15s">${escapeHtml(
          inner
        )}</span>`
      );
      return `\u0000HOLD${i}\u0000`;
    });
  }

  // 인라인 코드 `code`
  t = t.replace(/`([^`]+)`/g, (_, code) => {
    const i = holds.length;
    holds.push(
      `<code style="background:#f1f3f4;padding:1px 5px;border-radius:3px;font-family:ui-monospace,Consolas,monospace;font-size:0.9em">${escapeHtml(
        code
      )}</code>`
    );
    return `\u0000HOLD${i}\u0000`;
  });

  t = escapeHtml(t);

  // 멘션 @이름 — 등록된 사용자만 강조
  if (mentionNames.length > 0) {
    const sorted = [...mentionNames].sort((a, b) => b.length - a.length);
    const escaped = sorted.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const mentionRe = new RegExp(`@(${escaped.join("|")})`, "g");
    t = t.replace(mentionRe, (full, name) => {
      const isMe = name === me;
      return `<span style="background:${
        isMe ? "rgba(249,171,0,0.16)" : "rgba(26,115,232,0.12)"
      };color:${
        isMe ? "#b06000" : "#1967d2"
      };padding:0 3px;border-radius:3px;font-weight:600">@${name}</span>`;
    });
  }

  // 이모지 단축코드 :heart: → ❤️
  t = t.replace(/:([\w가-힣]+):/g, (full, name) => {
    const found = EMOJI_LIST.find((e) =>
      e.names.some((n) => n.toLowerCase() === name.toLowerCase())
    );
    return found ? found.e : full;
  });

  // 이미지 ![alt](url) — 링크보다 먼저
  t = t.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    '<img src="$2" alt="$1" referrerpolicy="no-referrer" loading="lazy" style="max-width:100%;border-radius:8px;margin:4px 0;display:block" />'
  );
  // 링크 [text](url)
  t = t.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#1a73e8;text-decoration:none">$1</a>'
  );
  // 그냥 붙여넣은 URL 처리
  //  - 이미지/GIF 주소면 바로 미리보기로 렌더링
  //  - Giphy/Tenor 페이지 주소는 직접 이미지 주소로 변환 시도
  //  - 로딩에 실패하면 자동으로 링크로 대체
  t = t.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (full, pre, rawUrl) => {
    // 뒤에 붙은 문장부호 제거
    const trailing = rawUrl.match(/[.,!?)]+$/)?.[0] || "";
    const url = trailing ? rawUrl.slice(0, -trailing.length) : rawUrl;

    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#1a73e8;text-decoration:none">${url}</a>`;

    // 확장자로 판단되는 직접 이미지 주소
    let imageUrl = null;
    if (/\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?[^\s]*)?$/i.test(url)) {
      imageUrl = url;
    }

    // Giphy 페이지 주소 → 직접 GIF 주소로 변환
    // 예: https://giphy.com/gifs/funny-cat-AbC123 → https://i.giphy.com/AbC123.gif
    if (!imageUrl) {
      const giphy = url.match(/giphy\.com\/(?:gifs|clips)\/(?:[\w-]*-)?(\w{10,})/i);
      if (giphy) imageUrl = `https://i.giphy.com/${giphy[1]}.gif`;
    }

    // Tenor 직접 미디어 주소 (media.tenor.com/...)는 확장자 없이 오는 경우가 있음
    if (!imageUrl && /media\d*\.tenor\.com\//i.test(url)) {
      imageUrl = url;
    }

    if (!imageUrl) return pre + linkHtml + trailing;

    // referrerpolicy: 핫링크 차단(외부 참조 거부)을 우회
    // onerror: 이미지가 안 뜨면 링크로 자동 대체
    const fallbackId = "imgfb" + Math.random().toString(36).slice(2, 9);
    return (
      pre +
      `<img src="${imageUrl}" alt="이미지" referrerpolicy="no-referrer" loading="lazy" ` +
      `onerror="this.style.display='none';var f=document.getElementById('${fallbackId}');if(f)f.style.display='inline';" ` +
      `style="max-width:100%;max-height:420px;border-radius:8px;margin:4px 0;display:block" />` +
      `<span id="${fallbackId}" style="display:none">${linkHtml}</span>` +
      trailing
    );
  });

  // 굵은 기울임 ***text*** / ___text___
  t = t.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  t = t.replace(/___([^_]+)___/g, "<strong><em>$1</em></strong>");
  // 굵게 **text** / __text__
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  // 기울임 *text* / _text_
  t = t.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  t = t.replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");
  // 취소선 ~~text~~
  t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  // 하이라이트 ==text==
  t = t.replace(
    /==([^=]+)==/g,
    '<mark style="background:#f9ab00;color:#f1f3f4;padding:0 3px;border-radius:2px">$1</mark>'
  );

  // 빼둔 코드/스포일러 복원
  t = t.replace(/\u0000HOLD(\d+)\u0000/g, (_, i) => holds[Number(i)]);
  return t;
}

// 마크다운 전체 → HTML
// opts.spoilerEnabled: 채팅에서는 <내용>을 스포일러로 처리
export function markdownToHtml(md, opts = {}) {
  const lines = (md || "").split("\n");
  const out = [];
  let i = 0;
  let spoilerCounter = 0;

  function inline(text) {
    const html = renderInline(text, {
      ...opts,
      keyPrefix: `${opts.keyPrefix || "s"}-${spoilerCounter++}`,
    });
    return html;
  }

  while (i < lines.length) {
    const line = lines[i];

    // 코드 블록 ```lang
    const fence = line.match(/^\s*```(\w*)\s*$/);
    if (fence) {
      const lang = fence[1];
      const buf = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // 닫는 ``` 건너뜀
      out.push(
        `<pre style="background:#f1f3f4;padding:12px 14px;border-radius:6px;overflow-x:auto;margin:8px 0"><code style="font-family:ui-monospace,Consolas,monospace;font-size:13px;color:#202124">${escapeHtml(
          buf.join("\n")
        )}</code></pre>` + (lang ? "" : "")
      );
      continue;
    }

    // 표 (| a | b | 다음 줄이 |---|---|)
    if (
      /^\s*\|.*\|\s*$/.test(line) &&
      i + 1 < lines.length &&
      /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1]) &&
      lines[i + 1].includes("-")
    ) {
      const parseRow = (r) =>
        r
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
      const headers = parseRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      const th = headers
        .map(
          (h) =>
            `<th style="border:1px solid #e8eaed;padding:6px 10px;background:#f8fafd;text-align:left">${inline(
              h
            )}</th>`
        )
        .join("");
      const tb = rows
        .map(
          (r) =>
            "<tr>" +
            r
              .map(
                (c) =>
                  `<td style="border:1px solid #e8eaed;padding:6px 10px">${inline(c)}</td>`
              )
              .join("") +
            "</tr>"
        )
        .join("");
      out.push(
        `<table style="border-collapse:collapse;margin:8px 0;font-size:14px"><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table>`
      );
      continue;
    }

    // 제목 # ~ ######
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const sizes = { 1: "1.7em", 2: "1.4em", 3: "1.2em", 4: "1.05em", 5: "0.95em", 6: "0.85em" };
      const border =
        level <= 2 ? "border-bottom:1px solid #e8eaed;padding-bottom:4px;" : "";
      out.push(
        `<div style="font-size:${sizes[level]};font-weight:700;margin:16px 0 6px;color:#202124;${border}">${inline(
          h[2]
        )}</div>`
      );
      i++;
      continue;
    }

    // 구분선 --- *** ___
    if (/^\s*([-*_])\s*\1\s*\1[\s\S]*$/.test(line) && /^[\s\-*_]+$/.test(line)) {
      out.push('<hr style="border:none;border-top:1px solid #e8eaed;margin:14px 0" />');
      i++;
      continue;
    }

    // 인용문 >
    if (/^\s*>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push(
        `<blockquote style="border-left:4px solid #5f6368;margin:8px 0;padding:4px 14px;color:#3c4043">${markdownToHtml(
          buf.join("\n"),
          opts
        )}</blockquote>`
      );
      continue;
    }

    // 체크리스트 / 목록 (중첩 지원)
    if (/^(\s*)([-*+]|\d+\.)\s+/.test(line)) {
      const items = [];
      const ordered = /^\s*\d+\./.test(line);
      const baseIndent = line.match(/^(\s*)/)[1].length;
      while (i < lines.length && /^(\s*)([-*+]|\d+\.)\s+/.test(lines[i])) {
        const m = lines[i].match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
        const indent = m[1].length;
        if (indent < baseIndent) break;
        let text = m[3];
        // 체크박스
        const task = text.match(/^\[([ xX])\]\s+(.*)$/);
        if (task) {
          const checked = task[1].toLowerCase() === "x";
          text = `<span style="color:${checked ? "#1e8e3e" : "#5f6368"}">${
            checked ? "☑" : "☐"
          }</span> ${inline(task[2])}`;
        } else {
          text = inline(text);
        }
        items.push(
          `<li style="margin:3px 0;margin-left:${(indent - baseIndent) * 16}px">${text}</li>`
        );
        i++;
      }
      const tag = ordered ? "ol" : "ul";
      out.push(
        `<${tag} style="margin:6px 0;padding-left:22px;line-height:1.6">${items.join("")}</${tag}>`
      );
      continue;
    }

    // 빈 줄
    if (line.trim() === "") {
      out.push('<div style="height:8px"></div>');
      i++;
      continue;
    }

    // 일반 문단
    out.push(`<div style="margin:2px 0;line-height:1.6">${inline(line)}</div>`);
    i++;
  }

  return out.join("");
}

export function MarkdownView({ content }) {
  return (
    <div
      style={{ color: "#202124", fontSize: 15, wordBreak: "break-word" }}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
    />
  );
}
