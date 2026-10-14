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
        gym: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#10b981', // Emerald for health & fitness
          protein: '#3b82f6', // Blue for protein
          carbs: '#f59e0b',   // Amber for carbs
          fats: '#ec4899',    // Pink for healthy fats
          calories: '#8b5cf6' // Purple for calories
        }
      }
    },
  },
  plugins: [],
}
