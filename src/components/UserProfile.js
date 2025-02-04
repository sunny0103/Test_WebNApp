'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function UserProfile() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState(null)

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.user_metadata.avatar_url} alt="프로필" />
          <AvatarFallback>
            {user.user_metadata.name?.slice(0, 2) || '사용자'}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user.user_metadata.name}</span>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleSignOut}
      >
        로그아웃
      </Button>
    </div>
  )
} 