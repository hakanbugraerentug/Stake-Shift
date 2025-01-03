/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1b1e23',      // Main background
          card: '#23272e',     // Card/container background
          hover: '#2a2f37',    // Hover state
          border: 'rgba(255, 255, 255, 0.05)',
          text: '#ffffff',
          muted: '#9ca3af',    // Secondary text
        },
      },
      borderRadius: {
        DEFAULT: '12px',
      },
    },
  },
  plugins: [],
} 