'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import ConfirmDialog from './ConfirmDialog'
import ThemeToggle from './ThemeToggle'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Hide/Show navbar on scroll
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlNavbar)
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setShowLogoutConfirm(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <nav className={cn(
        "fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-xl font-black tracking-tighter text-foreground">
                  StudyNote
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              
              {!loading && (
                <>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  {user ? (
                    <div className="flex items-center gap-3">
                      <div className="hidden flex-col items-end sm:flex">
                        <span className="text-xs font-semibold text-foreground">
                          {user.email?.split('@')[0]}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {user.email}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowLogoutConfirm(true)}
                        className="rounded-full hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
                        title="Keluar"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Keluar</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" asChild className="cursor-pointer">
                        <Link href="/login">Masuk</Link>
                      </Button>
                      <Button asChild className="cursor-pointer">
                        <Link href="/register">Daftar</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Keluar Akun"
        message="Apakah Anda yakin ingin keluar dari akun StudyNote? Anda harus masuk kembali untuk mengakses catatan Anda."
        confirmLabel="Keluar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  )
}
