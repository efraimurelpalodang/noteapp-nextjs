'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div 
      className="relative flex h-screen overflow-hidden items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop')" }}
    >
      {/* Blurred Overlay */}
      <div className="absolute inset-0 bg-slate-300/50 backdrop-blur-md"></div>
      
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center justify-center px-4">
        {/* Title Section */}
        <div className="flex flex-col items-center space-y-6 mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
            StudyNote
          </h1>
          <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
          <div className="flex flex-col items-center space-y-2 mt-4">
            <h2 className="text-3xl tracking-tight text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
              Selamat Datang
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Akses portal penelitian Anda.
            </p>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-slate-900 cursor-pointer"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
              fill="#EA4335"
            />
          </svg>
          Masuk dengan Google
        </button>

        {/* Footer links & text */}
        <div className="flex flex-col items-center space-y-4 text-center mt-16">
          <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Butuh bantuan?
          </Link>
          <p className="text-[11px] leading-relaxed text-slate-500 max-w-[280px]">
            Dengan masuk, Anda menyetujui Ketentuan Institusi dan Kebijakan Privasi Penelitian StudyNote.
          </p>
        </div>
      </div>
    </div>
  )
}
