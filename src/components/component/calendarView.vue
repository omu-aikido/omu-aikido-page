<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import type { Event } from "./types";
import CalendarList from "./calendarList.vue";
import CalendarGrid from "./calendarGrid.vue";

interface CalendarViewProps {
  endpoint?: string;
}

const props = withDefaults(defineProps<CalendarViewProps>(), {
  endpoint: "https://api.omu-aikido.com/calendar/json",
});

const events = ref<Event[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const viewMode = ref<"list" | "calendar">("list");

let cancelled = false;
let controller: AbortController;

async function fetchEvents() {
  loading.value = true;
  error.value = null;

  try {
    const res = await fetch(props.endpoint, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as Event[];
    if (!cancelled) {
      events.value = Array.isArray(data) ? data : [];
    }
  } catch (err: unknown) {
    if (!cancelled && !(err instanceof Error && err.name === "AbortError")) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "稽古予定の読み込みに失敗しました";
      }
      events.value = [];
    }
  } finally {
    if (!cancelled) loading.value = false;
  }
}

// Filter events for current month only
const currentMonthEvents = computed(() => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return events.value.filter((event) => {
    const eventDate = new Date(event.start);
    return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth;
  });
});

onMounted(() => {
  controller = new AbortController();
  fetchEvents();
});

onUnmounted(() => {
  cancelled = true;
  if (controller) {
    controller.abort();
  }
});
</script>

<template>
  <!-- View Mode Toggle -->
  <div v-if="!loading && !error" class="mb-6">
    <div
      class="flex items-center justify-end gap-2 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800"
    >
      <button
        type="button"
        @click="viewMode = 'list'"
        :class="[
          'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
          viewMode === 'list'
            ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-700 dark:text-neutral-100 dark:ring-neutral-600'
            : 'text-neutral-600 hover:bg-white/50 dark:text-neutral-400 dark:hover:bg-neutral-700/50',
        ]"
      >
        <div class="i-heroicons:list-bullet-16-solid" />
        リスト
      </button>
      <button
        type="button"
        @click="viewMode = 'calendar'"
        :class="[
          'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
          viewMode === 'calendar'
            ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-700 dark:text-neutral-100 dark:ring-neutral-600'
            : 'text-neutral-600 hover:bg-white/50 dark:text-neutral-400 dark:hover:bg-neutral-700/50',
        ]"
      >
        <div class="i-heroicons:calendar-days-16-solid" />
        カレンダー
      </button>
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="loading" class="py-12 text-center">
    <div
      class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-neutral-900 dark:border-neutral-100"
    ></div>
    <p class="text-lg text-neutral-600 dark:text-neutral-400">Loading...</p>
  </div>

  <!-- Error State -->
  <div
    v-if="error"
    class="mx-6 mb-6 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20"
  >
    <div class="flex items-center">
      <div class="shrink-0">
        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-red-800 dark:text-red-200">エラーが発生しました</h3>
        <p class="mt-1 text-sm text-red-700 dark:text-red-300">
          {{ error }}
        </p>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-if="!loading && !error && currentMonthEvents.length === 0" class="py-12 text-center">
    <svg
      class="mx-auto mb-4 h-12 w-12 text-neutral-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        :stroke-width="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
    <p class="mb-2 text-lg text-neutral-600 dark:text-neutral-400">
      今月予定されている稽古はありません
    </p>
  </div>

  <!-- Calendar Grid View -->
  <CalendarGrid
    v-if="!loading && !error && currentMonthEvents.length > 0 && viewMode === 'calendar'"
    :events="currentMonthEvents"
  />

  <!-- Calendar List View -->
  <CalendarList
    v-if="!loading && !error && currentMonthEvents.length > 0 && viewMode === 'list'"
    :events="currentMonthEvents"
  />
</template>
