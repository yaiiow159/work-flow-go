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
  useMessage
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
import {handleApiError, handleSuccess} from '../utils/errorHandler'
import DocumentViewer from '../components/documents/DocumentViewer.vue'

const message = useMessage()
const isLoading = ref(false)
const documents = ref<Document[]>([])

const showUploadModal = ref(false)
const showEditModal = ref(false)
const showPreviewModal = ref(false)
const uploadFileList = ref<UploadFileInfo[]>([])
const newDocument = ref({
  name: '',
  type: 'resume'
})
const editingDocument = ref<Document | null>(null)
const previewDocument = ref<Document | null>(null)

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
    handleApiError(error, 'Failed to Load Documents')
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
    message.error('Please provide a name and select a file')
    return
  }
  
  try {
    const file = uploadFileList.value[0].file
    if (!file) {
      message.error('No file selected')
      return
    }
    
    const uploadedDoc = await documentsApi.upload(
      file, 
      newDocument.value.name, 
      newDocument.value.type
    )
    
    documents.value.unshift(uploadedDoc)
    handleSuccess('Document uploaded successfully')
    resetUploadForm()
  } catch (error) {
    handleApiError(error, 'Upload Failed')
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
    message.error('Please provide a name')
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
      handleSuccess('Document updated successfully')
      showEditModal.value = false
    }
  } catch (error) {
    handleApiError(error, 'Update Failed')
  }
}

const deleteDocument = async (id: string) => {
  try {
    await documentsApi.delete(id)
    documents.value = documents.value.filter(doc => doc.id !== id)
    handleSuccess('Document deleted successfully')
  } catch (error) {
    handleApiError(error, 'Delete Failed')
  }
}

const downloadDocument = async (doc: Document) => {
  try {
    isLoading.value = true
    
    await documentsApi.downloadFile(doc.id)
    
    handleSuccess('Download started')
  } catch (error) {
    handleApiError(error, 'Download Failed')
  } finally {
    isLoading.value = false
  }
}

const viewDocument = async (doc: Document) => {
  try {
    if (doc.id) {
      const viewUrl = await documentsApi.getViewUrl(doc.id)
      
      // Update the document with the fresh URL
      previewDocument.value = {
        ...doc,
        url: viewUrl
      }
    } else {
      previewDocument.value = doc
    }
    
    showPreviewModal.value = true
  } catch (error) {
    handleApiError(error, 'View Failed')
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
            <p style="margin: 0; color: var(--text-color);">Manage your resumes, cover letters, and other documents</p>
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
                <p style="margin: 0; color: var(--text-color); text-align: center;">
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
      
      <!-- Document Preview Modal -->
      <n-modal
        v-model:show="showPreviewModal"
        preset="card"
        title="Document Preview"
        style="width: 90vw; max-width: 1000px; max-height: 90vh;"
      >
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <h3 style="margin: 0;">{{ previewDocument?.name }}</h3>
            <n-tag :type="previewDocument?.type === 'resume' ? 'success' : previewDocument?.type === 'cover_letter' ? 'info' : previewDocument?.type === 'portfolio' ? 'warning' : 'default'" round size="small">
              {{ getDocumentTypeLabel(previewDocument?.type || '') }}
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
            <n-button @click="showPreviewModal = false">Close</n-button>
            <n-button type="primary" @click="downloadDocument(previewDocument!)">
              <template #icon>
                <n-icon><DownloadOutline /></n-icon>
              </template>
              Download
            </n-button>
          </n-space>
        </template>
      </n-modal>
    </div>
  </MainLayout>
</template>
