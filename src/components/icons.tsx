import type { SVGProps } from 'react'

// Lightweight inline icon set (stroke-based, currentColor) — no icon dependency.
type P = SVGProps<SVGSVGElement>
const base = (props: P) => ({
  width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...props,
})

export const HomeIcon = (p: P) => (<svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></svg>)
export const SearchIcon = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>)
export const HeartIcon = (p: P) => (<svg {...base(p)}><path d="M12 20s-7-4.5-9.5-9A4.8 4.8 0 0 1 12 5.5 4.8 4.8 0 0 1 21.5 11C19 15.5 12 20 12 20Z" /></svg>)
export const ChatIcon = (p: P) => (<svg {...base(p)}><path d="M21 11.5a8 8 0 0 1-11.6 7.1L3 21l2.4-6.4A8 8 0 1 1 21 11.5Z" /></svg>)
export const UserIcon = (p: P) => (<svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>)
export const BedIcon = (p: P) => (<svg {...base(p)}><path d="M3 18v-6h18v6" /><path d="M3 12V7h8v5" /><path d="M3 18v2M21 18v2" /></svg>)
export const BathIcon = (p: P) => (<svg {...base(p)}><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" /><path d="M6 12V6a2 2 0 0 1 3.4-1.4" /><path d="M5 19l-1 2M19 19l1 2" /></svg>)
export const PinIcon = (p: P) => (<svg {...base(p)}><path d="M12 21s-6.5-5.4-6.5-10A6.5 6.5 0 0 1 18.5 11C18.5 15.6 12 21 12 21Z" /><circle cx="12" cy="11" r="2.2" /></svg>)
export const ShieldCheck = (p: P) => (<svg {...base(p)}><path d="M12 3 5 6v5c0 4.5 3 7.6 7 9 4-1.4 7-4.5 7-9V6l-7-3Z" /><path d="m9.2 11.8 1.9 1.9 3.7-3.7" /></svg>)
export const WalletIcon = (p: P) => (<svg {...base(p)}><path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /><path d="M3 7V6a2 2 0 0 1 2-2h11" /><circle cx="16.5" cy="13" r="1.2" /></svg>)
export const BellIcon = (p: P) => (<svg {...base(p)}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M9.5 19a2.5 2.5 0 0 0 5 0" /></svg>)
export const CalendarIcon = (p: P) => (<svg {...base(p)}><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v3M16 3v3" /></svg>)
export const PlusIcon = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>)
export const ChevronLeft = (p: P) => (<svg {...base(p)}><path d="m15 18-6-6 6-6" /></svg>)
export const ChevronRight = (p: P) => (<svg {...base(p)}><path d="m9 18 6-6-6-6" /></svg>)
export const CheckIcon = (p: P) => (<svg {...base(p)}><path d="m5 12 5 5 9-10" /></svg>)
export const XIcon = (p: P) => (<svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>)
export const FilterIcon = (p: P) => (<svg {...base(p)}><path d="M3 5h18M6 12h12M10 19h4" /></svg>)
export const SendIcon = (p: P) => (<svg {...base(p)}><path d="m22 2-7 20-4-9-9-4 20-7Z" /></svg>)
export const PaperclipIcon = (p: P) => (<svg {...base(p)}><path d="M21 11.5 12 20a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8" /></svg>)
export const StarIcon = (p: P) => (<svg {...base(p)}><path d="m12 3 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19l1-5.8L3.5 9l5.9-.9L12 3Z" /></svg>)
export const TrendingIcon = (p: P) => (<svg {...base(p)}><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>)
export const AlertIcon = (p: P) => (<svg {...base(p)}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17h.01" /></svg>)
export const UsersIcon = (p: P) => (<svg {...base(p)}><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3.5 3.5 0 0 1 0 6.5M21 20a6 6 0 0 0-4-5.6" /></svg>)
export const DocIcon = (p: P) => (<svg {...base(p)}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" /><path d="M14 3v6h6M8 13h8M8 17h6" /></svg>)
export const LogoutIcon = (p: P) => (<svg {...base(p)}><path d="M15 12H3M9 8l-4 4 4 4" /><path d="M11 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" /></svg>)
export const PhoneIcon = (p: P) => (<svg {...base(p)}><rect x="7" y="2" width="10" height="20" rx="2.5" /><path d="M11 18h2" /></svg>)
export const CameraIcon = (p: P) => (<svg {...base(p)}><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L19 6h0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" /><circle cx="12" cy="12.5" r="3.2" /></svg>)
