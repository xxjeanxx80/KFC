/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E4002B', // KFC Red
        'primary-hover': '#B00020',
        secondary: '#64748b', // Slate Gray
        success: '#10b981', // Emerald
        warning: '#f59e0b', // Amber
        danger: '#ef4444', // Red
        background: '#F3F4F6', // Light Gray
        'background-dark': '#0B1120', // Deep dark blue/gray
        surface: '#FFFFFF',
        'surface-dark': '#1F2937',
        'border-light': '#E5E7EB',
        'border-dark': '#374151',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
