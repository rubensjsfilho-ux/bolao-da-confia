/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ['"Nunito"', 'sans-serif'],
      },
      colors: {
        navy:  '#002855',
        green: { DEFAULT:'#009639', dark:'#007a2e', light:'#e8f5ee' },
        gold:  { DEFAULT:'#F5A623', light:'#FEF3DC' },
        muted: '#6B7A8D',
        border:'#E2EAF0',
        bg:    '#F4F6F9',
      },
    },
  },
  plugins: [],
}
