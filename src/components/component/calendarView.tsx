import { useEffect, useState } from "react"

type Event = {
  id: string
  start: string
  end: string
  title: string
  description?: string
}

interface CalendarViewProps {
  endpoint?: string
}

export default function CalendarView({
  endpoint = "https://api.omu-aikido.com/calendar/json",
}: CalendarViewProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function fetchEvents() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(endpoint, { signal: controller.signal })
        if (!res.ok) {
          throw new Error(
            `Failed to fetch events: ${res.status} ${res.statusText}`
          )
        }
        const data = (await res.json()) as Event[]
        if (!cancelled) {
          setEvents(Array.isArray(data) ? data : [])
        }
      } catch (err: unknown) {
        if (
          !cancelled &&
          !(err instanceof Error && err.name === "AbortError")
        ) {
          if (err instanceof Error) {
            setError(err.message)
          } else {
            setError("稽古予定の読み込みに失敗しました")
          }
          setEvents([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchEvents()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [endpoint])

  function formatDate(dateString: string) {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return dateString

    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      weekday: "short",
    })
  }

  function formatTime(dateString: string) {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return ""

    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-neutral-900 dark:border-neutral-100"></div>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Loading...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mx-6 mb-6 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                エラーが発生しました
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && events.length === 0 && (
        <div className="py-12 text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mb-2 text-lg text-neutral-600 dark:text-neutral-400">
            現在予定されている稽古はありません
          </p>
        </div>
      )}

      {/* Events List */}
      {!loading && !error && events.length > 0 && (
        <>
          <div className="mb-8 space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-neutral-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md dark:border-neutral-600 dark:bg-neutral-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {event.title.includes("中百舌鳥") ? (
                      <h3 className="mb-2 text-lg font-semibold text-cyan-600 dark:text-cyan-300">
                        {event.title}
                      </h3>
                    ) : event.title.includes("杉本") ? (
                      <h3 className="mb-2 text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                        {event.title}
                      </h3>
                    ) : (
                      <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {event.title}
                      </h3>
                    )}
                    <div className="text-md grid grid-cols-1 items-center text-neutral-500 sm:grid-cols-2 dark:text-neutral-400">
                      <div className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="mr-4 text-neutral-700 dark:text-neutral-300">
                          {formatDate(event.start)}
                        </span>
                      </div>
                      {(() => {
                        const startDate = new Date(event.start)
                        const endDate = new Date(event.end)

                        // Check if it's an all-day event by comparing dates and times
                        const isAllDay =
                          endDate.getTime() - startDate.getTime() ===
                          24 * 60 * 60 * 1000

                        if (isAllDay) {
                          return null // Don't show time for all-day events
                        }

                        if (event.start !== event.end) {
                          return (
                            <div className="flex items-center">
                              <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="mr-4 text-neutral-700 dark:text-neutral-300">
                                {formatTime(event.start)}
                                {event.end && ` - ${formatTime(event.end)}`}
                              </span>
                            </div>
                          )
                        }

                        return null
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
