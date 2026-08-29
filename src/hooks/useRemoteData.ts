import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '@/services/api'

export function useRemoteData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [request, setRequest] = useState(0)
  const reload = useCallback(() => {
    setIsLoading(true)
    setRequest((value) => value + 1)
  }, [])
  useEffect(() => {
    let active = true
    void loader()
      .then((value) => {
        if (active) {
          setData(value)
          setError('')
        }
      })
      .catch((reason) => {
        if (active) setError(getApiErrorMessage(reason))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [loader, request])
  return { data, error, isLoading, reload }
}
