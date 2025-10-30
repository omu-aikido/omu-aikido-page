<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

type Event = {
  id: string;
  start: string;
  end: string;
  title: string;
  description?: string;
};

interface CalendarViewProps {
  endpoint?: string;
}

const props = withDefaults(defineProps<CalendarViewProps>(), {
  endpoint: "https://api.omu-aikido.com/calendar/json"
});

const events = ref<Event[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

let cancelled = false;
let controller: AbortController;

async function fetchEvents() {
  loading.value = true;
  error.value = null;

  try {
    const res = await fetch(props.endpoint, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(
        `Failed to fetch events: ${res.status} ${res.statusText}`,
      );
    }
    const data = (await res.json()) as Event[];
    if (!cancelled) {
      events.value = Array.isArray(data) ? data : [];
    }
  } catch (err: unknown) {
    if (
      !cancelled &&
      !(err instanceof Error && err.name === "AbortError")
    ) {
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

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

function formatTime(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isAllDayEvent(event: Event) {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  return endDate.getTime() - startDate.getTime() === 24 * 60 * 60 * 1000;
}

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
  <!-- Loading State -->
  <div v-if="loading" class="py-12 text-center">
    <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-neutral-900 dark:border-neutral-100"></div>
    <p class="text-lg text-neutral-600 dark:text-neutral-400">
      Loading...
    </p>
  </div>

  <!-- Error State -->
  <div v-if="error" class="mx-6 mb-6 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
    <div class="flex items-center">
      <div class="shrink-0">
        <svg
          class="h-5 w-5 text-red-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
          エラーが発生しました
        </h3>
        <p class="mt-1 text-sm text-red-700 dark:text-red-300">
          {{ error }}
        </p>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-if="!loading && !error && events.length === 0" class="py-12 text-center">
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
      現在予定されている稽古はありません
    </p>
  </div>

  <!-- Events List -->
  <div v-if="!loading && !error && events.length > 0" class="mb-8 space-y-4">
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
          <div class="text-md grid grid-cols-1 items-center text-neutral-500 sm:grid-cols-2 dark:text-neutral-400">
            <div class="flex items-center">
              <svg
                class="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="mr-4 text-neutral-700 dark:text-neutral-300">
                {{ formatDate(event.start) }}
              </span>
            </div>
            <div v-if="!isAllDayEvent(event) && event.start !== event.end" class="flex items-center">
              <svg
                class="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="mr-4 text-neutral-700 dark:text-neutral-300">
                {{ formatTime(event.start) }}
                <span v-if="event.end"> - {{ formatTime(event.end) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
