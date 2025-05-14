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
    <div v-else-if="documentUrl" class="document-container">
      <iframe 
        :src="documentUrl" 
        class="document-iframe"
        sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"
        referrerpolicy="no-referrer"
        allow="fullscreen"
      ></iframe>
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
const documentUrl = ref('')

const downloadDocument = async () => {
  try {
    let documentId = props.documentId;
    // Check if documentId is a string before using string methods
    if (typeof documentId === 'string' && documentId.includes('_')) {
      const idParts = documentId.split('_');
      if (idParts.length > 0) {
        documentId = idParts[0];
      }
    }
    
    // Ensure we have a valid numeric ID
    const numericId = parseInt(String(documentId), 10);
    if (isNaN(numericId)) {
      throw new Error('Invalid document ID format');
    }
    
    const downloadUrl = await props.getDownloadUrl(numericId.toString())
    
    const fullUrl = downloadUrl;
    
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
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    emit('download')
  } catch (err) {
    console.error('Download error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to download document'
  }
}

const retry = async () => {
  error.value = ''
  loading.value = true
  await loadDocument()
}

const loadDocument = async () => {
  try {
    if (props.documentUrl) {
      documentUrl.value = '';
      await downloadDocument();
    } else if (props.documentId) {
      let documentId = props.documentId;
      if (typeof documentId === 'string' && documentId.includes('_')) {
        const idParts = documentId.split('_');
        if (idParts.length > 0) {
          documentId = idParts[0];
        }
      }
      
      const numericId = parseInt(String(documentId), 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid document ID format');
      }
      
      await downloadDocument();
      documentUrl.value = '';
    }
  } catch (err) {
    console.error('Error loading document:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load document'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDocument()
})
</script>

<style scoped>
.document-viewer {
  width: 100%;
  height: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.loading-container,
.error-container,
.document-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.document-iframe {
  width: 100%;
  height: 100%;
  min-height: 600px;
  border: none;
}
</style>
