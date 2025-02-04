"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import UserProfile from './UserProfile'

export default function Navigation({ isAdmin }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleTabChange = (value) => {
    if (value === 'management' && isAdmin) {
      router.push('/admin')
    } else if (value === 'products') {
      router.push('/')
    }
  }

  // 현재 경로에 따라 기본 탭 값 설정
  const defaultTab = pathname.includes('/admin') ? 'management' : 'products'

  return (
    <div className="w-full">
      <Tabs defaultValue={defaultTab} className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">상품</TabsTrigger>
          {isAdmin ? (
            <TabsTrigger value="management">관리</TabsTrigger>
          ) : (
            <div className="flex justify-end items-center px-4">
              {user && <UserProfile />}
            </div>
          )}
        </TabsList>
      </Tabs>
    </div>
  )
} 