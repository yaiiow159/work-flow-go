<script setup lang="ts">
import { ref, h, computed, onMounted } from 'vue'
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
  NEmpty, 
  NDataTable,
  NInput,
  NSelect,
  NTag,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
  type SelectOption,
  type TagProps
} from 'naive-ui'
import {
  AddOutline,
  SearchOutline,
  EyeOutline,
  PencilOutline,
  TrashOutline
} from '@vicons/ionicons5'

const interviewStore = useInterviewStore()
const message = useMessage()

const isLoading = ref(true)
const searchQuery = ref('')
const statusFilter = ref<InterviewStatus | undefined>(undefined)

const statusOptions: SelectOption[] = [
  { label: 'All Statuses', value: undefined },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' }
]

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy')
}

const getStatusType = (status: string): TagProps['type'] => {
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

const renderIcon = (icon: any) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const columns = computed<DataTableColumns<Interview>>(() => [
  {
    title: 'Company',
    key: 'companyName',
    sorter: true,
    sortOrder: false,
    render: (row: Interview) => {
      return h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column'
          }
        },
        [
          h('span', { style: { fontWeight: 500 } }, row.companyName),
          h('span', { style: { fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' } }, row.position)
        ]
      )
    }
  },
  {
    title: 'Date',
    key: 'date',
    sorter: true,
    sortOrder: false,
    render: (row: Interview) => {
      return formatDate(row.date)
    }
  },
  {
    title: 'Type',
    key: 'type',
    render: (row: Interview) => {
      return row.type === 'onsite' ? 'On-site' : row.type === 'remote' ? 'Remote' : 'Phone'
    },
    filterOptions: [
      { label: 'Remote', value: 'remote' },
      { label: 'On-site', value: 'onsite' },
      { label: 'Phone', value: 'phone' }
    ],
    filter: true,
    filterOptionValue: null as string | null
  },
  {
    title: 'Status',
    key: 'status',
    render: (row: Interview) => {
      return h(
        NTag,
        {
          type: getStatusType(row.status),
          round: true,
          size: 'small'
        },
        { default: () => row.status.charAt(0).toUpperCase() + row.status.slice(1) }
      )
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (row: Interview) => {
      return h(
        NSpace,
        { align: 'center' },
        {
          default: () => [
            h(
              NButton,
              {
                quaternary: true,
                circle: true,
                type: 'primary',
                onClick: () => window.location.href = `/interviews/${row.id}`
              },
              { icon: renderIcon(EyeOutline) }
            ),
            h(
              NButton,
              {
                quaternary: true,
                circle: true,
                type: 'info',
                onClick: () => window.location.href = `/interviews/${row.id}/edit`
              },
              { icon: renderIcon(PencilOutline) }
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => deleteInterview(row.id)
              },
              {
                default: () => 'Are you sure you want to delete this interview?',
                trigger: () => h(
                  NButton,
                  {
                    quaternary: true,
                    circle: true,
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
])

const filteredInterviews = computed(() => {
  let result = interviewStore.interviews
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      interview => 
        interview.companyName.toLowerCase().includes(query) ||
        interview.position.toLowerCase().includes(query) ||
        interview.location.toLowerCase().includes(query)
    )
  }
  
  if (statusFilter.value !== undefined) {
    result = result.filter(interview => interview.status === statusFilter.value)
  }
  
  return result
})

const deleteInterview = (id: string) => {
  interviewStore.deleteInterview(id)
    .then(() => {
      message.success('Interview deleted successfully')
    })
    .catch(() => {
      message.error('Failed to delete interview')
    })
}

const handleSorting = (sorter: { columnKey: string, order: 'ascend' | 'descend' | false }) => {

  console.log('Sorting by:', sorter.columnKey, sorter.order)
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
        <n-space justify="space-between" align="center">
          <div>
            <h1 style="margin-bottom: 4px;">Interviews</h1>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.6);">Manage your upcoming and past interviews</p>
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
            <n-input
              v-model:value="searchQuery"
              placeholder="Search by company or position"
              style="width: 300px;"
            >
              <template #prefix>
                <n-icon><SearchOutline /></n-icon>
              </template>
            </n-input>
            
            <n-select
              v-model:value="statusFilter"
              :options="statusOptions"
              placeholder="Filter by status"
              style="width: 180px;"
            />
          </n-space>
        </n-card>
        
        <n-card>
          <div v-if="isLoading || interviewStore.isLoading" style="display: flex; justify-content: center; padding: 40px;">
            <n-spin size="large" />
          </div>
          
          <div v-else-if="filteredInterviews.length === 0">
            <n-empty description="No interviews found">
              <template #extra>
                <n-button type="primary" tag="a" href="/interviews/new">
                  Add Interview
                </n-button>
              </template>
            </n-empty>
          </div>
          
          <n-data-table
            v-else
            :columns="columns"
            :data="filteredInterviews"
            :pagination="{
              pageSize: 10
            }"
            :bordered="false"
            @update:sorter="handleSorting"
          />
        </n-card>
      </n-space>
    </div>
  </MainLayout>
</template>
