import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const withOpacity = (cssVar: string) => `rgb(var(${cssVar}) / <alpha-value>)`;
const withAlphaVar = (cssVar: string, alphaVar: string) => `rgb(var(${cssVar}) / var(${alphaVar}, <alpha-value>))`;

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: withOpacity("--color-primary-100"),
          110: withOpacity("--color-primary-110"),
        },
        secondary: {
          100: withAlphaVar("--color-secondary-100", "--color-secondary-100-alpha"),
          110: withAlphaVar("--color-secondary-110", "--color-secondary-110-alpha"),
        },
        base: {
          dark: withOpacity("--color-base-dark"),
          gray: withOpacity("--color-base-gray"),
          black: withOpacity("--color-base-black"),
          gray40: withOpacity("--color-base-gray40"),
        },
        background: withOpacity("--color-background"),
      },
      backgroundImage: {
        "circle-1": "radial-gradient(42.13% 42.13% at 50% 50%, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
        "circle-2": "radial-gradient(48.26% 48.26% at 46.01% 56.3%, #84B0A8 4.69%, rgba(226, 250, 246, 0) 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderWidth: {
        "1": "1px",
      },
      zIndex: {
        "-1": "-1",
        "5": "5",
        "99": "99",
        "100": "100",
      },
      boxShadow: {
        search: "0px 29px 35px 0px #0C272233",
      },
    },
    fontSize: {
      inherit: "inherit",
      sm: "0.8rem",
      xs: "0.8rem",
      base: "1rem",
      xl: "1.25rem",
      lg: "1.25rem",
      "2xl": "1.563rem",
      "3xl": "1.953rem",
      "4xl": "2.441rem",
      "5xl": "3.052rem",
      body: [
        "16px",
        {
          lineHeight: "27.2px",
        },
      ],
      hightlight: [
        "20px",
        {
          lineHeight: "34px",
          fontWeight: "bold",
        },
      ],
    },
    animation: {
      marquee: "marquee 45s linear infinite",
      marquee2: "marquee2 45s linear infinite",
      pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    },
    keyframes: {
      marquee: {
        "0%": { transform: "translateX(0%)" },
        "100%": { transform: "translateX(-100%)" },
      },
      marquee2: {
        "0%": { transform: "translateX(100%)" },
        "100%": { transform: "translateX(0%)" },
      },
      pulse: {
        "0%, 100%": {
          opacity: "1",
        },
        "50%": {
          opacity: "0.5",
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, addComponents, addUtilities, theme }) {
      addUtilities({
        ".custom-block-box-path": {
          "clip-path": "polygon(0% 0%, 90% 0%, 100% 10px, 100% 100%, 0 100%)",
        },
        ".custom-heading-box-clip-path": {
          "clip-path": "polygon(0% 0%, 85% 0%, 100% 20%, 100% 100%, 0 100%)",
        },
        ".custom-homepage-heading-box-clip-path": {
          "clip-path": "polygon(0% 0%, calc(100% - 25px) 0%, 100% 15px, 100% 100%, 0 100%)",
        },
        ".custom-homepage-block-clip-path": {
          "clip-path": "polygon(0% 0%, 90% 0%, 100% 25%, 100% 100%, 0 100%)",
        },
        ".custom-wallet-clip-path": {
          "clip-path": "polygon(0% 0%, 92% 0%, 100% 30px, 100% 100%, 0 100%)",
        },
      });
    }),
  ],
};
export default config;
