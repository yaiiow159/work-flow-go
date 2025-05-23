<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInterviewStore } from '../stores/interview'
import MainLayout from '../components/layout/MainLayout.vue'
import { format } from 'date-fns'
import type { Interview, InterviewStatus } from '../types'
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
import { documentsApi } from '../services/api'
import { handleApiError, handleSuccess } from '../utils/errorHandler'
import DocumentViewer from '../components/documents/DocumentViewer.vue'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()
const message = useMessage()

const isLoading = ref(true)
const interview = ref<Interview | null>(null)
const showDocumentModal = ref(false)
const previewDocument = ref<any>(null)
const interviewId = computed(() => route.params.id as string)

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMMM d, yyyy')
}

const formatTime = (timeString: string) => {
  return timeString
}

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

const deleteInterview = async () => {
  if (!interview.value) return
  
  try {
    const success = await interviewStore.deleteInterview(interview.value.id)
    if (success) {
      message.success('Interview deleted successfully')
      router.push('/interviews')
    } else if (interviewStore.error) {
      console.error('Delete Failed:', interviewStore.error)
    }
  } catch (err) {
    console.error('Delete Failed:', err)
  }
}

const updateStatus = async (newStatus: string) => {
  try {
    await interviewStore.updateInterviewStatus(interviewId.value, newStatus as InterviewStatus)
    if (interview.value) {
      interview.value.status = newStatus as InterviewStatus;
    }
    message.success(`Interview status updated to ${newStatus}`)
  } catch (error) {
    console.error('Error updating status:', error)
    message.error('Failed to update interview status')
  }
}

const viewDocument = async (document: any) => {
  try {
    if (document && document.id) {
      let documentId = document.id.toString();
      
      if (typeof documentId === 'string' && documentId.includes('_')) {
        const idParts = documentId.split('_');
        if (idParts.length > 0) {
          documentId = idParts[0];
        }
      }
      
      const numericId = parseInt(documentId, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid document ID format');
      }
      
      const viewUrl = await documentsApi.getViewUrl(numericId.toString());
      
      previewDocument.value = {
        ...document,
        id: documentId,
        url: viewUrl
      };
      
      showDocumentModal.value = true;
    } else {
      message.error('Invalid document');
    }
  } catch (error) {
    console.error('View document error:', error);
    handleApiError(error, 'View Failed');
  }
}

onMounted(async () => {
  try {
    const fetchedInterview = await interviewStore.getInterviewById(interviewId.value)
    if (fetchedInterview) {
      interview.value = fetchedInterview
      console.log('Fetched interview data:', interview.value)
      if (interview.value.documents && Array.isArray(interview.value.documents)) {
        console.log('Documents loaded:', interview.value.documents.length)
      } else {
        console.log('No documents found or documents is not an array')
        interview.value.documents = []
      }
    } else {
      console.error('Failed to Load Interview:', 'Interview not found')
      router.push('/interviews')
    }
  } catch (err) {
    console.error('Failed to Load Interview:', err)
    router.push('/interviews')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <MainLayout>
    <div class="page-container">
      <n-space vertical size="large">
        <div v-if="isLoading" style="display: flex; justify-content: center; padding: 40px;">
          <n-spin size="large" />
        </div>
        
        <template v-else-if="interview">
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
                  <p style="margin: 0; color: var(--text-color-secondary);">{{ interview.position }}</p>
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
          
          <n-card class="interview-summary-card" bordered>
            <n-grid cols="1 m:3" :x-gap="24" :y-gap="24">
              <n-gi>
                <n-space vertical align="center">
                  <div style="font-size: 14px; color: var(--text-color-secondary); margin-bottom: 8px;">Status</div>
                  <n-tag :type="getStatusType(interview.status)" size="large" round style="padding: 4px 16px;">
                    {{ interview.status.charAt(0).toUpperCase() + interview.status.slice(1) }}
                  </n-tag>
                  
                  <n-space v-if="interview.status !== 'completed' && interview.status !== 'rejected'" style="margin-top: 12px;">
                    <n-button 
                      size="small" 
                      type="primary"
                      @click="updateStatus('confirmed')"
                      :disabled="interview.status === 'confirmed'"
                      style="min-width: 80px;"
                    >
                      Confirm
                    </n-button>
                    
                    <n-button 
                      size="small" 
                      type="success"
                      @click="updateStatus('completed')"
                      style="min-width: 80px;"
                    >
                      Complete
                    </n-button>
                    
                    <n-button 
                      size="small" 
                      type="error"
                      @click="updateStatus('rejected')"
                      style="min-width: 80px;"
                    >
                      Reject
                    </n-button>
                  </n-space>
                </n-space>
              </n-gi>
              
              <n-gi>
                <n-space vertical align="center">
                  <div style="font-size: 14px; color: var(--text-color-secondary); margin-bottom: 8px;">Date</div>
                  <n-space align="center">
                    <n-icon color="var(--primary-color)"><CalendarOutline /></n-icon>
                    <span style="font-size: 16px; font-weight: 500;">{{ formatDate(interview.date) }}</span>
                  </n-space>
                </n-space>
              </n-gi>
              
              <n-gi>
                <n-space vertical align="center">
                  <div style="font-size: 14px; color: var(--text-color-secondary); margin-bottom: 8px;">Time & Type</div>
                  <n-space>
                    <n-space align="center">
                      <n-icon color="var(--primary-color)"><TimeOutline /></n-icon>
                      <span style="font-size: 16px; font-weight: 500;">{{ formatTime(interview.time) }}</span>
                    </n-space>
                    
                    <n-divider vertical />
                    
                    <n-space align="center">
                      <n-icon color="var(--primary-color)"><BusinessOutline /></n-icon>
                      <span style="font-size: 16px; font-weight: 500;">
                        {{ interview.type === 'onsite' ? 'On-site' : interview.type === 'remote' ? 'Remote' : 'Phone' }}
                      </span>
                    </n-space>
                  </n-space>
                </n-space>
              </n-gi>
            </n-grid>
          </n-card>
          
          <n-tabs type="line" animated>
            <n-tab-pane name="details" tab="Details">
              <n-grid cols="1 m:2" :x-gap="24" :y-gap="24">
                <n-gi v-if="interview.contactPerson">
                  <n-card title="Contact Person" class="detail-card" bordered>
                    <template #header-extra>
                      <n-icon color="var(--primary-color)"><PersonOutline /></n-icon>
                    </template>
                    
                    <n-descriptions :column="1" label-placement="left" label-width="120">
                      <n-descriptions-item label="Name">
                        <span style="font-weight: 500;">{{ interview.contactPerson.name }}</span>
                      </n-descriptions-item>
                      
                      <n-descriptions-item v-if="interview.contactPerson.position" label="Position">
                        <span>{{ interview.contactPerson.position }}</span>
                      </n-descriptions-item>
                      
                      <n-descriptions-item v-if="interview.contactPerson.email" label="Email">
                        <n-space align="center">
                          <n-icon color="var(--primary-color)"><MailOutline /></n-icon>
                          <a :href="`mailto:${interview.contactPerson.email}`" class="contact-link">
                            {{ interview.contactPerson.email }}
                          </a>
                        </n-space>
                      </n-descriptions-item>
                      
                      <n-descriptions-item v-if="interview.contactPerson.phone" label="Phone">
                        <n-space align="center">
                          <n-icon color="var(--primary-color)"><CallOutline /></n-icon>
                          <a :href="`tel:${interview.contactPerson.phone}`" class="contact-link">
                            {{ interview.contactPerson.phone }}
                          </a>
                        </n-space>
                      </n-descriptions-item>
                    </n-descriptions>
                  </n-card>
                </n-gi>
                
                <n-gi v-if="interview.location">
                  <n-card title="Location" class="detail-card" bordered>
                    <template #header-extra>
                      <n-icon color="var(--primary-color)"><LocationOutline /></n-icon>
                    </template>
                    
                    <div style="margin-bottom: 16px; white-space: pre-wrap;">{{ interview.location }}</div>
                    
                    <n-button 
                      v-if="interview.type === 'onsite'" 
                      block 
                      type="primary"
                      tag="a" 
                      :href="`https://maps.google.com/?q=${encodeURIComponent(interview.location)}`"
                      target="_blank"
                    >
                      <template #icon>
                        <n-icon><LocationOutline /></n-icon>
                      </template>
                      Open in Maps
                    </n-button>
                  </n-card>
                </n-gi>
                
                <n-gi v-if="interview.notes">
                  <n-card title="Notes" class="detail-card" bordered>
                    <template #header-extra>
                      <n-icon color="var(--primary-color)"><ChatbubbleOutline /></n-icon>
                    </template>
                    
                    <div style="white-space: pre-wrap; background-color: var(--card-color); padding: 16px; border-radius: 4px; border-left: 3px solid var(--primary-color);">
                      {{ interview.notes }}
                    </div>
                  </n-card>
                </n-gi>
                
                <n-gi v-if="interview.status === 'completed' && interview.feedback">
                  <n-card title="Feedback" class="detail-card" bordered>
                    <template #header-extra>
                      <n-space>
                        <n-icon color="var(--warning-color)"><StarOutline /></n-icon>
                        <span v-if="interview.rating" style="font-weight: 500; color: var(--warning-color);">
                          {{ interview.rating }}/5
                        </span>
                      </n-space>
                    </template>
                    
                    <div style="white-space: pre-wrap; background-color: var(--card-color); padding: 16px; border-radius: 4px; border-left: 3px solid var(--warning-color);">
                      {{ interview.feedback }}
                    </div>
                  </n-card>
                </n-gi>
              </n-grid>
            </n-tab-pane>
            
            <n-tab-pane name="questions" tab="Questions">
              <div v-if="interview.questions && interview.questions.length > 0">
                <n-list bordered>
                  <n-list-item v-for="(question, index) in interview.questions" :key="question.id">
                    <n-card :title="`Question ${index + 1}`" size="small" style="width: 100%">
                      <template #header-extra>
                        <n-space>
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
                      
                      <n-space vertical>
                        <div style="font-weight: 500; font-size: 16px; color: var(--primary-color);">
                          {{ question.question }}
                        </div>
                        
                        <n-divider style="margin: 12px 0;" />
                        
                        <div>
                          <div style="font-weight: 500; margin-bottom: 8px; color: var(--text-color-secondary);">
                            Answer:
                          </div>
                          <div v-if="question.answer" style="white-space: pre-wrap; background-color: var(--card-color); padding: 12px; border-radius: 4px; border-left: 3px solid var(--primary-color);">
                            {{ question.answer }}
                          </div>
                          <div v-else style="color: var(--text-color-disabled); font-style: italic; padding: 12px;">
                            No answer provided yet
                          </div>
                        </div>
                      </n-space>
                    </n-card>
                  </n-list-item>
                </n-list>
              </div>
              <n-empty v-else description="No questions added" />
            </n-tab-pane>
            
            <n-tab-pane name="documents" tab="Documents">
              <div v-if="interview.documents && interview.documents.length > 0">
                <n-list bordered>
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
                      
                      <template #description>
                        <div v-if="document.size" style="font-size: 12px; color: var(--text-color-secondary);">
                          Size: {{ (document.size / 1024).toFixed(2) }} KB
                        </div>
                        <div v-if="document.createdAt" style="font-size: 12px; color: var(--text-color-secondary);">
                          Uploaded: {{ formatDate(document.createdAt) }}
                        </div>
                      </template>
                      
                      <n-button 
                        size="small" 
                        @click="viewDocument(document)"
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
    
    <n-modal
      v-model:show="showDocumentModal"
      preset="card"
      style="width: 90%; max-width: 1000px;"
      title="Document Preview"
    >
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <h3 style="margin: 0;">{{ previewDocument?.name }}</h3>
          <n-tag :type="previewDocument?.type === 'resume' ? 'success' : previewDocument?.type === 'cover_letter' ? 'info' : previewDocument?.type === 'portfolio' ? 'warning' : 'default'" round size="small">
            {{ previewDocument?.type.charAt(0).toUpperCase() + previewDocument?.type.slice(1).replace('_', ' ') }}
          </n-tag>
        </div>
      </template>
      
      <div style="min-height: 600px;">
        <DocumentViewer
          v-if="previewDocument"
          :document-id="previewDocument.id"
          :document-url="previewDocument.url"
          :document-type="previewDocument.type"
          :content-type="previewDocument.contentType"
          :get-view-url="documentsApi.getViewUrl"
          :get-download-url="documentsApi.getDownloadUrl"
          @download="handleSuccess('Download started')"
        />
      </div>
      
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDocumentModal = false">Close</n-button>
        </n-space>
      </template>
    </n-modal>
  </MainLayout>
</template>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.interview-summary-card {
  margin-bottom: 24px;
  background-color: var(--card-color);
  transition: all 0.3s ease;
}

.detail-card {
  height: 100%;
  transition: all 0.3s ease;
}

.contact-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: opacity 0.3s;
}

.contact-link:hover {
  opacity: 0.8;
}
</style>
