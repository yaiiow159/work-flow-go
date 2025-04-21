<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { userSettingsApi } from '../services/api'
import type { UserSettingsRequest } from '../types'
import { useThemeStore } from '../stores/theme'
import { 
  NCard, 
  NSpace, 
  NGrid, 
  NGi, 
  NButton, 
  NIcon, 
  NSwitch,
  NSelect,
  NForm,
  NFormItem,
  NDivider,
  NInput,
  NColorPicker,
  NRadioGroup,
  NRadio,
  NAlert,
  NSpin
} from 'naive-ui'
import {
  SaveOutline,
  ColorPaletteOutline,
  NotificationsOutline,
  CalendarOutline,
  PersonOutline
} from '@vicons/ionicons5'
import { handleApiError, handleSuccess } from '../utils/errorHandler'

const isLoading = ref(true)
const themeStore = useThemeStore()

interface UserSettings {
  theme: {
    primaryColor: string
  }
  notifications: {
    enabled: boolean
    emailNotifications: boolean
    reminderTime: string
  }
  display: {
    defaultView: 'calendar' | 'list'
    compactMode: boolean
  }
  profile: {
    name: string
    email: string
  }
}

const userSettings = ref<UserSettings>({
  theme: {
    primaryColor: '#6366F1'
  },
  notifications: {
    enabled: true,
    emailNotifications: true,
    reminderTime: '1day'
  },
  display: {
    defaultView: 'calendar',
    compactMode: false
  },
  profile: {
    name: 'John Doe',
    email: 'john.doe@example.com'
  }
})

const reminderOptions = [
  { label: '30 minutes before', value: '30min' },
  { label: '1 hour before', value: '1hour' },
  { label: '3 hours before', value: '3hours' },
  { label: '1 day before', value: '1day' },
  { label: '2 days before', value: '2days' }
]

const viewOptions = [
  { label: 'Calendar', value: 'calendar' },
  { label: 'List', value: 'list' }
]

onMounted(async () => {
  try {
    isLoading.value = true
    const data = await userSettingsApi.get()
    
    userSettings.value = {
      theme: {
        primaryColor: themeStore.primaryColor
      },
      notifications: data.preferences?.notifications || {
        enabled: true,
        emailNotifications: true,
        reminderTime: '1day'
      },
      display: {
        defaultView: themeStore.defaultView,
        compactMode: themeStore.compactMode
      },
      profile: {
        name: data.name || 'User',
        email: data.email || 'user@example.com'
      }
    }
  } catch (error) {
    handleApiError(error, 'Failed to Load Settings')
  } finally {
    isLoading.value = false
  }
})

const saveSettings = async () => {
  try {
    isLoading.value = true
    
    themeStore.setPrimaryColor(userSettings.value.theme.primaryColor)
    themeStore.setCompactMode(userSettings.value.display.compactMode)
    themeStore.setDefaultView(userSettings.value.display.defaultView)
    
    const settingsRequest: UserSettingsRequest = {
      name: userSettings.value.profile.name,
      email: userSettings.value.profile.email,
      preferences: {
        theme: {
          darkMode: themeStore.isDarkMode,
          primaryColor: userSettings.value.theme.primaryColor
        },
        notifications: userSettings.value.notifications,
        display: userSettings.value.display
      }
    }
    
    await userSettingsApi.update(settingsRequest)
    handleSuccess('Settings saved successfully')
  } catch (error) {
    handleApiError(error, 'Failed to Save Settings')
  } finally {
    isLoading.value = false
  }
}

const resetSettings = async () => {
  try {
    isLoading.value = true
    
    // Call the reset settings API
    const data = await userSettingsApi.resetSettings()
    
    // Update local state with the returned default settings
    userSettings.value = {
      theme: {
        primaryColor: data.preferences?.theme?.primaryColor || '#4a69bd'
      },
      notifications: data.preferences?.notifications || {
        enabled: true,
        emailNotifications: true,
        reminderTime: '1day'
      },
      display: {
        defaultView: (data.preferences?.display?.defaultView || 'calendar') as 'calendar' | 'list',
        compactMode: data.preferences?.display?.compactMode || false
      },
      profile: {
        name: data.name || userSettings.value.profile.name,
        email: data.email || userSettings.value.profile.email
      }
    }
    
    // Update theme store with new values
    themeStore.setPrimaryColor(userSettings.value.theme.primaryColor)
    themeStore.setCompactMode(userSettings.value.display.compactMode)
    themeStore.setDefaultView(userSettings.value.display.defaultView)
    
    handleSuccess('Settings reset to defaults')
  } catch (error) {
    handleApiError(error, 'Failed to Reset Settings')
  } finally {
    isLoading.value = false
  }
}

const exportData = async () => {
  try {
    isLoading.value = true
    
    const data = await userSettingsApi.exportData()
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'workflowgo-data-export.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    handleSuccess('Data exported successfully')
  } catch (error) {
    handleApiError(error, 'Failed to Export Data')
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <MainLayout>
    <div class="page-container">
      <n-space vertical size="large">
        <div>
          <h1 style="margin-bottom: 4px;">Settings</h1>
          <p style="margin: 0; color: var(--text-color);">Customize your interview tracking experience</p>
        </div>

        <div v-if="isLoading" style="display: flex; justify-content: center; padding: 40px;">
          <n-spin size="large" />
        </div>

        <n-grid v-else cols="1 l:4" :x-gap="24" :y-gap="24">
          <n-gi span="1">
            <n-card>
              <n-space vertical>
                <a href="#theme" class="settings-nav-item">
                  <n-icon><ColorPaletteOutline /></n-icon>
                  <span>Theme</span>
                </a>
                <a href="#notifications" class="settings-nav-item">
                  <n-icon><NotificationsOutline /></n-icon>
                  <span>Notifications</span>
                </a>
                <a href="#display" class="settings-nav-item">
                  <n-icon><CalendarOutline /></n-icon>
                  <span>Display</span>
                </a>
                <a href="#profile" class="settings-nav-item">
                  <n-icon><PersonOutline /></n-icon>
                  <span>Profile</span>
                </a>
              </n-space>
            </n-card>
          </n-gi>

          <n-gi span="1 l:3">
            <n-space vertical size="large">
              <n-card title="Theme Settings" id="theme">
                <template #header-extra>
                  <n-icon><ColorPaletteOutline /></n-icon>
                </template>

                <n-form>
                  <n-form-item label="Dark Mode">
                    <n-switch v-model:value="themeStore.isDarkMode" @update:value="themeStore.toggleDarkMode" />
                  </n-form-item>

                  <n-form-item label="Primary Color">
                    <n-color-picker v-model:value="userSettings.theme.primaryColor" />
                  </n-form-item>
                </n-form>
              </n-card>

              <n-card title="Notification Settings" id="notifications">
                <template #header-extra>
                  <n-icon><NotificationsOutline /></n-icon>
                </template>

                <n-form>
                  <n-form-item label="Enable Notifications">
                    <n-switch v-model:value="userSettings.notifications.enabled" />
                  </n-form-item>

                  <n-form-item label="Email Notifications">
                    <n-switch
                      v-model:value="userSettings.notifications.emailNotifications"
                      :disabled="!userSettings.notifications.enabled"
                    />
                  </n-form-item>

                  <n-form-item label="Reminder Time">
                    <n-select
                      v-model:value="userSettings.notifications.reminderTime"
                      :options="reminderOptions"
                      :disabled="!userSettings.notifications.enabled"
                    />
                  </n-form-item>
                </n-form>
              </n-card>

              <n-card title="Display Settings" id="display">
                <template #header-extra>
                  <n-icon><CalendarOutline /></n-icon>
                </template>

                <n-form>
                  <n-form-item label="Default View">
                    <n-radio-group v-model:value="userSettings.display.defaultView">
                      <n-space>
                        <n-radio v-for="option in viewOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </n-radio>
                      </n-space>
                    </n-radio-group>
                  </n-form-item>

                  <n-form-item label="Compact Mode">
                    <n-switch v-model:value="userSettings.display.compactMode" />
                  </n-form-item>
                </n-form>
              </n-card>

              <!-- Profile Settings -->
              <n-card title="Profile Settings" id="profile">
                <template #header-extra>
                  <n-icon><PersonOutline /></n-icon>
                </template>

                <n-form>
                  <n-form-item label="Name">
                    <n-input v-model:value="userSettings.profile.name" />
                  </n-form-item>

                  <n-form-item label="Email">
                    <n-input v-model:value="userSettings.profile.email" />
                  </n-form-item>
                </n-form>
              </n-card>

              <!-- Data Management -->
              <n-card title="Data Management">
                <n-alert type="info" title="Data Export" style="margin-bottom: 16px;">
                  You can export all your interview data and settings for backup or transfer.
                </n-alert>

                <n-space>
                  <n-button @click="exportData" :loading="isLoading">Export Data</n-button>
                </n-space>

                <n-divider />

                <n-alert type="warning" title="Reset Settings" style="margin-bottom: 16px;">
                  This will reset all your settings to default values. Your interview data will not be affected.
                </n-alert>

                <n-space>
                  <n-button type="warning" @click="resetSettings" :loading="isLoading">Reset to Defaults</n-button>
                </n-space>
              </n-card>

              <!-- Save Button -->
              <n-space justify="end">
                <n-button type="primary" @click="saveSettings" :loading="isLoading">
                  <template #icon>
                    <n-icon><SaveOutline /></n-icon>
                  </template>
                  Save Settings
                </n-button>
              </n-space>
            </n-space>
          </n-gi>
        </n-grid>
      </n-space>
    </div>
  </MainLayout>
</template>

<style scoped>
.settings-nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 4px;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.3s;
}

.settings-nav-item:hover {
  background-color: var(--hover-color);
}

.settings-nav-item .n-icon {
  margin-right: 12px;
}
</style>
