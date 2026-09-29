import { SOCIAL_KEYS, SOCIAL_LABEL, type Social, type SocialKey } from "@/lib/social";

const ICONS: Record<SocialKey, React.ReactNode> = {
  facebook: <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21z" />,
  x: <path d="M17.8 3.5h2.9l-6.4 7.3 7.5 9.7h-5.9l-4.6-6-5.3 6H3.1l6.8-7.8L2.7 3.5h6l4.2 5.5zm-1 15.3h1.6L7.3 5.1H5.6z" />,
  youtube: <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15V9l5.2 3z" />,
  instagram: (
    <path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.8a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17 6a1.1 1.1 0 1 0 0 2.2A1.1 1.1 0 0 0 17 6zM12 3.6c2.7 0 3 0 4.1.1 2.8.1 4.1 1.4 4.2 4.2.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.7-1.4 4.1-4.2 4.2-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.8-.1-4.1-1.5-4.2-4.2C3.6 15 3.6 14.7 3.6 12s0-3 .1-4.1C3.8 5.1 5.1 3.8 7.9 3.7 9 3.6 9.3 3.6 12 3.6zM12 2c-2.7 0-3.1 0-4.1.1-3.7.2-5.7 2.2-5.9 5.9C2 8.9 2 9.3 2 12s0 3.1.1 4.1c.2 3.7 2.2 5.7 5.9 5.9 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.7-.2 5.7-2.2 5.9-5.9.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.2-3.7-2.2-5.7-5.9-5.9C15.1 2 14.7 2 12 2z" />
  ),
};

export function SocialLinks({ social }: { social: Social }) {
  const links = SOCIAL_KEYS.filter((k) => social[k]);
  if (!links.length) return null;
  return (
    <ul className="social">
      {links.map((k) => (
        <li key={k}>
          <a href={social[k]} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABEL[k]} title={SOCIAL_LABEL[k]}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              {ICONS[k]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
