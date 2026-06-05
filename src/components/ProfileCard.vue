<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    avatar: string
    role?: string
    clients: number
    projects?: number
    tasks?: number
  }>(),
  {
    role: undefined,
    projects: undefined,
    tasks: undefined,
  },
)

const imageFailed = ref(false)

const initials = computed(() => {
  return props.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})
</script>

<template>
  <v-card elevation="2" rounded="lg" class="fill-height">
    <v-card-text class="pa-5 pa-md-6">
      <div class="d-flex align-center ga-4">
        <v-avatar size="56" rounded="lg" color="primary" variant="tonal">
          <v-img v-if="avatar && !imageFailed" :src="avatar" :alt="`${name} profile image`" @error="imageFailed = true" />
          <span v-else class="text-subtitle-2 font-weight-bold">{{ initials }}</span>
        </v-avatar>

        <div class="min-w-0">
          <div class="text-h6 font-weight-bold text-truncate">{{ name }}</div>
          <div v-if="role" class="text-body-2 text-medium-emphasis text-truncate">{{ role }}</div>
        </div>
      </div>

      <v-divider class="my-4" />

      <v-row dense>
        <v-col cols="12" sm="4">
          <div class="text-caption text-medium-emphasis">Clients</div>
          <div class="text-h6 font-weight-bold">{{ clients }}</div>
        </v-col>
        <v-col v-if="projects !== undefined" cols="12" sm="4">
          <div class="text-caption text-medium-emphasis">Projects</div>
          <div class="text-h6 font-weight-bold">{{ projects }}</div>
        </v-col>
        <v-col v-if="tasks !== undefined" cols="12" sm="4">
          <div class="text-caption text-medium-emphasis">Tasks</div>
          <div class="text-h6 font-weight-bold">{{ tasks }}</div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>