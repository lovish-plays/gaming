import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0f',
          borderRadius: 40,
          border: '4px solid #00ff87',
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00ff87"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* D-pad cross */}
          <line x1="6" x2="10" y1="12" y2="12" stroke="#00ff87" strokeWidth="2" />
          <line x1="8" x2="8" y1="10" y2="14" stroke="#00ff87" strokeWidth="2" />
          {/* Controller action button dots */}
          <circle cx="16" cy="10" r="1" fill="#00ff87" />
          <circle cx="18" cy="12" r="1" fill="#f59e0b" />
          <circle cx="16" cy="14" r="1" fill="#38bdf8" />
          <circle cx="14" cy="12" r="1" fill="#ec4899" />
          {/* Controller contour */}
          <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
