import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630
};

export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1f2937 50%, #0f172a 100%)',
          color: '#f8fafc',
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          padding: '0 80px'
        }}
      >
        <div style={{ fontSize: 28, color: '#38bdf8', marginBottom: 20 }}>
          Visualize Node.js async execution
        </div>
        Node.js Event Loop Visualizer
        <div style={{ fontSize: 24, color: '#94a3b8', marginTop: 24 }}>
          Timers, microtasks, nextTick, and libuv phases
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height
    }
  );
}
