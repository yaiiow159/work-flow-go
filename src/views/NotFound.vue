<script setup lang="ts">
import { NResult, NButton, NSpace } from 'naive-ui'
import MainLayout from '../components/layout/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <div class="page-container">
      <NResult
        status="404"
        title="Page Not Found"
        description="Sorry, the page you were looking for doesn't exist."
      >
        <template #footer>
          <NSpace justify="center">
            <NButton type="primary" tag="a" href="/">
              Go to Dashboard
            </NButton>
            <NButton tag="a" href="/interviews">
              View Interviews
            </NButton>
          </NSpace>
        </template>
      </NResult>
    </div>
  </MainLayout>
</template>
