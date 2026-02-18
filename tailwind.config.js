/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme colors
        primary: {
          DEFAULT: '#006400',
          light: '#228B22',
          dark: '#004d00',
        },
        accent: {
          DEFAULT: '#32CD32',
          light: '#7FFF00',
          dark: '#00FF00',
        },
        court: {
          green: '#2d5016',
          'green-light': '#3d6b1f',
          line: '#ffffff',
        },
        // Dark theme colors
        dark: {
          bg: '#121212',
          card: '#1E1E1E',
          text: '#E0E0E0',
          primary: '#66BB6A',
          accent: '#81C784',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 1.5s ease-in-out infinite',
        'bounce-slow': 'bounce 1s ease-in-out infinite',
      },
      boxShadow: {
        'court': '0 3px 10px rgba(0,100,0,0.2)',
        'player': '0 3px 10px rgba(0,0,0,0.2)',
        'serve': '0 4px 15px rgba(255,165,0,0.5)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
