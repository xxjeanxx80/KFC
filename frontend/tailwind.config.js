/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ea2a33', // KFC Red từ mẫu HTML
        'primary-hover': '#B00020',
        'background-light': '#f8f6f6',
        'background-dark': '#211111',
        'surface-dark': '#2d1b1c',
        secondary: '#64748b', // Slate Gray
        success: '#10b981', // Emerald
        warning: '#f59e0b', // Amber
        danger: '#ef4444', // Red
        background: '#F3F4F6', // Light Gray
        surface: '#FFFFFF',
        'border-light': '#E5E7EB',
        'border-dark': '#374151',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}
