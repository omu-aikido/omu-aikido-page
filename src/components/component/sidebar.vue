<script setup lang="ts">
import { Dialog, DialogPanel } from "@headlessui/vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { ref, onMounted, onUnmounted } from "vue";

const open = ref(false);

const onOpen = () => (open.value = true);
const onClose = () => (open.value = false);
const onToggle = () => (open.value = !open.value);

onMounted(() => {
  if (typeof window === "undefined") return;

  window.addEventListener("sidebar:open", onOpen);
  window.addEventListener("sidebar:close", onClose);
  window.addEventListener("sidebar:toggle", onToggle);
});

onUnmounted(() => {
  if (typeof window === "undefined") return;

  window.removeEventListener("sidebar:open", onOpen);
  window.removeEventListener("sidebar:close", onClose);
  window.removeEventListener("sidebar:toggle", onToggle);
});
</script>

<template>
  <Dialog
    :open="open"
    @close="open = false"
    class="lg:hidden"
  >
    <aside>
      <DialogPanel class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-neutral-100/80 p-5 backdrop-blur-lg sm:max-w-sm sm:ring-1 sm:ring-neutral-900/10 dark:bg-neutral-800/80 dark:sm:ring-neutral-100/10">
        <div class="flex items-center justify-between">
          <a href="/" class="-m-1.5 p-1.5">
            <span class="sr-only">大阪公立大学合氣道部</span>
            <img
              alt=""
              src="/favicon.svg"
              class="h-10 w-auto rounded-full"
            />
          </a>
          <button
            type="button"
            @click="open = false"
            class="-m-2.5 rounded-md p-2.5 text-neutral-700 dark:text-neutral-400"
          >
            <span class="sr-only">メニューを閉じる</span>
            <XMarkIcon aria-hidden="true" class="h-6 w-6" />
          </button>
        </div>

        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-neutral-500/10 dark:divide-neutral-100/10">
            <nav class="space-y-2 py-6 [&_a]:-mx-3 [&_a]:block [&_a]:rounded-lg [&_a]:px-3 [&_a]:py-2 [&_a]:text-base/7 [&_a]:font-semibold [&_a]:text-neutral-900 [&_a]:hover:bg-neutral-50 [&_a]:dark:text-neutral-100 [&_a]:dark:hover:bg-neutral-100/5">
              <a href="/">ホーム</a>
              <a href="/about">合氣道部について</a>
              <a href="/calendar">稽古予定</a>
              <a
                href="/access"
                class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-100/5"
              >
                アクセス
              </a>
              <div class="py-6">
                <a href="/support">
                  応援する<span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </nav>
          </div>
        </div>
      </DialogPanel>
    </aside>
  </Dialog>
</template>
