/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'sans-serif'],
          display: ['"Inter Tight"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
          mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        },
        colors: {
          // Light — Notion inspired
          notion: {
            bg: '#FFFFFF',
            secondary: '#F7F7F5',
            hover: '#EFEFEA',
            border: '#E9E9E6',
            borderstrong: '#D9D9D3',
            text: '#111111',
            muted: '#6F6E69',
            faint: '#9B9A93',
          },
          // Dark — Jev / TypeSafe docs inspired
          jev: {
            bg: '#0A0A0A',
            surface: '#111111',
            raised: '#161616',
            border: '#232323',
            borderstrong: '#2E2E2E',
            text: '#EDEDED',
            muted: '#A1A1A1',
            faint: '#6E6E6E',
          },
          accent: {
            DEFAULT: '#F471B6',
            strong: '#EC4899',
            muted: '#F9A8D4',
          },
        },
        borderRadius: {
          apple: '12px',
          'apple-lg': '14px',
          'apple-xl': '16px',
          'apple-2xl': '20px',
        },
        boxShadow: {
          // flat Apple-style, no glow
          apple: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
          'apple-md': '0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06)',
          'apple-dark': '0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.45)',
        },
      },
    },
    plugins: []
  }
