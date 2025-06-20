// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F8FBFF",
        text: "#333333",
        primary: "#76C9F2",
        subtle: "#DDF1FB",
        accent: "#A6E3D7",
        warning: "#FFA099",
        link: "#B6B4F4",
        button: "#00AEFF",
      },
    },
  },
  plugins: [],
}
