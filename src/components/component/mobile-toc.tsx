import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"

export default function MobileToc({
  toc,
}: {
  toc: Array<{
    text: string
    slug: string
    children: Array<{ text: string; slug: string }>
  }>
}) {
  return (
    <Popover className="relative">
      <PopoverButton className="ml-4 inline-flex items-center gap-x-1 text-sm/6 font-semibold text-neutral-900 dark:text-neutral-100">
        <span>目次</span>
        <ChevronDownIcon aria-hidden="true" className="size-5" />
      </PopoverButton>

      <PopoverPanel
        transition
        className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 bg-transparent px-4 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
      >
        <div className="w-screen max-w-md flex-auto overflow-hidden rounded-md bg-neutral-100 text-sm/6 shadow-lg outline-1 outline-neutral-900/5 dark:bg-neutral-800 dark:shadow-none dark:-outline-offset-1 dark:outline-neutral-100/10">
          <div className="p-4">
            <ol className="ml-4 list-decimal">
              {toc.map((parent) => (
                <li
                  key={parent.slug}
                  className="mb-2 text-neutral-600 dark:text-neutral-400"
                >
                  <a
                    href={`#${parent.slug}`}
                    className="font-semibold text-neutral-600 dark:text-neutral-400"
                  >
                    {parent.text}
                  </a>

                  {parent.children && parent.children.length > 0 && (
                    <ol className="mt-1 ml-6 list-decimal text-neutral-600 dark:text-neutral-400">
                      {parent.children.map((child) => (
                        <li key={child.slug} className="mb-1">
                          <a
                            href={`#${child.slug}`}
                            className="text-neutral-700 dark:text-neutral-300"
                          >
                            {child.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  )
}
