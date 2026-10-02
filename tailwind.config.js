/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        pokedex: {
          blue: '#0077B6',
          light: '#E6F4FE',
          dark: '#023E8A',
        },
      },
    },
  },
  plugins: [],
};
