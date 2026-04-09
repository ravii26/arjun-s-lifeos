import React from 'react';

export const Icons = {
  home: (filled = false) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {filled ? (
        <path d="M3 7.5L10 2L17 7.5V16.5C17 17.0523 16.5523 17.5 16 17.5H4C3.44772 17.5 3 17.0523 3 16.5V7.5Z" fill="currentColor" stroke="currentColor" />
      ) : (
        <path d="M3 7.5L10 2L17 7.5V16.5C17 17.0523 16.5523 17.5 16 17.5H4C3.44772 17.5 3 17.0523 3 16.5V7.5Z" />
      )}
      <path d="M7.5 17.5V10.5H12.5V17.5" stroke={filled ? "var(--surface-1)" : "currentColor"} />
    </svg>
  ),
  focus: (filled = false) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" fill={filled ? "currentColor" : "none"} />
      <path d="M6.5 10L9 12.5L13.5 7.5" stroke={filled ? "var(--surface-1)" : "currentColor"} />
    </svg>
  ),
  vault: (filled = false) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" fill={filled ? "currentColor" : "none"} />
      <path d="M10 9V12" stroke={filled ? "var(--surface-1)" : "currentColor"} />
      <circle cx="10" cy="8" r="1" fill={filled ? "var(--surface-1)" : "currentColor"} />
    </svg>
  ),
  learn: (filled = false) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4.5H7C8.10457 4.5 9 5.39543 9 6.5V16.5C9 15.6716 8.32843 15 7.5 15H3V4.5Z" fill={filled ? "currentColor" : "none"} />
      <path d="M17 4.5H13C11.8954 4.5 11 5.39543 11 6.5V16.5C11 15.6716 11.6716 15 12.5 15H17V4.5Z" fill={filled ? "currentColor" : "none"} />
    </svg>
  ),
  review: (filled = false) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="3" height="9" rx="0.5" fill={filled ? "currentColor" : "none"} />
      <rect x="8.5" y="5" width="3" height="12" rx="0.5" fill={filled ? "currentColor" : "none"} />
      <rect x="14" y="3" width="3" height="14" rx="0.5" fill={filled ? "currentColor" : "none"} />
    </svg>
  ),
  sun: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="4" />
      <path d="M10 2V4M10 16V18M2 10H4M16 10H18M4.22 4.22L5.64 5.64M14.36 14.36L15.78 15.78M4.22 15.78L5.64 14.36M14.36 5.64L15.78 4.22" />
    </svg>
  ),
  moon: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 11.36A7 7 0 118.64 3 5.5 5.5 0 0017 11.36z" />
    </svg>
  ),
  sparkle: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="var(--primary)" stroke="none">
      <path d="M10 2L11.5 7.5L17 6L12.5 10L17 14L11.5 12.5L10 18L8.5 12.5L3 14L7.5 10L3 6L8.5 7.5L10 2Z" />
    </svg>
  ),
  flame: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2C10 2 5 7 5 11.5C5 14.5376 7.23858 17 10 17C12.7614 17 15 14.5376 15 11.5C15 7 10 2 10 2Z" fill="var(--amber-muted-bg)" />
      <path d="M10 10C10 10 8 12 8 13.5C8 14.8807 8.89543 16 10 16C11.1046 16 12 14.8807 12 13.5C12 12 10 10 10 10Z" fill="var(--amber)" />
    </svg>
  ),
  plus: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 5V19M5 12H19" />
    </svg>
  ),
  more: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  ),
  arrowUp: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10V2M3 5L6 2L9 5" />
    </svg>
  ),
  arrowDown: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2V10M3 7L6 10L9 7" />
    </svg>
  ),
  arrowFlat: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 6H10" />
    </svg>
  ),
  check: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7L6 10L11 4" />
    </svg>
  ),
  close: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 5L15 15M15 5L5 15" />
    </svg>
  ),
  lock: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5 7V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7" />
    </svg>
  ),
  quote: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10C3 7 5 5 8 5V7C6 7 5 8 5 10H8V15H3V10Z" />
      <path d="M11 10C11 7 13 5 16 5V7C14 7 13 8 13 10H16V15H11V10Z" />
    </svg>
  ),
  video: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="12" height="12" rx="2" />
      <path d="M14 8L18 5.5V14.5L14 12" />
    </svg>
  ),
  note: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3H16C16.5523 3 17 3.44772 17 4V16C17 16.5523 16.5523 17 16 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3Z" />
      <path d="M7 7H13M7 10H13M7 13H10" />
    </svg>
  ),
  win: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z" />
    </svg>
  ),
  voiceNote: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="6" height="10" rx="3" />
      <path d="M4 10C4 13.3137 6.68629 16 10 16C13.3137 16 16 13.3137 16 10" />
      <path d="M10 16V18" />
    </svg>
  ),
  image: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <circle cx="7.5" cy="7.5" r="1.5" />
      <path d="M17 13L13 9L5 17" />
    </svg>
  ),
  search: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="6" />
      <path d="M13.5 13.5L17 17" />
    </svg>
  ),
  chevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6L8 10L12 6" />
    </svg>
  ),
  chevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4L10 8L6 12" />
    </svg>
  ),
  arrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 10H5M5 10L9 6M5 10L9 14" />
    </svg>
  ),
  book: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3H6C7 3 7.5 3.5 7.5 4.5V14C7.5 13.2 7 12.5 6 12.5H2V3Z" />
      <path d="M14 3H10C9 3 8.5 3.5 8.5 4.5V14C8.5 13.2 9 12.5 10 12.5H14V3Z" />
    </svg>
  ),
  checkCircle: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M5.5 8L7 9.5L10.5 6" />
    </svg>
  ),
  lockSmall: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="8" height="6" rx="1" />
      <path d="M4.5 6V4.5C4.5 3.11929 5.61929 2 7 2C8.38071 2 9.5 3.11929 9.5 4.5V6" />
    </svg>
  ),
  quoteOpen: () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="var(--primary)" opacity="0.3">
      <path d="M10 32C10 22 16 16 26 16V22C20 22 18 26 18 32H26V48H10V32Z" />
      <path d="M36 32C36 22 42 16 52 16V22C46 22 44 26 44 32H52V48H36V32Z" />
    </svg>
  ),
  drag: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="6" cy="4" r="1" /><circle cx="10" cy="4" r="1" />
      <circle cx="6" cy="8" r="1" /><circle cx="10" cy="8" r="1" />
      <circle cx="6" cy="12" r="1" /><circle cx="10" cy="12" r="1" />
    </svg>
  ),
  trash: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4H12M5 4V2.5H9V4M5 6V11M9 6V11M3 4L3.5 12.5H10.5L11 4" />
    </svg>
  ),
  info: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5.5" />
      <path d="M7 6V10M7 4.5V4.5" />
      <circle cx="7" cy="4.25" r="0.5" fill="currentColor" />
    </svg>
  ),
};
