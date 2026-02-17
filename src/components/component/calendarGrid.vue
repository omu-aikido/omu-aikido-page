<script setup lang="ts">
import { computed, ref } from "vue";
import type { Event } from "./types";
import {
  getEventDateRange,
  isMultiDayEvent,
  formatEventTime,
} from "./calendarUtils";

interface CalendarGridProps {
  events: Event[];
}

const props = defineProps<CalendarGridProps>();

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());

// Calendar-specific functions
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay();
});

const monthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });
});

const calendarDays = computed(() => {
  const days: Date[] = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push(null as unknown as Date);
  }
  // Add all days of the month
  for (let day = 1; day <= daysInMonth.value; day++) {
    days.push(new Date(currentYear.value, currentMonth.value, day));
  }
  return days;
});

const eventsByDate = computed(() => {
  const result = new Map<string, Event[]>();
  props.events.forEach((event) => {
    // Use utility to get adjusted date range
    const { startDate, endDate } = getEventDateRange(event);

    // Normalize loop boundaries to midnight local time for iteration
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    while (current <= end) {
      const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
      if (!result.has(dateKey)) {
        result.set(dateKey, []);
      }
      result.get(dateKey)!.push(event);
      current.setDate(current.getDate() + 1);
    }
  });
  return result;
});

function getEventsForDate(date: Date): Event[] {
  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  return eventsByDate.value.get(dateKey) || [];
}

function getEventColorClass(title: string): string {
  if (title.includes("中百舌鳥")) {
    return "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700";
  } else if (title.includes("杉本")) {
    return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700";
  } else if (title.includes("会")) {
    return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700";
  } else {
    return "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-600";
  }
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getDayClass(date: Date): string {
  const day = date.getDay();
  if (day === 0) return "text-red-600 dark:text-red-400";
  if (day === 6) return "text-blue-600 dark:text-blue-400";
  return "text-neutral-900 dark:text-neutral-100";
}

function getWeekdayClass(weekday: string): string {
  if (weekday === "日") return "text-red-600 dark:text-red-400";
  if (weekday === "土") return "text-blue-600 dark:text-blue-400";
  return "text-neutral-700 dark:text-neutral-300";
}

function isStartDay(event: Event, date: Date): boolean {
  const startDate = new Date(event.start);
  return (
    startDate.getFullYear() === date.getFullYear() &&
    startDate.getMonth() === date.getMonth() &&
    startDate.getDate() === date.getDate()
  );
}
</script>

<template>
  <div class="calendar-container mx-auto sm:max-w-3xl lg:max-w-6xl">
    <div
      class="rounded-lg border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-700"
    >
      <!-- Calendar Header -->
      <div class="px-6 py-4 dark:border-neutral-600 dark:bg-neutral-800">
        <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {{ monthName }}
        </h2>
      </div>

      <!-- Calendar Grid -->
      <div class="p-4 pt-0">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-2 mb-3">
          <div
            v-for="day in ['日', '月', '火', '水', '木', '金', '土']"
            :key="day"
            :class="['text-center font-medium py-2 text-[min(0.875rem,2.5cqw)]', getWeekdayClass(day)]"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-0.5">
          <div
            v-for="(date, index) in calendarDays"
            :key="index"
            class="relative min-h-[14cqw] rounded-sm border p-[min(0.5rem,1.5cqw)] transition-shadow dark:bg-neutral-800"
            :class="[
              !date ? 'bg-neutral-50 dark:bg-neutral-900/50' : 'bg-white dark:bg-neutral-800',
              date && isToday(date)
                ? 'border-2 border-cyan-500'
                : 'border-neutral-200  dark:border-neutral-600',
            ]"
          >
            <div v-if="date" class="h-full flex flex-col overflow-hidden">
              <span class="mb-2 font-medium text-[min(1rem,3cqw)]" :class="getDayClass(date)">
                {{ date.getDate() }}
              </span>
              <div class="flex-1 space-y-1 overflow-y-auto">
                <div
                  v-for="event in getEventsForDate(date)"
                  :key="event.id"
                  :class="['px-[0.5cqw] py-[0.25cqw] rounded border', getEventColorClass(event.title)]"
                  :title="`${event.title} ${formatEventTime(event.start)}${event.end ? ' - ' + formatEventTime(event.end) : ''}`"
                >
                  <div class="font-medium truncate text-[min(0.75rem,2cqw)]">{{ event.title }}</div>
                  <div
                    v-if="isStartDay(event, date) && !isMultiDayEvent(event)"
                    class="opacity-75 mt-0.5 text-[min(0.75rem,2cqw)]"
                  >
                    {{ formatEventTime(event.start) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-container {
  container-type: inline-size;
}
</style>
