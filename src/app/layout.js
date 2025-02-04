'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Navigation from '@/components/Navigation'
import KakaoLoginButton from "@/components/KakaoLoginButton"
import { useState, useEffect } from 'react'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({ children }) {
  const supabase = createClientComponentClient()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        setIsAdmin(profile?.role === 'admin')
      }
    }
    checkAdmin()
  }, [])

  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex flex-col items-center w-full gap-2 lg:gap-8 lg:max-w-3xl mx-auto px-2 pt-2">
          <div className="flex justify-between w-full">
            <h1 className="text-2xl font-bold">Web & APP Course</h1>
            <KakaoLoginButton />
          </div>
          <div className="sticky top-0 w-full bg-background z-50">
            <Navigation isAdmin={isAdmin} />
          </div>
        </div>
        {children}
      </body>
    </html>
  )
}