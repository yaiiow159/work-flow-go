import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { darkTheme, lightTheme } from 'naive-ui'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(false)
  const primaryColor = ref('#4a69bd')
  const compactMode = ref(false)
  const defaultView = ref<'calendar' | 'list'>('calendar')

  const initTheme = () => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      isDarkMode.value = savedDarkMode === 'true'
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      localStorage.setItem('darkMode', isDarkMode.value.toString())
    }
    
    const savedPrimaryColor = localStorage.getItem('primaryColor')
    if (savedPrimaryColor) {
      primaryColor.value = savedPrimaryColor
    }
    
    const savedCompactMode = localStorage.getItem('compactMode')
    if (savedCompactMode !== null) {
      compactMode.value = savedCompactMode === 'true'
    }
    
    const savedDefaultView = localStorage.getItem('defaultView')
    if (savedDefaultView === 'calendar' || savedDefaultView === 'list') {
      defaultView.value = savedDefaultView
    }
    
    applyThemeClass(isDarkMode.value)
  }

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('darkMode', isDarkMode.value.toString())
    applyThemeClass(isDarkMode.value)
  }

  const setPrimaryColor = (color: string) => {
    primaryColor.value = color
    localStorage.setItem('primaryColor', color)
  }
  
  const setCompactMode = (value: boolean) => {
    compactMode.value = value
    localStorage.setItem('compactMode', value.toString())
  }
  
  const setDefaultView = (view: 'calendar' | 'list') => {
    defaultView.value = view
    localStorage.setItem('defaultView', view)
  }

  const applyThemeClass = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark-theme')
      document.documentElement.classList.remove('light-theme')
    } else {
      document.documentElement.classList.add('light-theme')
      document.documentElement.classList.remove('dark-theme')
    }
  }

  const themeOverrides = computed(() => {
    return {
      common: {
        primaryColor: primaryColor.value,
        primaryColorHover: adjustColor(primaryColor.value, 10),
        primaryColorPressed: adjustColor(primaryColor.value, -10)
      }
    }
  })

  const adjustColor = (hex: string, percent: number): string => {
    hex = hex.replace(/^#/, '')
    
    const bigint = parseInt(hex, 16)
    let r = (bigint >> 16) & 255
    let g = (bigint >> 8) & 255
    let b = bigint & 255
    
    r = Math.min(255, Math.max(0, r + percent))
    g = Math.min(255, Math.max(0, g + percent))
    b = Math.min(255, Math.max(0, b + percent))
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const theme = computed(() => {
    return isDarkMode.value ? darkTheme : lightTheme
  })

  watch(isDarkMode, (newValue) => {
    applyThemeClass(newValue)
  })

  return {
    isDarkMode,
    primaryColor,
    compactMode,
    defaultView,
    initTheme,
    toggleDarkMode,
    setPrimaryColor,
    setCompactMode,
    setDefaultView,
    theme,
    themeOverrides,
    adjustColor
  }
})
