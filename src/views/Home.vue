<script setup lang="ts">
import {computed, onMounted, ref, onBeforeUnmount} from 'vue'
import {useRouter} from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import {useInterviewStore} from '../stores/interview'
import {statisticsApi} from '../services/api'
import {format} from 'date-fns'
import {useTimerService} from '../services/timerService'
import {useNotificationService} from '../services/notificationService'
import type {Interview} from '../types'
import {
  NButton,
  NCard,
  NEmpty,
  NGi,
  NGrid,
  NIcon,
  NNumberAnimation,
  NSpace,
  NSpin,
  NStatistic,
  NTag,
  NTimeline,
  NTimelineItem,
  NProgress,
  NTooltip
} from 'naive-ui'
import {
  BusinessOutline,
  CalendarOutline,
  CheckmarkCircleOutline,
  TimeOutline,
  TrendingDownOutline,
  TrendingUpOutline,
  NotificationsOutline
} from '@vicons/ionicons5'
import {handleApiError, handleSuccess} from '../utils/errorHandler'

const router = useRouter()
const interviewStore = useInterviewStore()
const isLoading = ref(true)
const statsData = ref({
  totalInterviews: 0,
  upcomingInterviews: 0,
  completedInterviews: 0,
  rejectedInterviews: 0,
  byStatus: {},
  byCompany: [],
  byMonth: []
})

const timerService = useTimerService()
const notificationService = useNotificationService()
const remindersEnabled = ref(true)

const stats = computed(() => {
  const interviews = interviewStore.interviews

  const totalInterviews = statsData.value.totalInterviews || interviews.length
  const upcomingInterviews = statsData.value.upcomingInterviews || interviewStore.upcomingInterviews.length
  const completedInterviews = statsData.value.completedInterviews || interviews.filter(i => i.status === 'completed').length
  const rejectedInterviews = statsData.value.rejectedInterviews || interviews.filter(i => i.status === 'rejected').length
  const successRate = totalInterviews > 0
    ? Number(((completedInterviews / totalInterviews) * 100).toFixed(2))
    : 0

  return {
    totalInterviews,
    upcomingInterviews,
    completedInterviews,
    rejectedInterviews,
    successRate
  }
})

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy')
  } catch (error) {
    handleApiError(error, 'Error formatting date')
    return dateString
  }
}

const formatTime = (timeString: string) => {
  return timeString
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'info'
    case 'confirmed':
      return 'default'
    case 'completed':
      return 'success'
    case 'rejected':
      return 'error'
    case 'cancelled':
      return 'warning'
    default:
      return 'default'
  }
}

const navigateTo = (path: string) => {
  if (path === 'new-interview') {
    router.push({ name: 'NewInterview' })
  } else if (path === 'interviews') {
    router.push({ name: 'Interviews' })
  } else {
    router.push(path)
  }
}

const toggleReminders = async () => {
  remindersEnabled.value = !remindersEnabled.value

  if (remindersEnabled.value) {
    await setupInterviewReminders()
    handleSuccess('Interview reminders enabled')
  } else {
    timerService.clearAllReminders()
    handleSuccess('Interview reminders disabled', 'Info')
  }
}

const setupInterviewReminders = async () => {
  if (remindersEnabled.value) {
    await timerService.setupReminders((interview: Interview & { reminderLabel?: string }) => {
      notificationService.notifyUpcomingInterview(interview)
    })
  }
}

const getCountdownProgress = (minutes: number) => {
  if (minutes < 0) {
    return 100
  }

  if (minutes < 24 * 60) {
    return Number((100 - (minutes / (24 * 60) * 100)).toFixed(2))
  }
  else if (minutes < 7 * 24 * 60) {
    return Number((100 - (minutes / (7 * 24 * 60) * 100)).toFixed(2))
  }

  return 5
}

onMounted(async () => {
  try {
    isLoading.value = true

    await interviewStore.fetchInterviews()

    await setupInterviewReminders()

    try {
      statsData.value = await statisticsApi.getInterviewStats()
    } catch (err) {
      handleApiError(err, 'Failed to load statistics')
    }
  } catch (err) {
    handleApiError(err, 'Failed to load interviews')
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  timerService.clearAllReminders()
})

const upcomingWithRemaining = computed(() => {
  return timerService.upcomingWithRemaining.value || []
})
</script>

<template>
  <MainLayout>
    <div class="page-container">
      <n-space vertical size="large">
        <n-space justify="space-between" align="center">
          <div>
            <h1 style="margin-bottom: 4px;">Dashboard</h1>
            <p style="margin: 0; color: var(--text-color); opacity: 0.6;">Your interview tracking overview</p>
          </div>

          <n-space>
            <n-tooltip trigger="hover" placement="bottom">
              <template #trigger>
                <n-button 
                  circle 
                  :type="remindersEnabled ? 'primary' : 'default'" 
                  @click="toggleReminders"
                >
                  <template #icon>
                    <n-icon><NotificationsOutline /></n-icon>
                  </template>
                </n-button>
              </template>
              {{ remindersEnabled ? 'Disable reminders' : 'Enable reminders' }}
            </n-tooltip>
            
            <n-button type="primary" @click="navigateTo('new-interview')">
              <template #icon>
                <n-icon><CalendarOutline /></n-icon>
              </template>
              New Interview
            </n-button>
          </n-space>
        </n-space>

        <div v-if="isLoading || interviewStore.isLoading" style="display: flex; justify-content: center; padding: 40px;">
          <n-spin size="large" />
        </div>

        <template v-else>
          <n-grid cols="1 s:2 m:4" :x-gap="16" :y-gap="16">
            <n-gi>
              <n-card>
                <n-statistic label="Total Interviews">
                  <template #prefix>
                    <n-icon color="var(--primary-color)">
                      <BusinessOutline />
                    </n-icon>
                  </template>
                  <n-number-animation
                    :from="0"
                    :to="stats.totalInterviews"
                    :duration="1000"
                  />
                </n-statistic>
              </n-card>
            </n-gi>

            <n-gi>
              <n-card>
                <n-statistic label="Upcoming Interviews">
                  <template #prefix>
                    <n-icon color="var(--primary-color)">
                      <CalendarOutline />
                    </n-icon>
                  </template>
                  <n-number-animation
                    :from="0"
                    :to="stats.upcomingInterviews"
                    :duration="1000"
                  />
                </n-statistic>
              </n-card>
            </n-gi>

            <n-gi>
              <n-card>
                <n-statistic label="Completed Interviews">
                  <template #prefix>
                    <n-icon color="var(--success-color)">
                      <CheckmarkCircleOutline />
                    </n-icon>
                  </template>
                  <n-number-animation
                    :from="0"
                    :to="stats.completedInterviews"
                    :duration="1000"
                  />
                </n-statistic>
              </n-card>
            </n-gi>

            <n-gi>
              <n-card>
                <n-statistic label="Success Rate">
                  <template #prefix>
                    <n-icon :color="stats.successRate >= 50 ? 'var(--success-color)' : 'var(--error-color)'">
                      <TrendingUpOutline v-if="stats.successRate >= 50" />
                      <TrendingDownOutline v-else />
                    </n-icon>
                  </template>
                  <n-number-animation
                    :from="0"
                    :to="stats.successRate"
                    :duration="1000"
                  />
                  <template #suffix>%</template>
                </n-statistic>
              </n-card>
            </n-gi>
          </n-grid>

          <n-card title="Upcoming Interviews">
            <template #header-extra>
              <n-button text @click="navigateTo('interviews')">
                View All
              </n-button>
            </template>

            <div v-if="interviewStore.upcomingInterviews.length === 0">
              <n-empty description="No upcoming interviews">
                <template #extra>
                  <n-button type="primary" @click="navigateTo('new-interview')">
                    Schedule an Interview
                  </n-button>
                </template>
              </n-empty>
            </div>

            <n-timeline v-else>
              <n-timeline-item
                v-for="interview in upcomingWithRemaining"
                :key="interview.id"
                :type="getStatusType(interview.status)"
                :title="interview.companyName"
              >
                <template #icon>
                  <n-icon><TimeOutline /></n-icon>
                </template>

                <n-space vertical>
                  <div>
                    <strong>{{ interview.position }}</strong>
                    <n-tag :type="getStatusType(interview.status)" size="small" round style="margin-left: 8px;">
                      {{ interview.status.charAt(0).toUpperCase() + interview.status.slice(1) }}
                    </n-tag>
                  </div>

                  <div>
                    <n-space>
                      <span>{{ formatDate(interview.date) }}</span>
                      <span>{{ formatTime(interview.time) }}</span>
                      <span>{{ interview.type === 'onsite' ? 'On-site' : interview.type === 'remote' ? 'Remote' : 'Phone' }}</span>
                    </n-space>
                  </div>
                  
                  <div class="countdown-container">
                    <n-space align="center">
                      <n-icon :color="interview.minutes < 60 ? 'var(--error-color)' : interview.minutes < 24 * 60 ? 'var(--warning-color)' : 'var(--success-color)'">
                        <TimeOutline />
                      </n-icon>
                      <span>{{ interview.timeRemaining }}</span>
                    </n-space>
                    <n-progress 
                      type="line" 
                      :percentage="getCountdownProgress(interview.minutes)" 
                      :color="interview.minutes < 60 ? 'var(--error-color)' : interview.minutes < 24 * 60 ? 'var(--warning-color)' : 'var(--success-color)'"
                      :height="8"
                      :border-radius="4"
                    />
                  </div>

                  <div>
                    <n-button text size="small" @click="navigateTo(`interviews/${interview.id}`)">
                      View Details
                    </n-button>
                  </div>
                </n-space>
              </n-timeline-item>
            </n-timeline>
          </n-card>

          <n-card title="Past Interviews">
            <template #header-extra>
              <n-button text @click="navigateTo('interviews')">
                View All
              </n-button>
            </template>

            <div v-if="interviewStore.pastInterviews.length === 0">
              <n-empty description="No past interviews" />
            </div>

            <n-timeline v-else>
              <n-timeline-item
                v-for="interview in interviewStore.pastInterviews.slice(0, 5)"
                :key="interview.id"
                :type="getStatusType(interview.status)"
                :title="interview.companyName"
              >
                <template #icon>
                  <n-icon><TimeOutline /></n-icon>
                </template>

                <n-space vertical>
                  <div>
                    <strong>{{ interview.position }}</strong>
                    <n-tag :type="getStatusType(interview.status)" size="small" round style="margin-left: 8px;">
                      {{ interview.status.charAt(0).toUpperCase() + interview.status.slice(1) }}
                    </n-tag>
                  </div>

                  <div>
                    <n-space>
                      <span>{{ formatDate(interview.date) }}</span>
                      <span>{{ formatTime(interview.time) }}</span>
                      <span>{{ interview.type === 'onsite' ? 'On-site' : interview.type === 'remote' ? 'Remote' : 'Phone' }}</span>
                    </n-space>
                  </div>

                  <div>
                    <n-button text size="small" @click="navigateTo(`interviews/${interview.id}`)">
                      View Details
                    </n-button>
                  </div>
                </n-space>
              </n-timeline-item>
            </n-timeline>
          </n-card>

          <n-card title="Recent Activity">
            <template #header-extra>
              <n-button text @click="navigateTo('interviews')">
                View All
              </n-button>
            </template>

            <div v-if="interviewStore.interviews.length === 0">
              <n-empty description="No recent activity" />
            </div>

            <n-timeline v-else>
              <n-timeline-item
                v-for="interview in [...interviewStore.interviews].sort((a, b) =>
                  new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                ).slice(0, 5)"
                :key="interview.id"
                :type="getStatusType(interview.status)"
                :title="interview.companyName"
              >
                <template #icon>
                  <n-icon><TimeOutline /></n-icon>
                </template>

                <n-space vertical>
                  <div>
                    <strong>{{ interview.position }}</strong>
                    <n-tag :type="getStatusType(interview.status)" size="small" round style="margin-left: 8px;">
                      {{ interview.status.charAt(0).toUpperCase() + interview.status.slice(1) }}
                    </n-tag>
                  </div>

                  <div>
                    <n-space>
                      <span>{{ formatDate(interview.date) }}</span>
                      <span>{{ formatTime(interview.time) }}</span>
                      <span>{{ interview.type === 'onsite' ? 'On-site' : interview.type === 'remote' ? 'Remote' : 'Phone' }}</span>
                    </n-space>
                  </div>

                  <div>
                    <n-button text size="small" @click="navigateTo(`interviews/${interview.id}`)">
                      View Details
                    </n-button>
                  </div>
                </n-space>
              </n-timeline-item>
            </n-timeline>
          </n-card>
        </template>
      </n-space>
    </div>
  </MainLayout>
</template>

<style scoped>
.countdown-container {
  margin: 8px 0;
  width: 100%;
}
</style>
