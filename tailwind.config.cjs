/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme color palette
        primary: {
          DEFAULT: '#6366F1', // Indigo
          hover: '#4F46E5',
          light: '#818CF8',
          dark: '#4338CA',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Violet
          hover: '#7C3AED',
          light: '#A78BFA',
          dark: '#6D28D9',
        },
        accent: {
          DEFAULT: '#EC4899', // Pink
          hover: '#DB2777',
          light: '#F472B6',
          dark: '#BE185D',
        },
        background: {
          DEFAULT: '#111827', // Dark gray
          light: '#1F2937',
          dark: '#030712',
        },
        surface: {
          DEFAULT: '#1F2937', // Medium gray
          light: '#374151',
          dark: '#111827',
        },
        text: {
          DEFAULT: '#F9FAFB', // Light gray
          light: '#FFFFFF',
          dark: '#E5E7EB',
          muted: '#9CA3AF',
        },
        // Light theme color palette
        'light-primary': {
          DEFAULT: '#3B82F6', // Blue
          hover: '#2563EB',
          light: '#60A5FA',
          dark: '#1D4ED8',
        },
        'light-secondary': {
          DEFAULT: '#8B5CF6', // Violet
          hover: '#7C3AED',
          light: '#A78BFA',
          dark: '#6D28D9',
        },
        'light-accent': {
          DEFAULT: '#EC4899', // Pink
          hover: '#DB2777',
          light: '#F472B6',
          dark: '#BE185D',
        },
        'light-background': {
          DEFAULT: '#FFFFFF', // White
          light: '#F9FAFB',
          dark: '#F3F4F6',
        },
        'light-surface': {
          DEFAULT: '#F3F4F6', // Light gray
          light: '#F9FAFB',
          dark: '#E5E7EB',
        },
        'light-text': {
          DEFAULT: '#111827', // Dark gray
          light: '#1F2937',
          dark: '#030712',
          muted: '#6B7280',
        },
      },
    },
  },
  plugins: [],
}
