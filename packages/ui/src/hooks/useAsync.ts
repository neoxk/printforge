import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'

type AsyncState<T> = {
  data: T | null
  isLoading: boolean
  error: Error | null
  reload: () => void
}

function normalizeUnknownError(error: unknown) {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  if (error && typeof error === 'object') {
    try {
      return new Error(JSON.stringify(error))
    } catch {
      return new Error('An unknown error occurred.')
    }
  }

  return new Error(String(error))
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: DependencyList = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tick, setTick] = useState(0)
  const fnRef = useRef(asyncFn)
  fnRef.current = asyncFn

  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fnRef.current()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(normalizeUnknownError(err))
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  return { data, isLoading, error, reload }
}
