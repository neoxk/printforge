import { useEffect, useRef, useState, type DependencyList } from 'react'

type AsyncState<T> = {
  data: T | null
  isLoading: boolean
  error: Error | null
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: DependencyList = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const fnRef = useRef(asyncFn)
  fnRef.current = asyncFn

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
          setError(err instanceof Error ? err : new Error(String(err)))
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, isLoading, error }
}
