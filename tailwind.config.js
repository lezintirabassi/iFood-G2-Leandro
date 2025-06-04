/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ifood-red': '#EA1D2C',
        'ifood-gray': '#717171'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}