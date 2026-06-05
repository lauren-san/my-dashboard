<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

type RegionDetail = {
  name: string
  onTime: number
  lateShipments: number
  avgDelayHours: number
  volume: number
}

const router = useRouter()

const regions = ref<RegionDetail[]>([
  { name: 'Northeast', onTime: 97.3, lateShipments: 19, avgDelayHours: 1.7, volume: 282 },
  { name: 'Southeast', onTime: 95.9, lateShipments: 27, avgDelayHours: 2.4, volume: 314 },
  { name: 'Central', onTime: 96.7, lateShipments: 22, avgDelayHours: 2.1, volume: 356 },
  { name: 'West', onTime: 95.1, lateShipments: 31, avgDelayHours: 2.8, volume: 296 },
])

function goBack() {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <v-container fluid class="py-6 px-4 px-md-8">
    <v-app-bar rounded="lg" class="mb-5" elevation="2">
      <v-app-bar-title>
        Regional Performance
        <div class="text-caption text-medium-emphasis">
          Compare shipment volume, on-time execution, and delay exposure across operating regions.
        </div>
      </v-app-bar-title>
      <v-btn color="primary" variant="tonal" @click="goBack">
        <v-icon start>mdi-arrow-left</v-icon>
        Back to Dashboard
      </v-btn>
    </v-app-bar>

    <v-row>
      <v-col v-for="region in regions" :key="region.name" cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ region.name }}</span>
            <v-chip size="small" color="primary" variant="outlined">{{ region.volume }} loads</v-chip>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">On-Time Rate</div>
                <div class="text-h6 font-weight-bold">{{ region.onTime.toFixed(1) }}%</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Late Shipments</div>
                <div class="text-h6 font-weight-bold">{{ region.lateShipments }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Avg Delay</div>
                <div class="text-h6 font-weight-bold">{{ region.avgDelayHours.toFixed(1) }}h</div>
              </v-col>
            </v-row>
            <v-progress-linear
              class="mt-3"
              :model-value="region.onTime"
              color="success"
              rounded
              rounded-bar
              height="10"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
