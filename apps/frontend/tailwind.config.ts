import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      // ── Color tokens ──────────────────────────────────────────────────────
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary:   { DEFAULT: 'hsl(var(--primary))',    foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))',  foreground: 'hsl(var(--secondary-foreground))' },
        destructive:{ DEFAULT:'hsl(var(--destructive))',foreground:'hsl(var(--destructive-foreground))'},
        muted:     { DEFAULT: 'hsl(var(--muted))',      foreground: 'hsl(var(--muted-foreground))' },
        accent:    { DEFAULT: 'hsl(var(--accent))',     foreground: 'hsl(var(--accent-foreground))' },
        popover:   { DEFAULT: 'hsl(var(--popover))',    foreground: 'hsl(var(--popover-foreground))' },
        card:      { DEFAULT: 'hsl(var(--card))',       foreground: 'hsl(var(--card-foreground))' },
        success:   { DEFAULT: 'hsl(var(--success))',    foreground: 'hsl(var(--success-foreground))' },
        warning:   { DEFAULT: 'hsl(var(--warning))',    foreground: 'hsl(var(--warning-foreground))' },
        info:      { DEFAULT: 'hsl(var(--info))',       foreground: 'hsl(var(--info-foreground))' },
        // Macro colors
        protein:  { DEFAULT: 'hsl(var(--macro-protein))',  light: 'hsl(var(--macro-protein-light))' },
        carbs:    { DEFAULT: 'hsl(var(--macro-carbs))',    light: 'hsl(var(--macro-carbs-light))' },
        fats:     { DEFAULT: 'hsl(var(--macro-fats))',     light: 'hsl(var(--macro-fats-light))' },
        fiber:    { DEFAULT: 'hsl(var(--macro-fiber))',    light: 'hsl(var(--macro-fiber-light))' },
        calories: { DEFAULT: 'hsl(var(--macro-calories))', light: 'hsl(var(--macro-calories-light))' },
      },
      // ── Border radius ─────────────────────────────────────────────────────
      borderRadius: {
        lg:   'var(--radius)',
        md:   'calc(var(--radius) - 2px)',
        sm:   'calc(var(--radius) - 4px)',
        xl:   'calc(var(--radius) + 4px)',
        '2xl':'calc(var(--radius) + 8px)',
        '3xl':'calc(var(--radius) + 16px)',
      },
      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'var(--font-sans)', ...fontFamily.sans],
        mono: ['JetBrains Mono', 'var(--font-mono)', ...fontFamily.mono],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      // ── Spacing (8px grid) ────────────────────────────────────────────────
      spacing: {
        '4.5':  '1.125rem',
        '13':   '3.25rem',
        '15':   '3.75rem',
        '18':   '4.5rem',
        '22':   '5.5rem',
        '68':   '17rem',
        '76':   '19rem',
        '88':   '22rem',
        '100':  '25rem',
        '128':  '32rem',
      },
      // ── Shadows ───────────────────────────────────────────────────────────
      boxShadow: {
        'xs':     '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'sm':     '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'md':     '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'lg':     '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
        'xl':     '0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.07)',
        'glow':   '0 0 20px -4px hsl(var(--primary) / 0.4)',
        'glow-sm':'0 0 10px -2px hsl(var(--primary) / 0.3)',
        'card':   '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'inner-sm':   'inset 0 1px 3px 0 rgb(0 0 0 / 0.06)',
      },
      // ── Animations ────────────────────────────────────────────────────────
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in':        { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out':       { from: { opacity: '1' }, to: { opacity: '0' } },
        'slide-up':       { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'slide-down':     { from: { transform: 'translateY(-8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-out-right':{ from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        'scale-in':       { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        'shimmer':        { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        'bounce-in':      { '0%': { transform: 'scale(0.3)', opacity: '0' }, '50%': { transform: 'scale(1.05)' }, '70%': { transform: 'scale(0.9)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'pulse-ring':     { '0%': { transform: 'scale(0.8)', opacity: '1' }, '100%': { transform: 'scale(2)', opacity: '0' } },
        'count-up':       { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'fade-in':         'fade-in 0.2s ease-out',
        'fade-out':        'fade-out 0.2s ease-out',
        'slide-up':        'slide-up 0.25s ease-out',
        'slide-down':      'slide-down 0.25s ease-out',
        'slide-in-right':  'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
        'scale-in':        'scale-in 0.2s ease-out',
        'shimmer':         'shimmer 1.8s infinite linear',
        'bounce-in':       'bounce-in 0.4s ease-out',
        'pulse-ring':      'pulse-ring 1.5s ease-out infinite',
        'count-up':        'count-up 0.4s ease-out',
        'spin-slow':       'spin 3s linear infinite',
      },
      // ── Transitions ───────────────────────────────────────────────────────
      transitionTimingFunction: {
        'spring':    'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth':    'cubic-bezier(0.4, 0, 0.2, 1)',
        'snap':      'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
