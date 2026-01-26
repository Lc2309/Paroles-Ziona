/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ziona-blue': '#060BEB',
        'ziona-yellow': '#FAD801',
        'ziona-red': '#F60302',
        'ziona-light': '#F5F5F5',
      },
      backgroundImage: {
        'ziona-gradient': 'linear-gradient(to right, #060BEB, #F60302)',
      }
    },
  },
  plugins: [],
}