import React from "react";

/* ============================================================
   공용 아이콘 세트 (이모지 대신 선 굵기 2의 outline SVG로 통일)
   모두 currentColor를 써서 부모의 color 값을 그대로 물려받는다.
   ============================================================ */

const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

export const IconHome = (p) => (
  <svg {...base} {...p}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
  </svg>
);

export const IconAt = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5.5 8.28" />
  </svg>
);

export const IconStar = (p) => (
  <svg {...base} {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
  </svg>
);

export const IconShield = (p) => (
  <svg {...base} {...p}>
    <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
  </svg>
);

export const IconGear = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const IconTrophy = (p) => (
  <svg {...base} {...p}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 5H4a2 2 0 0 0 2 4M17 5h3a2 2 0 0 1-2 4" />
  </svg>
);

export const IconGrid = (p) => (
  <svg {...base} {...p} viewBox="0 0 16 16">
    <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" stroke="none" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" stroke="none" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" stroke="none" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const IconDoc = (p) => (
  <svg {...base} {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

export const IconGame = (p) => (
  <svg {...base} {...p}>
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <line x1="7" y1="12" x2="11" y2="12" />
    <line x1="9" y1="10" x2="9" y2="14" />
    <circle cx="16" cy="11" r="1" fill="currentColor" />
    <circle cx="18.5" cy="13.5" r="1" fill="currentColor" />
  </svg>
);

export const IconMenu = (p) => (
  <svg {...base} {...p}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const IconSearch = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const IconHelp = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const IconExpand = (p) => (
  <svg {...base} {...p}>
    <polyline points="7 7 3 12 7 17" />
    <polyline points="17 7 21 12 17 17" />
  </svg>
);

export const IconApps = (p) => (
  <svg {...base} {...p} viewBox="0 0 16 16" fill="currentColor" stroke="none">
    <circle cx="2" cy="2" r="1.4" /><circle cx="8" cy="2" r="1.4" /><circle cx="14" cy="2" r="1.4" />
    <circle cx="2" cy="8" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="14" cy="8" r="1.4" />
    <circle cx="2" cy="14" r="1.4" /><circle cx="8" cy="14" r="1.4" /><circle cx="14" cy="14" r="1.4" />
  </svg>
);

export const IconBack = (p) => (
  <svg {...base} {...p}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const IconImage = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const IconFolder = (p) => (
  <svg {...base} {...p}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconCheckSquare = (p) => (
  <svg {...base} {...p}>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export const IconClipboard = (p) => (
  <svg {...base} {...p}>
    <path d="M4 21V8a2 2 0 0 1 2-2h1V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h1a2 2 0 0 1 2 2v13" />
    <path d="M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" />
  </svg>
);

export const IconPin = (p) => (
  <svg {...base} {...p}>
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14l-1.4-1.4a2 2 0 0 1-.6-1.4V9a5 5 0 0 0-10 0v5.2a2 2 0 0 1-.6 1.4z" />
  </svg>
);

export const IconPlus = (p) => (
  <svg {...base} {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconSmile = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

export const IconBold = (p) => (
  <svg {...base} {...p}>
    <path d="M6 12h8a4 4 0 0 0 0-8H6zM6 12h9a4 4 0 0 1 0 8H6z" />
  </svg>
);

export const IconAttach = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const IconUpload = (p) => (
  <svg {...base} {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const IconMic = (p) => (
  <svg {...base} {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

export const IconSend = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M3 11l18-8-8 18-2-8z" />
  </svg>
);

export const IconChevronDown = (p) => (
  <svg {...base} {...p}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const IconReply = (p) => (
  <svg {...base} {...p}>
    <polyline points="9 14 4 9 9 4" />
    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
  </svg>
);

export const IconTrash = (p) => (
  <svg {...base} {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const IconEyeOff = (p) => (
  <svg {...base} {...p}>
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const IconCamera = (p) => (
  <svg {...base} {...p}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const IconX = (p) => (
  <svg {...base} {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconEdit = (p) => (
  <svg {...base} {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export const IconChevronRight = (p) => (
  <svg {...base} {...p}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
