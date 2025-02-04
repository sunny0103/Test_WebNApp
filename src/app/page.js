'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs' 
import Navigation from "@/components/Navigation"
import { Card } from "@/components/ui/card"
import { courseContent } from '@/components/CourseContent'
import Markdown from '@/components/Markdown'
import HeroSection from "@/components/HeroSection"
import KakaoLoginButton from "@/components/KakaoLoginButton"
import PurchaseButton from '@/components/PurchaseButton'
import { courseConfig, formatPrice } from '@/components/Course'
import { useState, useEffect } from 'react'

export default function Home() {
  const supabase = createClientComponentClient()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setIsAdmin(profile?.is_admin || false)
      }
    }
    checkAdmin()
  }, [])

  return (
    <main className="flex flex-col row-start-2 items-center w-full gap-2 lg:gap-8 lg:max-w-3xl mx-auto px-2 pt-2">


      {/* Hero Section */}
      <HeroSection />
      
      {/* 상세페이지 */}
      <Card className="w-full px-6 pb-36">
        <Markdown content={courseContent} />
      </Card>
      <PurchaseButton 
        courseId={courseConfig.id}
      />
    </main>
  );
}
