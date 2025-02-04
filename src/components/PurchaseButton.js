'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { courseConfig, formatPrice } from '@/components/Course'
import * as PortOne from "@portone/browser-sdk/v2"

export default function PurchaseButton({ courseId }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      const paymentData = await PortOne.requestPayment({
        storeId: "Your store-ID",
        channelKey: "Your channel-key",
        paymentId: `payment-${crypto.randomUUID()}`,
        orderName: courseConfig.title,
        totalAmount: courseConfig.discountPrice,
        currency: "KRW",
        payMethod: "CARD",
        pgProvider: "PG Provider",
        customer: {
          customerId: user.id,
          fullName: user.user_metadata.name || '구매자',
          email: user.email
        },
        redirectUrl: `${window.location.origin}/api/payment/complete`
      });

      // 결제 상태 확인 로직 수정
      if (paymentData && paymentData.transactionType === 'PAYMENT') {
        // 결제 완료 후 리다이렉트 URL로 이동하도록 수정
        window.location.href = `${window.location.origin}/api/payment/complete?paymentId=${paymentData.paymentId}`
      } else {
        console.error('결제 응답:', paymentData)
        throw new Error('결제가 완료되지 않았습니다.')
      }
      
    } catch (error) {
      console.error('구매 오류:', error)
      alert(error.message || '구매 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 px-4 mx-auto max-w-3xl z-30">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">총 결제 금액</span>
          <span className="text-xl font-bold">
            {courseConfig.currency}{formatPrice(courseConfig.discountPrice)}원
          </span>
        </div>
        <Button 
          onClick={handlePurchase} 
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-3 text-lg"
        >
          {loading ? '처리중...' : '지금 구매하기'}
        </Button>
      </div>
    </div>
  )
}
