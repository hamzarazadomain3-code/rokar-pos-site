type IconProps = {
  name: string;
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

const PATHS: Record<string, React.ReactNode> = {
  zap: (
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" fill="currentColor" stroke="none" />
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" />
      <path d="M4 19a2 2 0 0 1 2-2h13" />
    </>
  ),
  box: (
    <>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </>
  ),
  truck: (
    <>
      <path d="M1 6h13v11H1z" />
      <path d="M14 9h4l4 4v4h-8" />
      <circle cx="6" cy="18.5" r="1.6" />
      <circle cx="17" cy="18.5" r="1.6" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.5 20c.6-3.6 3-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <circle cx="17.5" cy="9" r="2.6" />
      <path d="M16 14.7c2.5.3 4.2 1.8 4.8 4.3" />
    </>
  ),
  tag: (
    <>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1.3" />
    </>
  ),
  cloud: (
    <path d="M6.5 19a4.5 4.5 0 0 1-.3-9A6 6 0 0 1 18 8.5a4.8 4.8 0 0 1 .5 10.5H6.5z" />
  ),
  printer: (
    <>
      <path d="M7 8V3h10v5" />
      <rect x="4" y="8" width="16" height="8" rx="2" />
      <path d="M7 16h10v5H7z" />
      <circle cx="6.5" cy="12" r=".8" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z" />
      <path
        d="M8.8 7.8c-.4.8-.1 2 .8 3.2.9 1.2 1.9 2.1 3.4 2.7 1 .4 1.8.5 2.4.2l.4-1-1.8-.9-.9 1c-.3 0-.7-.2-1.2-.5-.6-.4-1.3-1-1.9-1.9-.4-.6-.4-1.1-.3-1.4l.8-1.2-.8-1.7c-.6-.1-.9-.1-.9-.5z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18M8 21h8" />
      <path d="M5 7l7-2 7 2-3.5 9.5a4 4 0 0 1-7 0L5 7z" />
      <path d="M12 5.5c.8-1 .5-2 .5-2s.6 1-.5 2z" fill="currentColor" stroke="none" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v11" />
      <path d="M7 10l5 5 5-5" />
      <path d="M4 19h16" />
    </>
  ),
  check: <path d="M4 12.5l5 5L20 6.5" />,
  window: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18" />
    </>
  ),
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  play: <path d="M7 4.5v15l13-7.5-13-7.5z" fill="currentColor" stroke="none" />,
  phone: (
    <path d="M6 2h4l1.5 5L9 9.5a13 13 0 0 0 5.5 5.5L17 13l5 1.5v4a2 2 0 0 1-2.2 2A18.5 18.5 0 0 1 4 6.2 2 2 0 0 1 6 2z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 7.5 12 14l9-6.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      <path d="M8.5 11.5l2.5 2.5 4.5-4.5" />
    </>
  ),
  quote: (
    <>
      <path d="M10 8H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v-3" stroke="none" fill="currentColor" />
      <path d="M21 8h-5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v-3" stroke="none" fill="currentColor" />
      <path d="M10 3.5 7.5 8M21 3.5 18.5 8" />
    </>
  ),
  chevron: <path d="M9 5l7 7-7 7" />,
};

export default function Icon({ name, size = 24, strokeWidth = 1.8, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {PATHS[name] ?? PATHS.check}
    </svg>
  );
}