/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Path to your library components
    // If used in a host app, include host app paths: "./public/index.html", "./app/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      colors: {
        // Define custom colors for your module if needed
        // Example:
        // brand: {
        //   primary: '#...',
        //   secondary: '#...',
        // }
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.33)', opacity: '1' },
          '80%, 100%': { transform: 'scale(1)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        pulseRing: 'pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}; 