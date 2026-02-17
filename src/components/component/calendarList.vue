<script setup lang="ts">
import type { Event } from "./types";
import {
  isAllDayEvent,
  isMultiDayEvent,
  formatEventDateRange,
  formatEventTime,
} from "./calendarUtils";

interface CalendarListProps {
  events: Event[];
}

defineProps<CalendarListProps>();

function getTitleClass(title: string) {
  if (title.includes("中百舌鳥")) {
    return "mb-2 text-lg font-semibold text-cyan-600 dark:text-cyan-300";
  } else if (title.includes("杉本")) {
    return "mb-2 text-lg font-semibold text-green-700 dark:text-green-300";
  } else if (title.includes("会")) {
    return "mb-2 text-lg font-semibold text-orange-700 dark:text-orange-300";
  } else {
    return "mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100";
  }
}
</script>

<template>
  <div class="mb-8 space-y-4 max-w-180 mx-auto">
    <div
      v-for="event in events"
      :key="event.id"
      class="rounded-lg border border-neutral-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md dark:border-neutral-600 dark:bg-neutral-700"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 :class="getTitleClass(event.title)">
            {{ event.title }}
          </h3>
          <div
            class="text-md grid grid-cols-1 items-center text-neutral-500 sm:grid-cols-2 dark:text-neutral-400"
          >
            <div class="flex items-center">
              <div class="i-heroicons:calendar-20-solid" />
              &nbsp;
              <span class="mr-4 text-neutral-700 dark:text-neutral-300">
                {{ formatEventDateRange(event) }}
              </span>
            </div>
            <div
              v-if="!isAllDayEvent(event) && event.start !== event.end && !isMultiDayEvent(event)"
              class="flex items-center"
            >
              <div class="i-heroicons:clock-16-solid" />
              &nbsp;
              <span class="mr-4 text-neutral-700 dark:text-neutral-300">
                {{ formatEventTime(event.start) }}
                <span v-if="event.end"> - {{ formatEventTime(event.end) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
