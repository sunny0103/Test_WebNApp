'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
export default function AdminLayout({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        redirect('/')
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        redirect('/')
      }

      setIsAdmin(true)
      setLoading(false)
    }

    checkAdmin()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩중...</div>
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
} 