/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        shell: "#f7f3ed",
        shellDeep: "#f2ebe2",
        ink: "#17313a",
        teal: {
          50: "#eef8f7",
          100: "#d3ece7",
          200: "#a9d8d0",
          300: "#7ec2b9",
          400: "#57ab9f",
          500: "#3b8e84",
          600: "#2d756d",
          700: "#205954",
          800: "#173f3d",
          900: "#102d2f",
        },
        sand: {
          50: "#fcfaf7",
          100: "#f7f3ed",
          200: "#efe6d9",
          300: "#e5d8c4",
        },
        success: "#78b393",
        warning: "#d8a55d",
        danger: "#d67d73",
        info: "#7b9cc8",
      },
      fontFamily: {
        sans: ["Manrope", "Avenir Next", "Segoe UI", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        panel: "0 16px 36px rgba(15, 61, 62, 0.08)",
        card: "0 10px 30px rgba(15, 61, 62, 0.06)",
        soft: "0 10px 30px rgba(15, 61, 62, 0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "shell-glow":
          "radial-gradient(circle at 0% 0%, rgba(123, 156, 200, 0.12), transparent 24%), radial-gradient(circle at 100% 0%, rgba(59, 142, 132, 0.1), transparent 28%), linear-gradient(180deg, #faf7f2 0%, #f7f3ee 42%, #f4efe8 100%)",
      },
    },
  },
  plugins: [],
};
