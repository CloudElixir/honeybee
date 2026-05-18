import { useEffect, useState } from 'react'
import { fetchSettingsMap } from '../api/adminPublic'

export function useAdminSettings() {
  const [settings, setSettings] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    fetchSettingsMap()
      .then((map) => {
        if (!alive) return
        setSettings(map)
      })
      .catch((e) => {
        if (!alive) return
        setError(e)
      })
    return () => {
      alive = false
    }
  }, [])

  return { settings, error }
}

