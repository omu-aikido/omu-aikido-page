import { Dialog, DialogPanel } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

export default function ReactHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-neutral-100 dark:bg-neutral-800">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-5 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">大阪公立大学合氣道部</span>
            <img
              alt=""
              src="/favicon.svg"
              className="h-10 w-auto rounded-full"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-neutral-700 hover:cursor-pointer dark:text-neutral-400"
          >
            <span className="sr-only">リンクメニューを開く</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="[&_a]:text-md hidden lg:flex lg:gap-x-12 [&_a]:rounded-md [&_a]:p-3 [&_a]:font-semibold [&_a]:text-neutral-900 [&_a]:hover:bg-neutral-500/20 [&_a]:dark:text-neutral-100">
          <a href="/">ホーム</a>
          <a href="/about">合氣道部について</a>
          <a href="/calendar">稽古予定</a>
          <a href="/access">アクセス</a>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a
            href="/support"
            className="rounded-md p-3 font-semibold text-neutral-900 hover:bg-neutral-500/20 dark:text-neutral-100"
          >
            応援する<span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <aside>
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-neutral-100 p-5 sm:max-w-sm sm:ring-1 sm:ring-neutral-900/10 dark:bg-neutral-800 dark:sm:ring-neutral-100/10">
            <div className="flex items-center justify-between">
              <a href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">大阪公立大学合氣道部</span>
                <img
                  alt=""
                  src="/favicon.svg"
                  className="h-10 w-auto rounded-full"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-neutral-700 dark:text-neutral-400"
              >
                <span className="sr-only">メニューを閉じる</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-neutral-500/10 dark:divide-neutral-100/10">
                <div className="space-y-2 py-6 [&_a]:-mx-3 [&_a]:block [&_a]:rounded-lg [&_a]:px-3 [&_a]:py-2 [&_a]:text-base/7 [&_a]:font-semibold [&_a]:text-neutral-900 [&_a]:hover:bg-neutral-50 [&_a]:dark:text-neutral-100 [&_a]:dark:hover:bg-neutral-100/5">
                  <a href="/">ホーム</a>
                  <a href="/about">合氣道部について</a>
                  <a href="/calendar">稽古予定</a>
                  <a
                    href="/access"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-100/5"
                  >
                    アクセス
                  </a>
                  <div className="py-6">
                    <a href="/support">
                      応援する<span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </aside>
      </Dialog>
    </div>
  )
}
