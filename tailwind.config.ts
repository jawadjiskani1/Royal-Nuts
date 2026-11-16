import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B1F3A", 700: "#14305A", 50: "#E8ECF2" },
        gold: { DEFAULT: "#D4AF65", dark: "#A98536", light: "#EBD6A4" },
        forest: { DEFAULT: "#123526", 700: "#1E5240" },
        cream: { DEFAULT: "#F8F4EA", dark: "#EFE8D6" },
        ink: "#17212B"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      maxWidth: { page: "76rem" },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--tilt, 0deg))" },
          "50%": { transform: "translateY(-12px) rotate(calc(var(--tilt, 0deg) + 4deg))" }
        },
        "slide-in": { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pop-in": { from: { opacity: "0", transform: "translateY(-6px) scale(.98)" }, to: { opacity: "1", transform: "none" } },
        "hero-rise": { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "none" } }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "slide-in": "slide-in .28s cubic-bezier(.2,.8,.2,1)",
        "fade-in": "fade-in .2s ease-out",
        "pop-in": "pop-in .15s ease-out",
        "hero-rise": "hero-rise .7s cubic-bezier(.2,.8,.2,1) both"
      }
    }
  },
  plugins: []
};
export default config;
