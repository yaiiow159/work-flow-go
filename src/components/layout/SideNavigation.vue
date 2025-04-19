<script setup lang="ts">
import { h, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  NMenu, 
  NIcon,
  NSpace,
  NButton,
  NDivider
} from 'naive-ui'
import {
  HomeOutline,
  BriefcaseOutline,
  CalendarOutline,
  DocumentOutline,
  SettingsOutline
} from '@vicons/ionicons5'
import UserProfile from './UserProfile.vue'

defineEmits(['close-drawer'])

const router = useRouter()
const route = useRoute()

const renderIcon = (icon: any) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = computed(() => [
  {
    label: 'Dashboard',
    key: '/',
    icon: renderIcon(HomeOutline)
  },
  {
    label: 'Interviews',
    key: '/interviews',
    icon: renderIcon(BriefcaseOutline)
  },
  {
    label: 'Calendar',
    key: '/calendar',
    icon: renderIcon(CalendarOutline)
  },
  {
    label: 'Documents',
    key: '/documents',
    icon: renderIcon(DocumentOutline)
  },
  {
    label: 'Settings',
    key: '/settings',
    icon: renderIcon(SettingsOutline)
  }
])

const activeKey = computed(() => {
  if (route.path === '/') return '/'
  
  const matchingOption = menuOptions.value.find(option =>
    route.path.startsWith(option.key) && option.key !== '/'
  )
  
  return matchingOption ? matchingOption.key : '/'
})

const handleMenuClick = (key: string) => {
  router.push(key)
}
</script>

<template>
  <div class="user-profile-container">
    <UserProfile />
  </div>
  
  <n-divider />
  
  <n-menu
    :options="menuOptions"
    :value="activeKey"
    @update:value="handleMenuClick"
  />
  
  <div class="mobile-new-interview">
    <n-space vertical>
      <n-button type="primary" block @click="router.push('/interviews/new')">
        New Interview
      </n-button>
    </n-space>
  </div>
</template>

<style scoped>
.user-profile-container {
  padding: 16px;
}

.mobile-new-interview {
  padding: 16px;
  margin-top: auto;
  display: none;
}

@media (max-width: 767px) {
  .mobile-new-interview {
    display: block;
  }
}
</style>
