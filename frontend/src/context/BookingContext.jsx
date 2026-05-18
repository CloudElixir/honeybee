import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [prefill, setPrefill] = useState({})

  const openBooking = useCallback((defaults = {}) => {
    setPrefill(defaults)
    setOpen(true)
  }, [])

  const closeBooking = useCallback(() => {
    setOpen(false)
  }, [])

  const value = useMemo(
    () => ({ open, prefill, openBooking, closeBooking, setOpen }),
    [open, prefill, openBooking, closeBooking]
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}
