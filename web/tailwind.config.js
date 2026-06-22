/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink)',
        'ink-soft': 'var(--color-ink-soft)',
        bg: 'var(--color-bg)',
        panel: 'var(--color-panel)',
        line: 'var(--color-line)',
        muted: 'var(--color-muted)',
        reel: 'var(--color-reel)',
        'reel-soft': 'var(--color-reel-soft)',
        percu: 'var(--color-percu)',
        'percu-soft': 'var(--color-percu-soft)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
