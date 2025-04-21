<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideNavigation from './SideNavigation.vue'
import TopBar from './TopBar.vue'
import {
  NButton,
  NDrawer,
  NDrawerContent,
  NGradientText,
  NIcon,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLayoutSider,
  NSpace,
  NTooltip
} from 'naive-ui'
import {
  MenuOutline,
  MoonOutline,
  SunnyOutline
} from '@vicons/ionicons5'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const showDrawer = ref(false)
const showSidebar = ref(true)

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

// @ts-ignore
const handleUserDropdown = (key: string) => {
  if (key === 'settings') {
    router.push('/settings')
  } else if (key === 'logout') {
    authStore.logout()
  }
}

onMounted(() => {
  console.log('MainLayout mounted, auth state:', authStore.isAuthenticated)
})
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
              <n-button quaternary circle @click="themeStore.toggleDarkMode">
                <template #icon>
                  <n-icon>
                    <MoonOutline v-if="!themeStore.isDarkMode" />
                    <SunnyOutline v-else />
                  </n-icon>
                </template>
              </n-button>
            </template>
            {{ themeStore.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}
          </n-tooltip>
        </n-space>
      </n-space>
    </n-layout-header>
    
    <!-- Mobile drawer -->
    <n-drawer v-model:show="showDrawer" placement="left" :width="280">
      <n-drawer-content title="WorkFlowGo" closable>
        <SideNavigation @close-drawer="showDrawer = false" />
      </n-drawer-content>
    </n-drawer>
    
    <!-- Desktop layout -->
    <n-layout has-sider position="absolute" style="top: 0; bottom: 0; left: 0; right: 0;">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :collapsed="!showSidebar"
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
        <!-- Use custom TopBar component instead of Naive UI header -->
        <TopBar @toggle-sidebar="toggleSidebar" />
        
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

.desktop-sider {
  display: none;
}

.content {
  padding: 24px;
  margin-top: 0;
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
  }
}
</style>
