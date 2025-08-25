import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#27AE60",
          black: "#0B0B0B"
        },
        rarity: {
          milspec: "#B0B0B0",
          restricted: "#4C6FFF",
          classified: "#9B59B6",
          covert: "#E74C3C",
          legendary: "#FFD700"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
