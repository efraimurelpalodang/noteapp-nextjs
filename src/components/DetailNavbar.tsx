'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'

type Props = {
  title: string
}

export default function DetailNavbar({ title }: Props) {
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleLocalSearch = () => {
    window.dispatchEvent(new Event('toggle-topic-search'))
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 border-b bg-background/80 backdrop-blur-md">
      {/* Left — Back button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => router.push('/')}
        className="hover:bg-accent/50"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Back to home</span>
      </Button>

      {/* Center — Topic title (truncated) */}
      <h1 className="text-base font-semibold truncate max-w-[40%] text-center">
        {title}
      </h1>

      {/* Right — Search + Theme + Profile */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleLocalSearch} className="hover:bg-accent/50">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="hover:bg-accent/50"
        >
          {mounted ? (
            theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Profile Avatar */}
        {user && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="flex flex-col gap-2">
                <p className="font-semibold">{user.user_metadata?.full_name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Separator />
                <Button variant="destructive" onClick={() => setShowLogoutConfirm(true)}>
                  Log Out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
