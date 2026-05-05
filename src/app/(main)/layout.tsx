import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/Navbar'
import { CommandMenu } from '@/components/CommandMenu'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CommandMenu />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
      <Toaster position="bottom-right" />
    </>
  )
}
