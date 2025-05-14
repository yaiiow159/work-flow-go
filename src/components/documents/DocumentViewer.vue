<template>
  <div class="document-viewer">
    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
    </div>
    <div v-else-if="error" class="error-container">
      <n-result status="error" title="Failed to load document" :description="error">
        <template #footer>
          <n-button @click="retry">Retry</n-button>
        </template>
      </n-result>
    </div>
    <div v-else class="document-container">
      <n-result title="Document Ready">
        <template #icon>
          <n-icon size="64" color="#2080f0">
            <DocumentOutline />
          </n-icon>
        </template>
        <template #footer>
          <n-button type="primary" @click="downloadDocument">
            <template #icon>
              <n-icon>
                <DownloadOutline />
              </n-icon>
            </template>
            Download Document
          </n-button>
        </template>
      </n-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { DocumentOutline, DownloadOutline } from '@vicons/ionicons5'

const props = defineProps({
  documentId: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    default: ''
  },
  documentType: {
    type: String,
    default: ''
  },
  contentType: {
    type: String,
    default: ''
  },
  getViewUrl: {
    type: Function,
    required: true
  },
  getDownloadUrl: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['close', 'download'])

const loading = ref(true)
const error = ref('')

const downloadDocument = async () => {
  try {
    const downloadUrl = await props.getDownloadUrl(props.documentId)
    
    let fullUrl = downloadUrl;
    if (downloadUrl.startsWith('/')) {
      const baseURL = import.meta.env.VITE_API_URL || '';
      fullUrl = `${baseURL}${downloadUrl}`;
    }
    
    const response = await fetch(fullUrl)
    const blob = await response.blob()
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = 'document'
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1]
      }
    }
    
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
    
    emit('download')
  } catch (e) {
    console.error('Error downloading document:', e)
    error.value = 'Failed to download document. Please try again.'
  }
}

const retry = () => {
  loading.value = false
  error.value = ''
}

onMounted(() => {
  // Just set loading to false since we're not actually loading a preview
  loading.value = false
})
</script>

<style scoped>
.document-viewer {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-container,
.error-container,
.document-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.document-container {
  padding: 1rem;
}
</style>
