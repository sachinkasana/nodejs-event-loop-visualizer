import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'Node.js Event Loop Visualizer',
    template: '%s | Node.js Event Loop Visualizer'
  },
  description:
    'Learn the Node.js event loop with an interactive visualizer. Explore timers, microtasks, nextTick, and libuv phases with live execution output.',
  applicationName: 'Node.js Event Loop Visualizer',
  keywords: [
    'Node.js',
    'event loop',
    'JavaScript',
    'async',
    'microtasks',
    'nextTick',
    'setTimeout',
    'setImmediate',
    'libuv',
    'visualizer'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Node.js Event Loop Visualizer',
    description:
      'Interactive visualization of Node.js asynchronous execution: timers, microtasks, nextTick, and libuv phases.',
    url: '/',
    siteName: 'Node.js Event Loop Visualizer',
    type: 'website',
    images: [
      {
        url: '/og'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Node.js Event Loop Visualizer',
    description:
      'Interactive visualization of Node.js asynchronous execution: timers, microtasks, nextTick, and libuv phases.',
    images: ['/og']
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
