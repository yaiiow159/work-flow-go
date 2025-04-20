<script setup lang="ts">
import {h, onMounted, ref} from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import {documentsApi} from '../services/api'
import type {Document} from '../types'
import type {UploadFileInfo} from 'naive-ui'
import {
  NButton,
  NCard,
  NDataTable,
  NEmpty,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NIcon,
  NInput,
  NModal,
  NPopconfirm,
  NSelect,
  NSpace,
  NSpin,
  NTag,
  NUpload,
  type TagProps,
  useMessage,
  useDialog
} from 'naive-ui'
import {
  CloudUploadOutline,
  DocumentOutline,
  DownloadOutline,
  EyeOutline,
  PencilOutline,
  TrashOutline
} from '@vicons/ionicons5'
import {format} from 'date-fns'
import { handleApiError } from '../utils/errorHandler'

const message = useMessage()
const dialog = useDialog()
const isLoading = ref(false)
const documents = ref<Document[]>([])

const showUploadModal = ref(false)
const showEditModal = ref(false)
const uploadFileList = ref<UploadFileInfo[]>([])
const newDocument = ref({
  name: '',
  type: 'resume'
})
const editingDocument = ref<Document | null>(null)

const documentTypeOptions = [
  { label: 'Resume', value: 'resume' },
  { label: 'Cover Letter', value: 'cover_letter' },
  { label: 'Portfolio', value: 'portfolio' },
  { label: 'Other', value: 'other' }
]

onMounted(async () => {
  await fetchDocuments()
})

const fetchDocuments = async () => {
  try {
    isLoading.value = true
    documents.value = await documentsApi.getAll()
  } catch (error) {
    console.error('Failed to Load Documents:', error)
  } finally {
    isLoading.value = false
  }
}

const getDocumentTypeLabel = (type: string) => {
  const option = documentTypeOptions.find(opt => opt.value === type)
  return option ? option.label : 'Unknown'
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy')
}

const handleUpload = async () => {
  if (!newDocument.value.name || uploadFileList.value.length === 0) {
    console.error('Please provide a name and select a file')
    return
  }
  
  try {
    const file = uploadFileList.value[0].file
    if (!file) {
      console.error('No file selected')
      return
    }
    
    const uploadedDoc = await documentsApi.upload(
      file, 
      newDocument.value.name, 
      newDocument.value.type
    )
    
    documents.value.unshift(uploadedDoc)
    message.success('Document uploaded successfully')
    resetUploadForm()
  } catch (error) {
    console.error('Upload Failed:', error)
  }
}

const resetUploadForm = () => {
  newDocument.value = {
    name: '',
    type: 'resume'
  }
  uploadFileList.value = []
  showUploadModal.value = false
}

const openEditModal = (doc: Document) => {
  editingDocument.value = { ...doc }
  showEditModal.value = true
}

const saveEditedDocument = async () => {
  if (!editingDocument.value || !editingDocument.value.name) {
    console.error('Please provide a name')
    return
  }
  
  try {
    const updatedDoc = await documentsApi.update(
      editingDocument.value.id,
      {
        name: editingDocument.value.name,
        type: editingDocument.value.type
      }
    )
    
    const index = documents.value.findIndex(doc => doc.id === editingDocument.value!.id)
    if (index !== -1) {
      documents.value[index] = updatedDoc
      message.success('Document updated successfully')
      showEditModal.value = false
    }
  } catch (error) {
    console.error('Update Failed:', error)
  }
}

const deleteDocument = async (id: string) => {
  try {
    await documentsApi.delete(id)
    documents.value = documents.value.filter(doc => doc.id !== id)
    message.success('Document deleted successfully')
  } catch (error) {
    console.error('Delete Failed:', error)
  }
}

const downloadDocument = (doc: Document) => {
  try {
    const downloadUrl = documentsApi.getDownloadUrl(doc.id)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', doc.name)
    link.setAttribute('target', '_blank')
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    message.success('Document download started')
  } catch (error) {
    console.error('Download Failed:', error)
  }
}

const viewDocument = (doc: Document) => {
  try {
    const viewUrl = documentsApi.getViewUrl(doc.id)
    
    window.open(viewUrl, '_blank')
    
    message.success('Document opened for viewing')
  } catch (error) {
    console.error('View Failed:', error)
  }
}

const renderIcon = (icon: any) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const columns = [
  {
    title: 'Name',
    key: 'name',
    render: (row: Document) => {
      return h('div', { style: 'font-weight: 500;' }, row.name)
    }
  },
  {
    title: 'Type',
    key: 'type',
    render: (row: Document) => {
      const typeColors: Record<string, TagProps['type']> = {
        resume: 'success',
        cover_letter: 'info',
        portfolio: 'warning',
        other: 'default'
      }
      
      return h(
        NTag,
        {
          type: typeColors[row.type] || 'default',
          round: true,
          size: 'small'
        },
        { default: () => getDocumentTypeLabel(row.type) }
      )
    }
  },
  {
    title: 'Created',
    key: 'createdAt',
    render: (row: Document) => {
      return row.createdAt ? formatDate(row.createdAt) : 'N/A'
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (row: Document) => {
      return h(
        NSpace,
        { align: 'center' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                type: 'info',
                onClick: () => viewDocument(row)
              },
              { icon: renderIcon(EyeOutline) }
            ),
            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                type: 'primary',
                onClick: () => downloadDocument(row)
              },
              { icon: renderIcon(DownloadOutline) }
            ),
            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                type: 'warning',
                onClick: () => openEditModal(row)
              },
              { icon: renderIcon(PencilOutline) }
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => deleteDocument(row.id)
              },
              {
                default: () => 'Are you sure you want to delete this document?',
                trigger: () => h(
                  NButton,
                  {
                    size: 'small',
                    quaternary: true,
                    type: 'error'
                  },
                  { icon: renderIcon(TrashOutline) }
                )
              }
            )
          ]
        }
      )
    }
  }
]
</script>

<template>
  <MainLayout>
    <div class="page-container">
      <n-space vertical size="large">
        <n-space justify="space-between" align="center">
          <div>
            <h1 style="margin-bottom: 4px;">Documents</h1>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.6);">Manage your resumes, cover letters, and other documents</p>
          </div>
          <n-button type="primary" @click="showUploadModal = true">
            <template #icon>
              <n-icon><CloudUploadOutline /></n-icon>
            </template>
            Upload Document
          </n-button>
        </n-space>
        
        <n-grid cols="1 s:2 m:4" :x-gap="12" :y-gap="12">
          <n-gi v-for="type in documentTypeOptions" :key="type.value">
            <n-card hoverable>
              <n-space vertical align="center">
                <n-icon size="36" :color="type.value === 'resume' ? '#18a058' : type.value === 'cover_letter' ? '#2080f0' : type.value === 'portfolio' ? '#f0a020' : '#909399'">
                  <DocumentOutline />
                </n-icon>
                <h3 style="margin: 8px 0;">{{ type.label }}s</h3>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.6); text-align: center;">
                  {{ documents.filter(doc => doc.type === type.value).length }} document(s)
                </p>
              </n-space>
            </n-card>
          </n-gi>
        </n-grid>
        
        <n-card title="All Documents">
          <div v-if="isLoading" style="display: flex; justify-content: center; padding: 40px;">
            <n-spin size="large" />
          </div>
          
          <div v-else-if="documents.length === 0">
            <n-empty description="No documents found">
              <template #extra>
                <n-button type="primary" @click="showUploadModal = true">
                  Upload Document
                </n-button>
              </template>
            </n-empty>
          </div>
          
          <n-data-table
            v-else
            :columns="columns"
            :data="documents"
            :pagination="{ pageSize: 10 }"
            :bordered="false"
          />
        </n-card>
      </n-space>
      
      <n-modal
        v-model:show="showUploadModal"
        preset="card"
        title="Upload Document"
        style="width: 500px; max-width: 90vw;"
      >
        <n-form>
          <n-form-item label="Document Name" required>
            <n-input v-model:value="newDocument.name" placeholder="Enter document name" />
          </n-form-item>
          
          <n-form-item label="Document Type">
            <n-select v-model:value="newDocument.type" :options="documentTypeOptions" />
          </n-form-item>
          
          <n-form-item label="File" required>
            <n-upload
              v-model:file-list="uploadFileList"
              :max="1"
              :multiple="false"
            >
              <n-button>Select File</n-button>
            </n-upload>
          </n-form-item>
          
          <n-space justify="end">
            <n-button @click="resetUploadForm">Cancel</n-button>
            <n-button type="primary" @click="handleUpload">Upload</n-button>
          </n-space>
        </n-form>
      </n-modal>
      
      <n-modal
        v-model:show="showEditModal"
        preset="card"
        title="Edit Document"
        style="width: 500px; max-width: 90vw;"
      >
        <n-form v-if="editingDocument">
          <n-form-item label="Document Name" required>
            <n-input v-model:value="editingDocument.name" placeholder="Enter document name" />
          </n-form-item>
          
          <n-form-item label="Document Type">
            <n-select v-model:value="editingDocument.type" :options="documentTypeOptions" />
          </n-form-item>
          
          <n-space justify="end">
            <n-button @click="showEditModal = false">Cancel</n-button>
            <n-button type="primary" @click="saveEditedDocument">Save</n-button>
          </n-space>
        </n-form>
      </n-modal>
    </div>
  </MainLayout>
</template>
