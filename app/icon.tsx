import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#38bdf8',
          fontSize: 20,
          fontWeight: 700
        }}
      >
        EL
      </div>
    ),
    {
      width: size.width,
      height: size.height
    }
  );
}
