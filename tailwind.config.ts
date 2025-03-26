import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
  darkMode: "class",
  theme: {
    extend: {

      keyframes: {
        scalePulse: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.2)',
            opacity: '0.8',
          },
        },
      },
      animation: {
        'scale-pulse': 'scalePulse 0.8s ease-in-out infinite', 
      },
    },
  },
  plugins: [],
};

export default config; 