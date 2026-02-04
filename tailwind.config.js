/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Navy & Gold Theme
        schoolGreen: '#0f172a', 
        schoolGold: '#d97706',  
        schoolCyan: '#0ea5e9',  
        cream: '#f8fafc',       
      },
      fontFamily: {
        // This connects to the HTML link above
        serif: ['Playfair Display', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}