<script setup lang="ts">
import {h, onMounted, ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import SideNavigation from './SideNavigation.vue'
import {
  NAvatar,
  NBadge,
  NButton,
  NDrawer,
  NDrawerContent,
  NDropdown,
  NGradientText,
  NIcon,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLayoutSider,
  NSpace,
  NSwitch,
  NTooltip
} from 'naive-ui'
import {
  LogOutOutline,
  MenuOutline,
  MoonOutline,
  NotificationsOutline,
  SettingsOutline,
  SunnyOutline
} from '@vicons/ionicons5'
import {useAuthStore} from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showDrawer = ref(false)
const isDarkMode = ref(false)

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    localStorage.setItem('darkMode', isDarkMode.value.toString())
  }
  
  applyDarkMode(isDarkMode.value)
  
  window.dispatchEvent(new CustomEvent('themeChange', {
    detail: { isDark: isDarkMode.value } 
  }))
})

watch(isDarkMode, (newValue) => {
  applyDarkMode(newValue)
})

const userDropdownOptions = [
  {
    label: 'Settings',
    key: 'settings',
    icon: () => h(NIcon, null, { default: () => h(SettingsOutline) })
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: () => h(NIcon, null, { default: () => h(LogOutOutline) })
  }
]

const handleUserDropdown = (key: string) => {
  if (key === 'settings') {
    router.push('/settings')
  } else if (key === 'logout') {
    authStore.logout()
  }
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  
  window.dispatchEvent(new CustomEvent('themeChange', {
    detail: { isDark: isDarkMode.value } 
  }))
}

const applyDarkMode = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark-theme')
    document.documentElement.classList.remove('light-theme')
  } else {
    document.documentElement.classList.add('light-theme')
    document.documentElement.classList.remove('dark-theme')
  }
}
</script>

<template>
  <n-layout style="height: 100vh">
    <n-layout-header class="mobile-header" bordered>
      <n-space justify="space-between" align="center" style="height: 100%; padding: 0 16px;">
        <n-button quaternary circle @click="showDrawer = true">
          <template #icon>
            <n-icon><MenuOutline /></n-icon>
          </template>
        </n-button>
        
        <n-gradient-text type="primary" :size="24">
          WorkFlowGo
        </n-gradient-text>
        
        <n-space>
          <n-tooltip trigger="hover" placement="bottom">
            <template #trigger>
              <n-button quaternary circle @click="toggleDarkMode">
                <template #icon>
                  <n-icon>
                    <MoonOutline v-if="!isDarkMode" />
                    <SunnyOutline v-else />
                  </n-icon>
                </template>
              </n-button>
            </template>
            {{ isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}
          </n-tooltip>
        </n-space>
      </n-space>
    </n-layout-header>
    
    <n-drawer v-model:show="showDrawer" placement="left" :width="280">
      <n-drawer-content title="WorkFlowGo" closable>
        <SideNavigation @close-drawer="showDrawer = false" />
      </n-drawer-content>
    </n-drawer>
    
    <n-layout has-sider position="absolute" style="top: 0; bottom: 0; left: 0; right: 0;">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :native-scrollbar="false"
        class="desktop-sider"
      >
        <div style="padding: 16px; text-align: center;">
          <n-gradient-text type="primary" :size="24" style="font-weight: bold;">
            WorkFlowGo
          </n-gradient-text>
        </div>
        
        <SideNavigation />
      </n-layout-sider>
      
      <n-layout>
        <n-layout-header bordered class="desktop-header">
          <n-space justify="space-between" align="center" style="height: 100%; padding: 0 24px;">
            <div></div>
            
            <n-space>
              <n-tooltip trigger="hover" placement="bottom">
                <template #trigger>
                  <n-switch v-model:value="isDarkMode" @update:value="toggleDarkMode">
                    <template #checked>
                      <n-icon><MoonOutline /></n-icon>
                    </template>
                    <template #unchecked>
                      <n-icon><SunnyOutline /></n-icon>
                    </template>
                  </n-switch>
                </template>
                {{ isDarkMode ? 'Dark Mode' : 'Light Mode' }}
              </n-tooltip>
              
              <n-tooltip trigger="hover" placement="bottom">
                <template #trigger>
                  <n-badge dot type="info">
                    <n-button quaternary circle>
                      <template #icon>
                        <n-icon><NotificationsOutline /></n-icon>
                      </template>
                    </n-button>
                  </n-badge>
                </template>
                Notifications
              </n-tooltip>
              
              <n-dropdown
                trigger="click"
                :options="userDropdownOptions"
                @select="handleUserDropdown"
              >
                <n-button text>
                  <template #icon>
                    <n-avatar round size="small" src="https://i.pravatar.cc/150?img=68" />
                  </template>
                  <span style="margin-left: 8px;">User</span>
                </n-button>
              </n-dropdown>
            </n-space>
          </n-space>
        </n-layout-header>
        
        <n-layout-content class="content">
          <slot></slot>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.mobile-header {
  height: 64px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.desktop-header {
  height: 64px;
}

.desktop-sider {
  display: none;
}

.content {
  padding: 24px;
  margin-top: 64px;
}

@media (min-width: 768px) {
  .mobile-header {
    display: none;
  }
  
  .desktop-sider {
    display: block;
  }
  
  .content {
    margin-top: 0;
    min-height: calc(100vh - 64px);
  }
}
</style>
