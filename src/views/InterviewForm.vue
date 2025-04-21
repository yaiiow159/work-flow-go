<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import { useInterviewStore } from '../stores/interview'
import { v4 as uuidv4 } from 'uuid'
import type { Interview } from '../types'
import { documentsApi } from '../services/api'
import { 
  NCard, 
  NSpace, 
  NButton, 
  NIcon, 
  NSpin, 
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NDatePicker,
  NTimePicker,
  NRadioGroup,
  NRadio,
  NUpload,
  NUploadDragger,
  NTabs,
  NTabPane,
  NDivider,
  NInputGroup,
  NSwitch,
  NTag,
  useMessage
} from 'naive-ui'
import {
  SaveOutline,
  CloseOutline,
  AddOutline,
  TrashOutline,
  PersonOutline,
  BusinessOutline,
  CalendarOutline,
  DocumentTextOutline,
  HelpCircleOutline
} from '@vicons/ionicons5'
import { format, parse } from 'date-fns'
import { handleApiError, handleSuccess } from '../utils/errorHandler'

const router = useRouter()
const route = useRoute()
const interviewStore = useInterviewStore()
const message = useMessage()
const formRef = ref<any>(null)

const isLoading = ref(true)
const isSaving = ref(false)
const isEditMode = computed(() => route.params.id !== undefined)
const interviewId = computed(() => route.params.id)

// Form model
const formModel = reactive<Interview>({
  id: '',
  companyName: '',
  position: '',
  date: '',
  time: '',
  type: 'remote',
  status: 'scheduled',
  location: '',
  notes: '',
  contactPerson: {
    name: '',
    position: '',
    email: '',
    phone: ''
  },
  questions: [],
  documents: [],
  rating: 0,
  feedback: '',
  createdAt: '',
  updatedAt: ''
})

const dateValue = ref<number | null>(null)
const timeValue = ref<number | null>(null)

watch(dateValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue)
    formModel.date = format(date, 'yyyy-MM-dd')
  } else {
    formModel.date = ''
  }
})

watch(timeValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue)
    formModel.time = format(date, 'HH:mm')
  } else {
    formModel.time = ''
  }
})

const rules: any = {
  companyName: [
    { required: true, message: 'Please enter the company name', trigger: 'blur' }
  ],
  position: [
    { required: true, message: 'Please enter the position', trigger: 'blur' }
  ],
  date: [
    { required: true, message: 'Please select a date', trigger: 'change' }
  ],
  time: [
    { required: true, message: 'Please select a time', trigger: 'change' }
  ],
  type: [
    { required: true, message: 'Please select an interview type', trigger: 'change' }
  ],
  status: [
    { required: true, message: 'Please select a status', trigger: 'change' }
  ]
}

// Interview type options
const typeOptions = [
  { label: 'Remote', value: 'remote' },
  { label: 'On-site', value: 'onsite' },
  { label: 'Phone', value: 'phone' }
]

// Status options
const statusOptions = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' }
]

// Question category options
const questionCategoryOptions = [
  { label: 'Technical', value: 'technical' },
  { label: 'Behavioral', value: 'behavioral' },
  { label: 'Company', value: 'company' },
  { label: 'Role-specific', value: 'role' },
  { label: 'Other', value: 'other' }
]

const handleUpload = (options: any) => {
  const { file, onFinish } = options
  
  const formData = new FormData()
  formData.append('file', file.file)
  formData.append('name', file.name || file.file.name)
  formData.append('type', 'other')
  
  documentsApi.upload(file.file, file.name || file.file.name, 'other')
    .then(document => {
      formModel.documents.push({
        id: document.id,
        name: document.name,
        type: document.type,
        url: document.url,
        createdAt: document.createdAt || new Date().toISOString()
      })
      message.success(`${file.file.name} uploaded successfully`)
      onFinish()
    })
    .catch(error => {
      console.error('Upload Failed:', error)
      onFinish()
    })
}

const removeDocument = (index: number) => {
  formModel.documents.splice(index, 1)
}

const addQuestion = () => {
  formModel.questions.push({
    id: uuidv4(),
    question: '',
    answer: '',
    category: 'technical',
    isImportant: false
  })
}

const removeQuestion = (index: number) => {
  formModel.questions.splice(index, 1)
}

const saveInterview = (e: Event) => {
  e.preventDefault()
  
  formRef.value?.validate(async (errors: any) => {
    if (errors) {
      message.error('Please fix the form errors before submitting')
      console.error('Form Error:', errors)
      return
    }
    
    isSaving.value = true
    
    try {
      let result
      
      if (!formModel.date && dateValue.value) {
        const date = new Date(dateValue.value)
        formModel.date = format(date, 'yyyy-MM-dd')
      }
      
      if (!formModel.time && timeValue.value) {
        const date = new Date(timeValue.value)
        formModel.time = format(date, 'HH:mm')
      }
      
      const interviewData = {
        ...formModel,
        documents: formModel.documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          url: doc.url
        })),
        documentIds: formModel.documents.map(doc => doc.id)
      }
      
      if (isEditMode.value) {
        result = await interviewStore.updateInterview(interviewId.value as string, interviewData)
      } else {
        result = await interviewStore.createInterview(interviewData)
      }
      
      if (result) {
        handleSuccess(`Interview ${isEditMode.value ? 'updated' : 'created'} successfully`)
        router.push('/interviews')
      } else if (interviewStore.error) {
        handleApiError(interviewStore.error, `Failed to ${isEditMode.value ? 'Update' : 'Create'} Interview`)
      }
    } catch (err) {
      handleApiError(err, `Failed to ${isEditMode.value ? 'Update' : 'Create'} Interview`)
    } finally {
      isSaving.value = false
    }
  })
}

const cancel = () => {
  router.push('/interviews')
}

onMounted(async () => {
  if (isEditMode.value) {
    isLoading.value = true
    
    try {
      const interview = await interviewStore.getInterviewById(interviewId.value as string)
      
      if (interview) {
        Object.assign(formModel, interview)
        
        if (interview.date) {
          const date = parse(interview.date, 'yyyy-MM-dd', new Date())
          dateValue.value = date.getTime()
        }
        
        if (interview.time) {
          const [hours, minutes] = interview.time.split(':').map(Number)
          const date = new Date()
          date.setHours(hours, minutes, 0, 0)
          timeValue.value = date.getTime()
        }
      } else if (interviewStore.error) {
        handleApiError(interviewStore.error, 'Failed to Load Interview')
      }
    } catch (err) {
      handleApiError(err, 'Failed to Load Interview')
    } finally {
      isLoading.value = false
    }
  } else {
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
            <h1 style="margin-bottom: 4px;">{{ isEditMode ? 'Edit Interview' : 'New Interview' }}</h1>
            <p style="margin: 0; color: var(--text-color-secondary);">
              {{ isEditMode ? 'Update the details of your interview' : 'Schedule a new interview' }}
            </p>
          </div>
          
          <n-space>
            <n-button @click="cancel">
              <template #icon>
                <n-icon><CloseOutline /></n-icon>
              </template>
              Cancel
            </n-button>
            
            <n-button type="primary" :loading="isSaving" @click="saveInterview">
              <template #icon>
                <n-icon><SaveOutline /></n-icon>
              </template>
              Save
            </n-button>
          </n-space>
        </n-space>
        
        <div v-if="isLoading" style="display: flex; justify-content: center; padding: 40px;">
          <n-spin size="large" />
        </div>
        
        <n-form
          v-else
          ref="formRef"
          :model="formModel"
          :rules="rules"
          label-placement="left"
          label-width="140"
          require-mark-placement="right-hanging"
        >
          <n-tabs type="line" animated>
            <n-tab-pane name="basic" tab="Basic Information">
              <n-card>
                <n-space vertical>
                  <div>
                    <h3>
                      <n-icon><BusinessOutline /></n-icon>
                      Company Information
                    </h3>
                    
                    <n-form-item label="Company Name" path="companyName">
                      <n-input v-model:value="formModel.companyName" placeholder="Enter company name" />
                    </n-form-item>
                    
                    <n-form-item label="Position" path="position">
                      <n-input v-model:value="formModel.position" placeholder="Enter position title" />
                    </n-form-item>
                  </div>
                  
                  <n-divider />
                  
                  <div>
                    <h3>
                      <n-icon><CalendarOutline /></n-icon>
                      Interview Details
                    </h3>
                    
                    <n-form-item label="Date" path="date">
                      <n-date-picker 
                        v-model:value="dateValue"
                        type="date"
                        clearable
                        :is-date-disabled="(timestamp: number) => {
                          return timestamp < Date.now() - 24 * 60 * 60 * 1000
                        }"
                      />
                    </n-form-item>
                    
                    <n-form-item label="Time" path="time">
                      <n-time-picker 
                        v-model:value="timeValue"
                        format="HH:mm"
                        clearable
                      />
                    </n-form-item>
                    
                    <n-form-item label="Type" path="type">
                      <n-radio-group v-model:value="formModel.type">
                        <n-space>
                          <n-radio v-for="option in typeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                          </n-radio>
                        </n-space>
                      </n-radio-group>
                    </n-form-item>
                    
                    <n-form-item label="Status" path="status">
                      <n-select v-model:value="formModel.status" :options="statusOptions" />
                    </n-form-item>
                    
                    <n-form-item label="Location" path="location" :show="formModel.type === 'onsite'">
                      <n-input v-model:value="formModel.location" placeholder="Enter interview location" />
                    </n-form-item>
                    
                    <n-form-item label="Notes" path="notes">
                      <textarea 
                        v-model="formModel.notes" 
                        placeholder="Enter any notes about the interview"
                        style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;"
                      />
                    </n-form-item>
                  </div>
                </n-space>
              </n-card>
            </n-tab-pane>
            
            <n-tab-pane name="contact" tab="Contact Person">
              <n-card>
                <h3>
                  <n-icon><PersonOutline /></n-icon>
                  Contact Person
                </h3>
                
                <n-form-item label="Name" path="contactPerson.name">
                  <n-input v-model:value="formModel.contactPerson.name" placeholder="Enter contact person's name" />
                </n-form-item>
                
                <n-form-item label="Position" path="contactPerson.position">
                  <n-input v-model:value="formModel.contactPerson.position" placeholder="Enter contact person's position" />
                </n-form-item>
                
                <n-form-item label="Email" path="contactPerson.email">
                  <n-input v-model:value="formModel.contactPerson.email" placeholder="Enter contact person's email" />
                </n-form-item>
                
                <n-form-item label="Phone" path="contactPerson.phone">
                  <n-input v-model:value="formModel.contactPerson.phone" placeholder="Enter contact person's phone" />
                </n-form-item>
              </n-card>
            </n-tab-pane>
            
            <n-tab-pane name="questions" tab="Questions">
              <n-card>
                <n-space vertical>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3>
                      <n-icon><HelpCircleOutline /></n-icon>
                      Interview Questions
                    </h3>
                    
                    <n-button type="primary" @click="addQuestion">
                      <template #icon>
                        <n-icon><AddOutline /></n-icon>
                      </template>
                      Add Question
                    </n-button>
                  </div>
                  
                  <div v-if="formModel.questions.length === 0" style="text-align: center; padding: 20px;">
                    <p>No questions added yet. Add questions to prepare for your interview.</p>
                  </div>
                  
                  <div v-for="(question, index) in formModel.questions" :key="question.id" style="margin-bottom: 16px;">
                    <n-card>
                      <template #header-extra>
                        <n-button circle quaternary type="error" @click="removeQuestion(index)">
                          <template #icon>
                            <n-icon><TrashOutline /></n-icon>
                          </template>
                        </n-button>
                      </template>
                      
                      <n-space vertical>
                        <n-input-group>
                          <n-input v-model:value="question.question" placeholder="Enter your question" />
                          <n-select 
                            v-model:value="question.category" 
                            :options="questionCategoryOptions" 
                            style="width: 150px;"
                          />
                        </n-input-group>
                        
                        <textarea 
                          v-model="question.answer" 
                          placeholder="Enter your answer (optional)"
                          style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;"
                        />
                        
                        <div style="display: flex; align-items: center;">
                          <n-switch v-model:value="question.isImportant" />
                          <span style="margin-left: 8px;">Mark as important</span>
                        </div>
                      </n-space>
                    </n-card>
                  </div>
                </n-space>
              </n-card>
            </n-tab-pane>
            
            <n-tab-pane name="documents" tab="Documents">
              <n-card>
                <n-space vertical>
                  <h3>
                    <n-icon><DocumentTextOutline /></n-icon>
                    Interview Documents
                  </h3>
                  
                  <n-upload
                    multiple
                    :custom-request="handleUpload"
                  >
                    <n-upload-dragger>
                      <div style="padding: 20px;">
                        <n-icon size="48" depth="3">
                          <DocumentTextOutline />
                        </n-icon>
                        <p style="margin-top: 8px;">
                          Click or drag files to upload
                        </p>
                        <p style="color: var(--text-color-secondary);">
                          Upload resumes, portfolios, or any other relevant documents
                        </p>
                      </div>
                    </n-upload-dragger>
                  </n-upload>
                  
                  <div v-if="formModel.documents.length > 0" style="margin-top: 16px;">
                    <h4>Uploaded Documents</h4>
                    
                    <n-space vertical>
                      <n-card
                        v-for="(doc, index) in formModel.documents"
                        :key="doc.id"
                        size="small"
                        style="margin-bottom: 8px;"
                      >
                        <n-space justify="space-between" align="center">
                          <div>
                            <n-tag :type="doc.type === 'resume' ? 'error' : doc.type === 'cover_letter' ? 'info' : 'default'">
                              {{ doc.type.toUpperCase() }}
                            </n-tag>
                            <span style="margin-left: 8px;">{{ doc.name }}</span>
                          </div>
                          
                          <n-button circle quaternary type="error" @click="removeDocument(index)">
                            <template #icon>
                              <n-icon><TrashOutline /></n-icon>
                            </template>
                          </n-button>
                        </n-space>
                      </n-card>
                    </n-space>
                  </div>
                </n-space>
              </n-card>
            </n-tab-pane>
            
            <n-tab-pane
              v-if="isEditMode && formModel.status === 'completed'" 
              name="feedback" 
              tab="Feedback"
            >
              <n-card>
                <n-space vertical>
                  <h3>Interview Feedback</h3>
                  
                  <n-form-item label="Rating" path="rating">
                    <n-select
                      v-model:value="formModel.rating"
                      :options="[
                        { label: 'Not Rated', value: 0 },
                        { label: '1 - Poor', value: 1 },
                        { label: '2 - Below Average', value: 2 },
                        { label: '3 - Average', value: 3 },
                        { label: '4 - Good', value: 4 },
                        { label: '5 - Excellent', value: 5 }
                      ]"
                    />
                  </n-form-item>
                  
                  <n-form-item label="Feedback Notes" path="feedback">
                    <textarea 
                      v-model="formModel.feedback" 
                      placeholder="Enter feedback from the interview"
                      style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;"
                    />
                  </n-form-item>
                </n-space>
              </n-card>
            </n-tab-pane>
          </n-tabs>
        </n-form>
      </n-space>
    </div>
  </MainLayout>
</template>
