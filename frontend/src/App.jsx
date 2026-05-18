import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoadingSpinner } from './components/LoadingSpinner'
import { destinations, getDestinationSlug } from './data/destinations'

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })))
const Destinations = lazy(() => import('./pages/Destinations').then((m) => ({ default: m.Destinations })))
const DestinationDetailDynamic = lazy(() =>
  import('./pages/DestinationDetailDynamic').then((m) => ({ default: m.DestinationDetailDynamic }))
)
const DestinationPackageDetail = lazy(() =>
  import('./pages/DestinationDetail').then((m) => ({ default: m.DestinationPackageDetail }))
)
const Packages = lazy(() => import('./pages/Packages').then((m) => ({ default: m.Packages })))
const PackageDetail = lazy(() =>
  import('./pages/PackageDetail').then((m) => ({ default: m.PackageDetail }))
)
const Blogs = lazy(() => import('./pages/Blogs').then((m) => ({ default: m.Blogs })))
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })))
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })))
const International = lazy(() =>
  import('./pages/International').then((m) => ({ default: m.International }))
)
const Domestic = lazy(() => import('./pages/Domestic').then((m) => ({ default: m.Domestic })))
const HoneymoonPackages = lazy(() =>
  import('./pages/HoneymoonPackages').then((m) => ({ default: m.HoneymoonPackages }))
)
const HoneybeeHandpick = lazy(() =>
  import('./pages/HoneybeeHandpick').then((m) => ({ default: m.HoneybeeHandpick }))
)
const RomanticGetaways = lazy(() =>
  import('./pages/RomanticGetaways').then((m) => ({ default: m.RomanticGetaways }))
)
const GroupDepartures = lazy(() =>
  import('./pages/GroupDepartures').then((m) => ({ default: m.GroupDepartures }))
)
const FamilyFunventure = lazy(() =>
  import('./pages/FamilyFunventure').then((m) => ({ default: m.FamilyFunventure }))
)
const SantoriniGlowPage = lazy(() =>
  import('./pages/destinations/SantoriniGlowPage').then((m) => ({ default: m.SantoriniGlowPage }))
)
const KyotoHeritagePage = lazy(() =>
  import('./pages/destinations/KyotoHeritagePage').then((m) => ({ default: m.KyotoHeritagePage }))
)
const AmalfiRivieraPage = lazy(() =>
  import('./pages/destinations/AmalfiRivieraPage').then((m) => ({ default: m.AmalfiRivieraPage }))
)
const PatagoniaWildPage = lazy(() =>
  import('./pages/destinations/PatagoniaWildPage').then((m) => ({ default: m.PatagoniaWildPage }))
)
const MarrakechRiadPage = lazy(() =>
  import('./pages/destinations/MarrakechRiadPage').then((m) => ({ default: m.MarrakechRiadPage }))
)
const BaliSerenityPage = lazy(() =>
  import('./pages/destinations/BaliSerenityPage').then((m) => ({ default: m.BaliSerenityPage }))
)
const SwissAlpinePage = lazy(() =>
  import('./pages/destinations/SwissAlpinePage').then((m) => ({ default: m.SwissAlpinePage }))
)
const CostaRicaPuraVidaPage = lazy(() =>
  import('./pages/destinations/CostaRicaPuraVidaPage').then((m) => ({ default: m.CostaRicaPuraVidaPage }))
)

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-honey border-r-gold" />
    </div>
  )
}

export default function App() {
  const [booting, setBooting] = useState(true)
  const destinationSlugs = destinations.map((destination) => getDestinationSlug(destination)).filter(Boolean)

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 750)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <>
      <LoadingSpinner show={booting} />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="destinations" element={<Destinations />} />
            <Route path="destinations/santorini-glow" element={<SantoriniGlowPage />} />
            <Route path="destinations/kyoto-heritage" element={<KyotoHeritagePage />} />
            <Route path="destinations/amalfi-riviera" element={<AmalfiRivieraPage />} />
            <Route path="destinations/patagonia-wild" element={<PatagoniaWildPage />} />
            <Route path="destinations/marrakech-riad" element={<MarrakechRiadPage />} />
            <Route path="destinations/bali-serenity" element={<BaliSerenityPage />} />
            {/* Aliases from package-location slugs → same curated page (avoids blank / broken dynamic handoff). */}
            <Route path="destinations/bali-indonesia" element={<BaliSerenityPage />} />
            <Route path="destinations/bali-ubud" element={<BaliSerenityPage />} />
            <Route path="destinations/bali" element={<BaliSerenityPage />} />
            <Route path="destinations/swiss-alpine" element={<SwissAlpinePage />} />
            <Route path="destinations/costa-rica-pura-vida" element={<CostaRicaPuraVidaPage />} />
            <Route path="destinations/:id" element={<DestinationDetailDynamic />} />
            <Route path="destinations/:id/packages/:packageId" element={<DestinationPackageDetail />} />
            <Route path="packages" element={<Packages />} />
            <Route path="packages/:id" element={<PackageDetail />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="international" element={<International />} />
            <Route path="domestic" element={<Domestic />} />
            <Route path="honeymoon-packages" element={<HoneymoonPackages />} />
            <Route path="romantic-getaways" element={<RomanticGetaways />} />
            <Route path="group-departures" element={<GroupDepartures />} />
            <Route path="family-funventure" element={<FamilyFunventure />} />
            <Route path="honeybee-handpick" element={<HoneybeeHandpick />} />
            <Route path="about" element={<About />} />
            <Route path="about-us" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
