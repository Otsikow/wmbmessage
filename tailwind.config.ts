import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "hsl(var(--secondary-hover))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold-glow))",
        },
        "jesus-words": "hsl(var(--jesus-words))",
        "hero-bg": "hsl(var(--hero-bg))",
        "subtle-bg": "hsl(var(--subtle-bg))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Premium UI gradient colors
        "gradient-start": "hsl(var(--gradient-start))",
        "gradient-mid": "hsl(var(--gradient-mid))",
        "gradient-end": "hsl(var(--gradient-end))",
        neon: {
          blue: "hsl(var(--neon-blue))",
          purple: "hsl(var(--neon-purple))",
          cyan: "hsl(var(--neon-cyan))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "glass": "20px",
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--gold-glow) / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--gold-glow) / 0.6)" },
        },
        // Premium animated background keyframes
        "blob": {
          "0%, 100%": {
            transform: "translate3d(0, 0, 0) scale(1)",
          },
          "25%": {
            transform: "translate3d(30px, -50px, 0) scale(1.1)",
          },
          "50%": {
            transform: "translate3d(-20px, 20px, 0) scale(0.9)",
          },
          "75%": {
            transform: "translate3d(50px, 30px, 0) scale(1.05)",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translate3d(0, 0, 0)",
            opacity: "0.6",
          },
          "50%": {
            transform: "translate3d(10px, -20px, 0)",
            opacity: "1",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--primary) / 0.2), inset 0 0 20px hsl(var(--primary) / 0.05)",
          },
          "50%": {
            boxShadow: "0 0 40px hsl(var(--primary) / 0.4), inset 0 0 30px hsl(var(--primary) / 0.1)",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
        "gradient-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
        "float-slow": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-10px) rotate(2deg)",
          },
        },
        "pulse-soft": {
          "0%, 100%": {
            opacity: "0.8",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.02)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "glow": "glow 3s ease-in-out infinite",
        // Premium animations
        "blob": "blob 20s ease-in-out infinite",
        "float": "float 8s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
      },
      boxShadow: {
        elegant: "var(--shadow-elegant)",
        glow: "var(--shadow-glow)",
        // Glass card shadows
        "glass": "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
        "glass-elevated": "0 16px 48px rgba(0, 0, 0, 0.16), 0 4px 16px rgba(0, 0, 0, 0.12)",
        "glass-subtle": "0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
        "glass-hover": "0 20px 60px rgba(0, 0, 0, 0.18), 0 8px 24px rgba(0, 0, 0, 0.12)",
        "glass-hover-dark": "0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)",
        "neon": "0 0 30px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.15)",
        "neon-strong": "0 0 40px hsl(var(--primary) / 0.5), 0 0 80px hsl(var(--primary) / 0.25)",
        "inner-glow": "inset 0 1px 2px rgba(255, 255, 255, 0.15), inset 0 -1px 2px rgba(0, 0, 0, 0.1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        "mesh-gradient": "radial-gradient(at 40% 20%, hsla(240, 70%, 50%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280, 60%, 50%, 0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(200, 80%, 50%, 0.1) 0px, transparent 50%)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
