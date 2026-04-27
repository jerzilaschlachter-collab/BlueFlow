import Sidebar from '@/components/Sidebar'
import { AnalyzingProvider } from '@/lib/contexts/AnalyzingContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnalyzingProvider>
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-60 px-6 py-8 transition-all duration-300">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </AnalyzingProvider>
  )
}
