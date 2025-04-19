<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import { useInterviewStore } from '../stores/interview'
import { statisticsApi } from '../services/api'
import { format } from 'date-fns'
import {
  NCard,
  NSpace,
  NButton,
  NIcon,
  NSpin,
  NEmpty,
  NGrid,
  NGi,
  NStatistic,
  NNumberAnimation,
  NTag,
  NTimeline,
  NTimelineItem,
  useMessage
} from 'naive-ui'
import {
  CalendarOutline,
  BusinessOutline,
  CheckmarkCircleOutline,
  TrendingUpOutline,
  TrendingDownOutline,
  TimeOutline
} from '@vicons/ionicons5'

const router = useRouter()
const interviewStore = useInterviewStore()
const message = useMessage()
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

const stats = computed(() => {
  const interviews = interviewStore.interviews

  const totalInterviews = statsData.value.totalInterviews || interviews.length
  const upcomingInterviews = statsData.value.upcomingInterviews || interviewStore.upcomingInterviews.length
  const completedInterviews = statsData.value.completedInterviews || interviews.filter(i => i.status === 'completed').length
  const rejectedInterviews = statsData.value.rejectedInterviews || interviews.filter(i => i.status === 'rejected').length
  const successRate = totalInterviews > 0
    ? Math.round((completedInterviews / totalInterviews) * 100)
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
  return format(new Date(dateString), 'MMM dd, yyyy')
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

// Navigate to a specific route
const navigateTo = (path: string) => {
  router.push({ name: path })
}

onMounted(async () => {
  try {
    isLoading.value = true

    await interviewStore.fetchInterviews()

    try {
      const data = await statisticsApi.getInterviewStats()
      statsData.value = data
    } catch (err) {
      console.error('Failed to load statistics:', err)
    }
  } catch (err) {
    console.error(err)
    message.error('Failed to load interviews')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <MainLayout>
    <div class="page-container">
      <n-space vertical size="large">
        <n-space justify="space-between" align="center">
          <div>
            <h1 style="margin-bottom: 4px;">Dashboard</h1>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.6);">Your interview tracking overview</p>
          </div>

          <n-button type="primary" @click="navigateTo('new-interview')">
            <template #icon>
              <n-icon><CalendarOutline /></n-icon>
            </template>
            New Interview
          </n-button>
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
                    <n-icon color="#63e2b7">
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
                    <n-icon color="#2080f0">
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
                    <n-icon color="#18a058">
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
                    <n-icon :color="stats.successRate >= 50 ? '#18a058' : '#d03050'">
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

          <!-- Upcoming Interviews -->
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
                v-for="interview in interviewStore.upcomingInterviews.slice(0, 5)"
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
