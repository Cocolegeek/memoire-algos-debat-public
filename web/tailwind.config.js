/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#15172B',
        'ink-soft': '#2C2E4A',
        bg: '#ECEDF1',
        panel: '#FFFFFF',
        line: '#D9DBE3',
        muted: '#6B6F80',
        reel: '#1F8A86',
        'reel-soft': '#D5EAE9',
        percu: '#E06A3B',
        'percu-soft': '#F7DED2',
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
