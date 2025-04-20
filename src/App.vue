<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { darkTheme, lightTheme, NConfigProvider, NLoadingBarProvider, NDialogProvider, NNotificationProvider, NMessageProvider } from 'naive-ui'
import { RouterView } from 'vue-router'

const isDarkMode = ref(true)

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
  }
})

window.addEventListener('themeChange', ((event: CustomEvent) => {
  isDarkMode.value = event.detail.isDark
}) as EventListener)

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
}

.dark-theme {
  --text-color: #e5e5e5;
  --background-color: #121212;
  --card-background: #1e1e1e;
  --border-color: #333;
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
</style>
