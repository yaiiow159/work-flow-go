<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { useInterviewStore } from '../stores/interview'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay } from 'date-fns'
import { 
  NCard, 
  NSpace, 
  NButton, 
  NIcon, 
  NSpin, 
  NGrid,
  NGi,
  NPopover,
  NTag,
  NEmpty,
  useMessage
} from 'naive-ui'
import {
  AddOutline,
  TimeOutline,
  BusinessOutline,
  LocationOutline,
  ChevronBackOutline,
  ChevronForwardOutline
} from '@vicons/ionicons5'

const interviewStore = useInterviewStore()
const message = useMessage()
const isLoading = ref(true)

const currentDate = ref(new Date())
const currentMonth = computed(() => format(currentDate.value, 'MMMM yyyy'))

const calendarDays = computed(() => {
  const monthStart = startOfMonth(currentDate.value)
  const monthEnd = endOfMonth(currentDate.value)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const startDay = getDay(monthStart)
  
  const emptyDays = Array(startDay).fill(null)
  
  return [...emptyDays, ...days]
})

const getInterviewsForDay = (day: Date | null) => {
  if (!day) return []
  
  return interviewStore.interviews.filter(interview => {
    const interviewDate = new Date(interview.date)
    return isSameDay(interviewDate, day)
  })
}

const formatDate = (date: Date) => {
  return format(date, 'd')
}

const formatTime = (timeString: string) => {
  return timeString
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return '#2080f0'
    case 'confirmed':
      return '#18a058'
    case 'completed':
      return '#63e2b7'
    case 'rejected':
      return '#d03050'
    case 'cancelled':
      return '#f0a020'
    default:
      return '#909399'
  }
}

const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const goToCurrentMonth = () => {
  currentDate.value = new Date()
}

onMounted(async () => {
  try {
    await interviewStore.fetchInterviews()
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
        <!-- Header -->
        <n-space justify="space-between" align="center">
          <div>
            <h1 style="margin-bottom: 4px;">Calendar</h1>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.6);">View your interviews in calendar format</p>
          </div>
          
          <n-button type="primary" tag="a" href="/interviews/new">
            <template #icon>
              <n-icon><AddOutline /></n-icon>
            </template>
            New Interview
          </n-button>
        </n-space>
        
        <n-card>
          <n-space justify="space-between" align="center">
            <n-space>
              <n-button quaternary circle @click="previousMonth">
                <template #icon>
                  <n-icon><ChevronBackOutline /></n-icon>
                </template>
              </n-button>
              
              <h3 style="margin: 0 16px;">{{ currentMonth }}</h3>
              
              <n-button quaternary circle @click="nextMonth">
                <template #icon>
                  <n-icon><ChevronForwardOutline /></n-icon>
                </template>
              </n-button>
            </n-space>
            
            <n-button @click="goToCurrentMonth">
              Today
            </n-button>
          </n-space>
        </n-card>
        
        <n-card>
          <div v-if="isLoading || interviewStore.isLoading" style="display: flex; justify-content: center; padding: 40px;">
            <n-spin size="large" />
          </div>
          
          <template v-else>
            <n-grid cols="7" :x-gap="4" :y-gap="4">
              <n-gi v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">
                <div style="text-align: center; font-weight: 500; padding: 8px;">
                  {{ day }}
                </div>
              </n-gi>
            </n-grid>
            
            <!-- Calendar Days -->
            <n-grid cols="7" :x-gap="4" :y-gap="4">
              <n-gi v-for="(day, index) in calendarDays" :key="index">
                <div 
                  :class="[
                    'calendar-day',
                    day && isToday(day) ? 'today' : '',
                    !day ? 'empty-day' : ''
                  ]"
                >
                  <div v-if="day" class="day-number">
                    {{ formatDate(day) }}
                  </div>

                  <div v-if="day" class="day-events">
                    <n-popover
                      v-for="interview in getInterviewsForDay(day)"
                      :key="interview.id"
                      trigger="hover"
                      placement="bottom"
                    >
                      <template #trigger>
                        <div 
                          class="event" 
                          :style="{ backgroundColor: getStatusColor(interview.status) }"
                        >
                          <div class="event-title">{{ interview.companyName }}</div>
                          <div class="event-time">{{ formatTime(interview.time) }}</div>
                        </div>
                      </template>
                      
                      <div style="max-width: 300px;">
                        <h4 style="margin-top: 0;">{{ interview.companyName }}</h4>
                        <p style="margin: 4px 0;">{{ interview.position }}</p>
                        
                        <n-space vertical size="small">
                          <n-space align="center">
                            <n-icon><TimeOutline /></n-icon>
                            <span>{{ formatTime(interview.time) }}</span>
                          </n-space>
                          
                          <n-space align="center" v-if="interview.location">
                            <n-icon><LocationOutline /></n-icon>
                            <span>{{ interview.location }}</span>
                          </n-space>
                          
                          <n-space align="center">
                            <n-icon><BusinessOutline /></n-icon>
                            <span>{{ interview.type === 'onsite' ? 'On-site' : interview.type === 'remote' ? 'Remote' : 'Phone' }}</span>
                          </n-space>
                          
                          <n-tag :type="interview.status === 'scheduled' ? 'info' : 
                                  interview.status === 'confirmed' ? 'primary' : 
                                  interview.status === 'completed' ? 'success' : 
                                  interview.status === 'rejected' ? 'error' : 'warning'" 
                                  size="small" round>
                            {{ interview.status.charAt(0).toUpperCase() + interview.status.slice(1) }}
                          </n-tag>
                        </n-space>
                        
                        <div style="margin-top: 8px;">
                          <n-button size="small" tag="a" :href="`/interviews/${interview.id}`">
                            View Details
                          </n-button>
                        </div>
                      </div>
                    </n-popover>
                    
                    <n-empty 
                      v-if="getInterviewsForDay(day).length === 0" 
                      size="small" 
                      description="No interviews"
                      style="padding: 4px; height: 40px;"
                    />
                  </div>
                </div>
              </n-gi>
            </n-grid>
          </template>
        </n-card>
      </n-space>
    </div>
  </MainLayout>
</template>

<style scoped>
.calendar-day {
  min-height: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 4px;
  position: relative;
}

.empty-day {
  background-color: rgba(0, 0, 0, 0.1);
}

.today {
  background-color: rgba(32, 128, 240, 0.1);
  border-color: rgba(32, 128, 240, 0.5);
}

.day-number {
  position: absolute;
  top: 4px;
  right: 4px;
  font-weight: 500;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.day-events {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event {
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-title {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  font-size: 10px;
  opacity: 0.8;
}
</style>
