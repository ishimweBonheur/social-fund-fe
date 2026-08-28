import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '@/services/api'

export function useRemoteData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    let active = true
    void loader().then((value) => { if (active) setData(value) }).catch((reason) => { if (active) setError(getApiErrorMessage(reason)) }).finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [loader])
  return { data, error, isLoading }
}
