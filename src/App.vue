<script setup lang="ts">
import { onMounted, watch } from 'vue'
import {
  NConfigProvider,
  NDialogProvider,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider
} from 'naive-ui'
import { RouterView } from 'vue-router'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'
import { useWebSocket } from './services/websocket'
import { startInterviewReminderService, stopInterviewReminderService } from './services/interviewReminder'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const { connect, disconnect } = useWebSocket()

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    connect()
    startInterviewReminderService()
  } else {
    disconnect()
    stopInterviewReminderService()
  }
}, { immediate: true })

onMounted(() => {
  themeStore.initTheme()
})
</script>

<template>
  <n-config-provider :theme="themeStore.theme" :theme-overrides="themeStore.themeOverrides">
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
  --success-color: #18a058;
  --error-color: #d03050;
  --warning-color: #f0a020;
}

.dark-theme {
  --text-color: #e5e5e5;
  --background-color: #121212;
  --card-background: #1e1e1e;
  --border-color: #333;
  --surface-color: #1e1e1e;
  --surface-light-color: #2c2c2c;
  --text-secondary-color: #aaa;
  --success-color: #18a058;
  --error-color: #d03050;
  --warning-color: #f0a020;
}

.light-theme {
  --text-color: #333;
  --background-color: #fff;
  --card-background: #f5f5f5;
  --border-color: #eaeaea;
  --surface-color: #ffffff;
  --surface-light-color: #f5f5f5;
  --text-secondary-color: #666;
  --success-color: #18a058;
  --error-color: #d03050;
  --warning-color: #f0a020;
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
