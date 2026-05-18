import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { WhatsAppFloat } from './WhatsAppFloat'
import { BookingModal } from './BookingModal'
import { AnnouncementBar } from './AnnouncementBar'
import { ScrollArrows } from './ScrollArrows'

const STORAGE_KEY = 'hb-announce'

export function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [announcementOpen, setAnnouncementOpen] = useState(true)

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === '0') {
      setAnnouncementOpen(false)
    }
  }, [])

  const dismissAnnouncement = () => {
    setAnnouncementOpen(false)
    sessionStorage.setItem(STORAGE_KEY, '0')
  }

  const showAnnouncement = announcementOpen && isHome

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {showAnnouncement && <AnnouncementBar visible onDismiss={dismissAnnouncement} />}
      <Navbar announcementVisible={showAnnouncement} />
      <main
        id="main-content"
        className={isHome ? 'flex-1 pt-0' : 'flex-1 pt-20 sm:pt-24'}
      >
        <Outlet />
      </main>
      <Footer />
      <ScrollArrows />
      <WhatsAppFloat hideOnHome />
      <BookingModal />
    </div>
  )
}
