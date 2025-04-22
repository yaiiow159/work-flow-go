<template>
  <div class="cloudinary-viewer">
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
        v-if="isPdf" 
        :src="documentUrl" 
        class="document-frame" 
        frameborder="0" 
        allowfullscreen
      ></iframe>
      
      <img
        v-else-if="isImage" 
        :src="documentUrl" 
        class="document-image" 
        alt="Document Preview"
      />

      <div v-else class="fallback-container">
        <n-result title="Preview not available">
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
              Download to view
            </n-button>
          </template>
        </n-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { DocumentOutline, DownloadOutline } from '@vicons/ionicons5'
import { Cloudinary } from '@cloudinary/url-gen'


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
const documentUrl = ref(props.documentUrl)

const isPdf = computed(() => {
  return props.contentType?.includes('pdf') || 
         documentUrl.value?.toLowerCase().includes('.pdf') ||
         documentUrl.value?.includes('application/pdf')
})

const isImage = computed(() => {
  return props.contentType?.includes('image') || 
         /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(documentUrl.value || '')
})

const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'
  }
})

const optimizeCloudinaryUrl = ({url}: { url: any }) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }

  try {
    const matches = url.match(/\/v\d+\/([^/]+)\/([^/]+)$/)
    if (!matches || matches.length < 3) {
      return url
    }

    const folder = matches[1]
    const filename = matches[2]
    const publicId = `${folder}/${filename}`

    const cldImage = cld.image(publicId)
    
    if (isPdf.value) {
      cldImage.format('auto')
    } else if (isImage.value) {
      cldImage.format('auto').quality('auto')
    }
    
    return cldImage.toURL()
  } catch (e) {
    console.error('Error optimizing Cloudinary URL:', e)
    return url
  }
}

const loadDocument = async () => {
  loading.value = true
  error.value = ''
  
  try {
    if (!documentUrl.value) {
      const url = await props.getViewUrl(props.documentId)
      documentUrl.value = optimizeCloudinaryUrl({url: url})
    } else {
      documentUrl.value = optimizeCloudinaryUrl({url: documentUrl.value})
    }
  } catch (e) {
    console.error('Error loading document:', e)
    error.value = 'Failed to load document. Please try again.'
  } finally {
    loading.value = false
  }
}

const downloadDocument = async () => {
  try {
    const downloadUrl = await props.getDownloadUrl(props.documentId)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', 'document')
    link.setAttribute('target', '_blank')
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    emit('download')
  } catch (e) {
    console.error('Error downloading document:', e)
    error.value = 'Failed to download document. Please try again.'
  }
}

const retry = () => {
  loadDocument()
}

onMounted(() => {
  loadDocument()
})
</script>

<style scoped>
.cloudinary-viewer {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.loading-container,
.error-container,
.document-container,
.fallback-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 400px;
}

.document-frame {
  width: 100%;
  height: 100%;
  min-height: 600px;
  border: none;
}

.document-image {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}
</style>
