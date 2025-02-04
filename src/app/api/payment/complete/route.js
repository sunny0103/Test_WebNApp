import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { courseConfig } from '@/components/Course'



// 결제 처리를 위한 POST 라우터
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    
    if (!paymentId) {
      return NextResponse.json(
        { error: '결제 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      )
    }

    // 결제 정보 저장 (API 호출 제거)
    const { data, error: insertError } = await supabase
      .from('purchases')
      .insert({ 
        payment_id: paymentId,
        status: 'completed',
        user_id: user.id,
        amount: courseConfig.discountPrice,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      throw new Error('구매 정보 저장 중 오류가 발생했습니다: ' + insertError.message)
    }

    return NextResponse.json({ 
      success: true,
      message: '결제가 성공적으로 처리되었습니다.',
      data
    })

  } catch (error) {
    console.error('결제 처리 오류:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '결제 처리 중 오류가 발생했습니다: ' + error.message 
      },
      { status: 500 }
    )
  }
}