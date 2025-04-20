<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {
  darkTheme,
  lightTheme,
  NConfigProvider,
  NDialogProvider,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider
} from 'naive-ui'
import {RouterView} from 'vue-router'

const isDarkMode = ref(false)

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    localStorage.setItem('darkMode', isDarkMode.value.toString())
  }
  
  applyThemeClass(isDarkMode.value)
})

window.addEventListener('themeChange', ((event: CustomEvent) => {
  isDarkMode.value = event.detail.isDark
  applyThemeClass(isDarkMode.value)
}) as EventListener)

watch(isDarkMode, (newValue) => {
  applyThemeClass(newValue)
})

const applyThemeClass = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark-theme')
    document.documentElement.classList.remove('light-theme')
  } else {
    document.documentElement.classList.add('light-theme')
    document.documentElement.classList.remove('dark-theme')
  }
}

const theme = computed(() => {
  return isDarkMode.value ? darkTheme : lightTheme
})
</script>

<template>
  <n-config-provider :theme="theme">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <RouterView />
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style>
:root {
  --primary-color: #18a058;
  --text-color: #333;
  --background-color: #fff;
  --card-background: #f5f5f5;
  --border-color: #eaeaea;
  --surface-color: #ffffff;
  --surface-light-color: #f5f5f5;
  --text-secondary-color: #666;
}

.dark-theme {
  --text-color: #e5e5e5;
  --background-color: #121212;
  --card-background: #1e1e1e;
  --border-color: #333;
  --surface-color: #1e1e1e;
  --surface-light-color: #2c2c2c;
  --text-secondary-color: #aaa;
}

.light-theme {
  --text-color: #333;
  --background-color: #fff;
  --card-background: #f5f5f5;
  --border-color: #eaeaea;
  --surface-color: #ffffff;
  --surface-light-color: #f5f5f5;
  --text-secondary-color: #666;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

.bg-surface {
  background-color: var(--surface-color);
}

.border-surface-light {
  border-color: var(--border-color);
}

.text-text-secondary {
  color: var(--text-secondary-color);
}

.bg-background-lighter {
  background-color: var(--surface-light-color);
}
</style>
