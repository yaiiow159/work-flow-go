<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInterviewStore } from '../stores/interview'
import MainLayout from '../components/layout/MainLayout.vue'
import { format } from 'date-fns'
import type { Interview } from '../types'
import { 
  NCard, 
  NSpace, 
  NButton, 
  NIcon, 
  NSpin, 
  NGrid,
  NGi,
  NDivider,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NTabs,
  NTabPane,
  NEmpty,
  NList,
  NListItem,
  NThing,
  NPopconfirm,
  useMessage
} from 'naive-ui'
import {
  CalendarOutline,
  TimeOutline,
  BusinessOutline,
  LocationOutline,
  PersonOutline,
  MailOutline,
  CallOutline,
  DocumentTextOutline,
  PencilOutline,
  TrashOutline,
  ArrowBackOutline,
  StarOutline,
  ChatbubbleOutline
} from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()
const message = useMessage()

const isLoading = ref(true)
const interview = ref<Interview | null>(null)
const interviewId = computed(() => route.params.id as string)

// Format date for display
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMMM d, yyyy')
}

// Format time for display
const formatTime = (timeString: string) => {
  return timeString
}

// Get status type for tag color
const getStatusType = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'info'
    case 'confirmed':
      return 'primary'
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

// Delete interview
const deleteInterview = async () => {
  if (!interview.value) return
  
  try {
    const success = await interviewStore.deleteInterview(interview.value.id)
    if (success) {
      message.success('Interview deleted successfully')
      router.push('/interviews')
    } else {
      throw new Error('Failed to delete interview')
    }
  } catch (err) {
    console.error(err)
    message.error('Failed to delete interview')
  }
}

// Update interview status
const updateStatus = async (newStatus: string) => {
  if (!interview.value) return
  
  try {
    const updatedInterview = await interviewStore.updateInterviewStatus(interview.value.id, newStatus as any)
    if (updatedInterview) {
      interview.value = updatedInterview
      message.success('Status updated successfully')
    } else {
      throw new Error('Failed to update status')
    }
  } catch (err) {
    console.error(err)
    message.error('Failed to update status')
  }
}

// Fetch interview details
onMounted(async () => {
  try {
    const fetchedInterview = await interviewStore.getInterviewById(interviewId.value)
    if (fetchedInterview) {
      interview.value = fetchedInterview
    } else {
      message.error('Interview not found')
      router.push('/interviews')
    }
  } catch (err) {
    console.error(err)
    message.error('Failed to load interview details')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <MainLayout>
    <div class="page-container">
      <n-space vertical size="large">
        <!-- Loading state -->
        <div v-if="isLoading" style="display: flex; justify-content: center; padding: 40px;">
          <n-spin size="large" />
        </div>
        
        <template v-else-if="interview">
          <!-- Header -->
          <n-space justify="space-between" align="center">
            <div>
              <n-space align="center">
                <n-button quaternary circle @click="router.push('/interviews')">
                  <template #icon>
                    <n-icon><ArrowBackOutline /></n-icon>
                  </template>
                </n-button>
                
                <div>
                  <h1 style="margin-bottom: 4px;">{{ interview.companyName }}</h1>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.6);">{{ interview.position }}</p>
                </div>
              </n-space>
            </div>
            
            <n-space>
              <n-button type="info" @click="router.push(`/interviews/${interview.id}/edit`)">
                <template #icon>
                  <n-icon><PencilOutline /></n-icon>
                </template>
                Edit
              </n-button>
              
              <n-popconfirm @positive-click="deleteInterview">
                <template #trigger>
                  <n-button type="error">
                    <template #icon>
                      <n-icon><TrashOutline /></n-icon>
                    </template>
                    Delete
                  </n-button>
                </template>
                Are you sure you want to delete this interview?
              </n-popconfirm>
            </n-space>
          </n-space>
          
          <!-- Status and Date Card -->
          <n-card>
            <n-grid cols="1 m:3" :x-gap="16">
              <n-gi>
                <n-space vertical align="center">
                  <div style="font-size: 14px; color: rgba(255, 255, 255, 0.6);">Status</div>
                  <n-tag :type="getStatusType(interview.status)" size="large" round>
                    {{ interview.status.charAt(0).toUpperCase() + interview.status.slice(1) }}
                  </n-tag>
                  
                  <n-space v-if="interview.status !== 'completed' && interview.status !== 'rejected'">
                    <n-button 
                      size="small" 
                      type="primary"
                      @click="updateStatus('confirmed')"
                      :disabled="interview.status === 'confirmed'"
                    >
                      Confirm
                    </n-button>
                    
                    <n-button 
                      size="small" 
                      type="success"
                      @click="updateStatus('completed')"
                    >
                      Complete
                    </n-button>
                    
                    <n-button 
                      size="small" 
                      type="error"
                      @click="updateStatus('rejected')"
                    >
                      Reject
                    </n-button>
                  </n-space>
                </n-space>
              </n-gi>
              
              <n-gi>
                <n-space vertical align="center">
                  <div style="font-size: 14px; color: rgba(255, 255, 255, 0.6);">Date</div>
                  <n-space align="center">
                    <n-icon><CalendarOutline /></n-icon>
                    <span style="font-size: 16px; font-weight: 500;">{{ formatDate(interview.date) }}</span>
                  </n-space>
                </n-space>
              </n-gi>
              
              <n-gi>
                <n-space vertical align="center">
                  <div style="font-size: 14px; color: rgba(255, 255, 255, 0.6);">Time & Type</div>
                  <n-space>
                    <n-space align="center">
                      <n-icon><TimeOutline /></n-icon>
                      <span style="font-size: 16px; font-weight: 500;">{{ formatTime(interview.time) }}</span>
                    </n-space>
                    
                    <n-divider vertical />
                    
                    <n-space align="center">
                      <n-icon><BusinessOutline /></n-icon>
                      <span style="font-size: 16px; font-weight: 500;">
                        {{ interview.type === 'onsite' ? 'On-site' : interview.type === 'remote' ? 'Remote' : 'Phone' }}
                      </span>
                    </n-space>
                  </n-space>
                </n-space>
              </n-gi>
            </n-grid>
          </n-card>
          
          <!-- Tabs for different sections -->
          <n-tabs type="line" animated>
            <!-- Details Tab -->
            <n-tab-pane name="details" tab="Details">
              <n-grid cols="1 m:2" :x-gap="24" :y-gap="24">
                <!-- Contact Person -->
                <n-gi v-if="interview.contactPerson">
                  <n-card title="Contact Person">
                    <template #header-extra>
                      <n-icon><PersonOutline /></n-icon>
                    </template>
                    
                    <n-descriptions :column="1" label-placement="left" label-width="120">
                      <n-descriptions-item label="Name">
                        {{ interview.contactPerson.name }}
                      </n-descriptions-item>
                      
                      <n-descriptions-item v-if="interview.contactPerson.position" label="Position">
                        {{ interview.contactPerson.position }}
                      </n-descriptions-item>
                      
                      <n-descriptions-item v-if="interview.contactPerson.email" label="Email">
                        <n-space align="center">
                          <n-icon><MailOutline /></n-icon>
                          <a :href="`mailto:${interview.contactPerson.email}`" style="color: inherit;">
                            {{ interview.contactPerson.email }}
                          </a>
                        </n-space>
                      </n-descriptions-item>
                      
                      <n-descriptions-item v-if="interview.contactPerson.phone" label="Phone">
                        <n-space align="center">
                          <n-icon><CallOutline /></n-icon>
                          <a :href="`tel:${interview.contactPerson.phone}`" style="color: inherit;">
                            {{ interview.contactPerson.phone }}
                          </a>
                        </n-space>
                      </n-descriptions-item>
                    </n-descriptions>
                  </n-card>
                </n-gi>
                
                <!-- Location -->
                <n-gi v-if="interview.location">
                  <n-card title="Location">
                    <template #header-extra>
                      <n-icon><LocationOutline /></n-icon>
                    </template>
                    
                    <p>{{ interview.location }}</p>
                    
                    <n-button 
                      v-if="interview.type === 'onsite'" 
                      block 
                      tag="a" 
                      :href="`https://maps.google.com/?q=${encodeURIComponent(interview.location)}`"
                      target="_blank"
                    >
                      Open in Maps
                    </n-button>
                  </n-card>
                </n-gi>
                
                <!-- Notes -->
                <n-gi v-if="interview.notes">
                  <n-card title="Notes">
                    <template #header-extra>
                      <n-icon><ChatbubbleOutline /></n-icon>
                    </template>
                    
                    <p style="white-space: pre-wrap;">{{ interview.notes }}</p>
                  </n-card>
                </n-gi>
                
                <!-- Feedback -->
                <n-gi v-if="interview.status === 'completed' && interview.feedback">
                  <n-card title="Feedback">
                    <template #header-extra>
                      <n-space>
                        <n-icon><StarOutline /></n-icon>
                        <span v-if="interview.rating">{{ interview.rating }}/5</span>
                      </n-space>
                    </template>
                    
                    <p style="white-space: pre-wrap;">{{ interview.feedback }}</p>
                  </n-card>
                </n-gi>
              </n-grid>
            </n-tab-pane>
            
            <!-- Questions Tab -->
            <n-tab-pane name="questions" tab="Questions">
              <div v-if="interview.questions && interview.questions.length > 0">
                <n-list>
                  <n-list-item v-for="question in interview.questions" :key="question.id">
                    <n-thing>
                      <template #header>
                        <n-space align="center">
                          <span style="font-weight: 500;">{{ question.question }}</span>
                          <n-tag 
                            v-if="question.isImportant" 
                            type="warning" 
                            size="small"
                          >
                            Important
                          </n-tag>
                          <n-tag 
                            v-if="question.category" 
                            type="info" 
                            size="small"
                          >
                            {{ question.category.charAt(0).toUpperCase() + question.category.slice(1) }}
                          </n-tag>
                        </n-space>
                      </template>
                      
                      <div v-if="question.answer" style="white-space: pre-wrap; margin-top: 8px;">
                        {{ question.answer }}
                      </div>
                      <div v-else style="color: rgba(255, 255, 255, 0.4); margin-top: 8px;">
                        No answer provided
                      </div>
                    </n-thing>
                  </n-list-item>
                </n-list>
              </div>
              <n-empty v-else description="No questions added" />
            </n-tab-pane>
            
            <!-- Documents Tab -->
            <n-tab-pane name="documents" tab="Documents">
              <div v-if="interview.documents && interview.documents.length > 0">
                <n-list>
                  <n-list-item v-for="document in interview.documents" :key="document.id">
                    <n-thing>
                      <template #avatar>
                        <n-icon size="large"><DocumentTextOutline /></n-icon>
                      </template>
                      
                      <template #header>
                        <n-space align="center">
                          <span style="font-weight: 500;">{{ document.name }}</span>
                          <n-tag type="info" size="small">
                            {{ document.type.charAt(0).toUpperCase() + document.type.slice(1).replace('_', ' ') }}
                          </n-tag>
                        </n-space>
                      </template>
                      
                      <n-button 
                        size="small" 
                        tag="a" 
                        :href="document.url" 
                        target="_blank"
                        style="margin-top: 8px;"
                      >
                        View Document
                      </n-button>
                    </n-thing>
                  </n-list-item>
                </n-list>
              </div>
              <n-empty v-else description="No documents attached" />
            </n-tab-pane>
          </n-tabs>
        </template>
      </n-space>
    </div>
  </MainLayout>
</template>
