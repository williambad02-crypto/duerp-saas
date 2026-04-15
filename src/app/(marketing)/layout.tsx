import { CookieBanner } from '@/components/landing/cookie-banner'
import { MarketingNav } from '@/components/marketing/nav'
import { MarketingFooter } from '@/components/marketing/footer'
import { BackToTop } from '@/components/marketing/back-to-top'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNav />
      {/* pt-20 compense le nav fixed qui sort du flux */}
      <main className="flex-1 pt-20">{children}</main>
      <MarketingFooter />
      <CookieBanner />
      <BackToTop />
    </div>
  )
}
