<template>
  <div class="mx-auto max-w-4xl">
    <div
      v-if="fetchError"
      class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
      role="alert"
      aria-live="assertive"
    >
      {{ fetchError }}
    </div>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="mb-6 rounded-lg bg-white/80 p-6 text-center shadow-sm dark:bg-neutral-700/60"
      aria-live="polite"
    >
      <p class="text-neutral-700 dark:text-neutral-300">読み込み中…</p>
    </div>

    <!-- Empty state: only shown when not loading and no error -->
    <div
      v-if="!fetchError && !isLoading && data.length === 0"
      class="mb-6 rounded-lg bg-white/80 p-6 text-center shadow-sm dark:bg-neutral-700/60"
    >
      <p class="text-neutral-700 dark:text-neutral-300">
        現在、お知らせはありません。
      </p>
    </div>

    <div class="grid gap-6">
      <article
        v-for="item in data"
        :key="item.id"
        class="rounded-lg bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg dark:bg-neutral-700"
        role="article"
        :aria-labelledby="`news-${item.id}`"
      >
        <header class="mb-2 flex items-start justify-between gap-4">
          <h2
            :id="`news-${item.id}`"
            class="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
          >
            {{ item.title }}
          </h2>
          <time
            v-if="item.date"
            class="ml-auto text-sm whitespace-nowrap text-neutral-500 dark:text-neutral-300"
            :datetime="item.date"
            :aria-label="`更新日: ${item.date}`"
          >
            {{ formatDate(item.date) }}
          </time>
        </header>

        <template v-if="isLong(item)">
          <details class="group">
            <summary class="cursor-pointer list-none">
              <div class="mb-4 group-open:hidden">
                <p class="text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                  {{ getPreview(item) }}
                </p>
              </div>
              <div class="font-semibold text-cyan-600 group-open:hidden hover:text-cyan-700 dark:text-cyan-400">
                続きを読む
              </div>
              <div class="mb-4 hidden font-semibold text-cyan-600 group-open:block hover:text-cyan-700 dark:text-cyan-400">
                閉じる
              </div>
            </summary>

            <div class="text-sm text-neutral-700 dark:text-neutral-300">
              <p class="whitespace-pre-wrap">{{ item.content }}</p>
            </div>
          </details>
        </template>
        <template v-else>
          <div class="text-sm text-neutral-700 dark:text-neutral-300">
            <p class="whitespace-pre-wrap">{{ item.content }}</p>
          </div>
        </template>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

type NewsItem = {
  id: string
  title: string
  content: string
  date?: string
}

const data = ref<NewsItem[]>([])
const fetchError = ref<string | null>(null)
const isLoading = ref(true)
const url = "https://api.omu-aikido.com/news"

// Helper: determine whether an item is long enough to need "続きを読む"
const isLong = (item: NewsItem) => {
  return !!item.content && item.content.length > 70
}

// Helper: get preview text for long items
const getPreview = (item: NewsItem) => {
  if (!item.content) return ""
  return item.content.slice(0, 70).trimEnd() + "…"
}

// Helper: format ISO date to ja-JP
const formatDate = (date?: string) => {
  if (!date) return ""
  // Use try/catch to avoid invalid date causing exceptions
  try {
    return new Date(date).toLocaleDateString("ja-JP")
  } catch {
    return date
  }
}

const fetchNews = async () => {
  isLoading.value = true
  fetchError.value = null

  try {
    const res = await fetch(url)
    if (!res.ok) {
      fetchError.value = `ニュースの取得に失敗しました（HTTP ${res.status}）`
      data.value = []
      return
    }

    const json = await res.json()
    // keep a copy of the raw JSON for debugging
    console.log("news.vue - fetched raw JSON:", json)

    if (Array.isArray(json)) {
      data.value = json.map((d: any) => ({
        id: d?.id ? String(d.id) : Math.random().toString(36),
        title: d?.title ? String(d.title) : "(無題)",
        content: d?.content ? String(d.content) : "",
        date: d?.date ? String(d.date) : undefined,
      })) as NewsItem[]
    } else {
      fetchError.value = "API のレスポンスが予期した形式ではありません。"
      data.value = []
    }
  } catch (err) {
    fetchError.value = "ニュースの取得中にエラーが発生しました。"
    console.error("news.vue fetch error:", err)
    data.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void fetchNews()
})
</script>