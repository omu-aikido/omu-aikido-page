<template>
  <div>
    <div class="mb-6 flex flex-row items-center justify-between">
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">お知らせ</h2>

      <div v-if="!fetchError && !isLoading && data.length > 0" class="text-center">
        <a
          href="/news"
          class="inline-flex items-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-neutral-900"
        >
          すべてのお知らせを見る
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-if="fetchError"
        class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
        role="alert"
        aria-live="assertive"
      >
        {{ fetchError }}
      </div>

      <div
        v-if="isLoading"
        class="rounded-lg bg-neutral-100/40 p-4 text-center text-sm text-neutral-700 shadow-sm dark:bg-neutral-700/40 dark:text-neutral-300"
        aria-live="polite"
      >
        読み込み中…
      </div>

      <div
        v-if="!fetchError && !isLoading && data.length === 0"
        class="rounded-lg bg-neutral-100/40 p-4 text-center text-sm text-neutral-700 shadow-sm dark:bg-neutral-700/40 dark:text-neutral-300"
      >
        現在、お知らせはありません。
      </div>

      <article
        v-for="item in data"
        :key="item.id"
        class="rounded-lg bg-neutral-100/40 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-neutral-700/40"
        role="article"
        :aria-labelledby="`news-${item.id}`"
      >
        <a :href="`/news#news-${item.id}`" :aria-label="`Read more about ${item.title}`">
          <header class="mb-2 flex items-start justify-between gap-3">
            <h3
              :id="`news-${item.id}`"
              class="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate"
            >
              {{ item.title }}
            </h3>
          </header>

          <div class="text-sm text-neutral-700 dark:text-neutral-300">
            <p class="whitespace-pre-wrap">{{ getPreview(item.content) }}</p>
          </div>
          <time
            v-if="item.date"
            class="place-items-end ml-auto text-xs whitespace-nowrap text-neutral-500 dark:text-neutral-400"
            :datetime="item.date"
            :aria-label="`公開日: ${item.date}`"
          >
            {{ new Date(item.date).toLocaleString("ja-JP") }}
          </time>
        </a>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const limit = 3;
const url = "https://api.omu-aikido.com/news";

type NewsItem = {
  id: string;
  title: string;
  content: string;
  date?: string;
};

const data = ref<NewsItem[]>([]);
const fetchError = ref<string | null>(null);
const isLoading = ref(true);

const getPreview = (content: string) => {
  const NEWS_READ_MORE = 30;
  if (!content) return "";
  const isLong = content.length > NEWS_READ_MORE;
  return isLong ? content.slice(0, NEWS_READ_MORE).trimEnd() + "…" : content;
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      fetchError.value = `ニュースの取得に失敗しました（HTTP ${res.status}）`;
      data.value = [];
    } else {
      const json = await res.json();
      // keep a copy of the raw JSON for debugging UI
      // server-side debug log (visible in server logs)
      console.log("NewsList - fetched raw JSON:", json);

      if (Array.isArray(json)) {
        const allNews = json.map((d: any) => ({
          id: d?.id ? String(d.id) : Math.random().toString(36),
          title: d?.title ? String(d.title) : "(無題)",
          content: d?.content ? String(d.content) : "",
          date: d?.date ? String(d.date) : undefined,
        })) as NewsItem[];

        // 最新のものから指定件数取得
        data.value = allNews.slice(0, limit);
      } else {
        fetchError.value = "API のレスポンスが予期した形式ではありません。";
        data.value = [];
      }
    }
  } catch (err) {
    fetchError.value = "ニュースの取得中にエラーが発生しました。";
    // server-side error log for deeper inspection
    console.error("NewsList fetch error:", err);
    data.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>
