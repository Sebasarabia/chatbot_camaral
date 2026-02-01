import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        slate: "#1f2937",
        sand: "#f8f7f4",
        accent: "#0ea5e9"
      }
    }
  },
  plugins: []
};

export default config;
