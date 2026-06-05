<script setup lang="ts">
import { computed } from 'vue'

type ChangeType = 'increase' | 'decrease' | 'neutral'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    change?: string | number
    changeType?: ChangeType
    icon?: string
    description?: string
  }>(),
  {
    change: undefined,
    changeType: 'neutral',
    icon: undefined,
    description: undefined,
  },
)

const changeColor = computed(() => {
  if (props.changeType === 'increase') {
    return 'success'
  }

  if (props.changeType === 'decrease') {
    return 'error'
  }

  return 'secondary'
})

const changeIcon = computed(() => {
  if (props.changeType === 'increase') {
    return 'mdi-trending-up'
  }

  if (props.changeType === 'decrease') {
    return 'mdi-trending-down'
  }

  return 'mdi-minus'
})

const normalizedChange = computed(() => {
  if (props.change === undefined || props.change === null || props.change === '') {
    return undefined
  }

  return typeof props.change === 'number' ? String(props.change) : props.change
})
</script>

<template>
  <v-card elevation="2" rounded="lg" class="fill-height">
    <v-card-text class="pa-5 pa-md-6">
      <div class="d-flex align-start justify-space-between ga-3">
        <div class="min-w-0">
          <div class="text-overline">{{ title }}</div>
          <div class="text-h4 font-weight-bold mt-1 text-break">{{ value }}</div>
        </div>
        <v-avatar v-if="icon" :color="changeColor" variant="tonal" rounded="lg" size="40">
          <v-icon>{{ icon }}</v-icon>
        </v-avatar>
      </div>

      <div class="d-flex align-center flex-wrap ga-2 mt-4">
        <v-chip v-if="normalizedChange" :color="changeColor" size="small" variant="tonal">
          <v-icon start>{{ changeIcon }}</v-icon>
          {{ normalizedChange }}
        </v-chip>
        <div v-if="description" class="text-body-2 text-medium-emphasis">{{ description }}</div>
      </div>
    </v-card-text>
  </v-card>
</template>