/** @type {import('tailwindcss').Config} */
export default {
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
          lighter: '#1F2937',
          light: '#374151',
          dark: '#0F172A',
        },
        surface: {
          DEFAULT: '#1E293B', // Slate
          light: '#334155',
          dark: '#0F172A',
        },
        text: {
          DEFAULT: '#F9FAFB', // White
          secondary: '#E5E7EB',
          muted: '#9CA3AF',
          disabled: '#6B7280',
        },
        success: {
          DEFAULT: '#10B981', // Emerald
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber
          light: '#FBBF24',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444', // Red
          light: '#F87171',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6', // Blue
          light: '#60A5FA',
          dark: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'card': '0.75rem',
        'button': '0.5rem',
      },
    },
  },
  plugins: [],
}
