'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import Navigation from "@/components/Navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [totalSales, setTotalSales] = useState(0)
  const [recentPurchases, setRecentPurchases] = useState([])
  const [monthlyUsers, setMonthlyUsers] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [averageMonthlyRevenue, setAverageMonthlyRevenue] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      try {
        // 사용자 데이터 조회
        const { data: usersData } = await supabase
          .from('profiles')
          .select('*')
        setUsers(usersData || [])

        // 총 매출 조회 (status가 completed인 구매만)
        const { data: salesData } = await supabase
          .from('purchases')
          .select('amount')
          .eq('status', 'completed')
        const total = salesData?.reduce((sum, purchase) => sum + purchase.amount, 0) || 0
        setTotalSales(total)

        // 최근 구매 내역 조회
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (purchasesError) {
          console.error('구매 내역 조회 오류:', purchasesError)
          return
        }

        if (!purchasesData || purchasesData.length === 0) {
          setRecentPurchases([])
          return
        }

        // 구매 내역의 사용자 ID로 프로필 정보 조회
        const userIds = purchasesData.map(purchase => purchase.user_id).filter(Boolean)
        
        if (userIds.length === 0) {
          setRecentPurchases(purchasesData)
          return
        }

        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, email')
          .in('id', userIds)

        // 구매 내역에 프로필 정보 매핑
        const purchasesWithProfiles = purchasesData.map(purchase => ({
          ...purchase,
          profile: profilesData?.find(profile => profile?.id === purchase.user_id) || null
        }))
        
        setRecentPurchases(purchasesWithProfiles)

        // 이번 달 신규 가입자 수 계산
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
        
        const { data: newUsersData } = await supabase
          .from('purchases')
          .select('amount, created_at')
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd)
        
        setMonthlyUsers(newUsersData?.length || 0)

        // 월별 매출 데이터 조회
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()
        
        const { data: monthlyData } = await supabase
          .from('purchases')
          .select('amount, created_at')
          .eq('status', 'completed')
          .gte('created_at', sixMonthsAgo)
        
        // 월별 매출 데이터 가공
        const monthlyStats = {}
        monthlyData?.forEach(purchase => {
          const date = new Date(purchase.created_at)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + purchase.amount
        })

        // 월 평균 매출 계산
        const monthlyValues = Object.values(monthlyStats)
        const average = monthlyValues.length > 0
          ? Math.round(monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length)
          : 0
        setAverageMonthlyRevenue(average)

        // 차트 데이터 형식으로 변환
        const chartData = Object.entries(monthlyStats)
          .map(([month, amount]) => ({
            month,  // YYYY-MM 형식
            amount: amount
          }))
          .sort((a, b) => a.month.localeCompare(b.month))

        setMonthlyRevenue(chartData)
      } catch (error) {
        console.error('데이터 조회 오류:', error)
      }
    }

    fetchData()
  }, [])

  const handleCancelPurchase = async (purchaseId) => {
    try {
      // purchases 테이블의 status를 'cancelled'로 업데이트
      const { error } = await supabase
        .from('purchases')
        .update({ status: 'cancelled' })
        .eq('id', purchaseId)

      if (error) {
        console.error('구매 취소 오류:', error)
        return
      }

      // 성공적으로 업데이트된 경우, UI 업데이트
      setRecentPurchases(prevPurchases =>
        prevPurchases.map(purchase =>
          purchase.id === purchaseId
            ? { ...purchase, status: 'cancelled' }
            : purchase
        )
      )
    } catch (error) {
      console.error('구매 취소 중 오류 발생:', error)
    }
  }

  return (
    <main className="flex flex-col row-start-2 items-center w-full gap-2 lg:gap-8 lg:max-w-3xl mx-auto px-2 pt-2">
      <div className="flex justify-between w-full">
        <h1 className="text-2xl font-bold">관리자 페이지</h1>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">총 매출액</h3>
          <p className="text-2xl font-bold">{totalSales.toLocaleString()}원</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">총 사용자 수</h3>
          <p className="text-2xl font-bold">{users.length}명</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">이번 달 신규 가입자</h3>
          <p className="text-2xl font-bold">{monthlyUsers}명</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">월 평균 매출</h3>
          <p className="text-2xl font-bold">{averageMonthlyRevenue.toLocaleString()}원</p>
        </Card>
      </div>

      <Card className="w-full p-6">
        <h2 className="text-xl font-semibold mb-4">최근 구매 내역</h2>
        <div className="space-y-4">
          {recentPurchases.map((purchase) => (
            <div key={purchase.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{purchase.profile?.username || '이름 없음'}</p>
                  <p className="text-sm text-muted-foreground">{purchase.profile?.email || '이메일 없음'}</p>
                  <p className="text-sm text-muted-foreground">
                    결제상태: <span className={purchase.status === 'cancelled' ? 'text-red-500' : ''}>{purchase.status}</span>
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="font-medium">{purchase.amount?.toLocaleString()}원</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(purchase.created_at).toLocaleDateString()}
                  </p>
                  {purchase.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelPurchase(purchase.id)}
                      className="mt-2 px-3 py-1 text-sm text-red-500 border border-red-500 rounded hover:bg-red-50"
                    >
                      주문 취소
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="w-full p-6">
        <h2 className="text-xl font-semibold mb-4">사용자 목록</h2>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="border p-4 rounded-lg">
              <p>이메일: {user.email}</p>
              <p>이름: {user.full_name}</p>
              <p>가입일: {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="w-full p-6">
        <h2 className="text-xl font-semibold mb-4">월 매출</h2>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={monthlyRevenue}
              layout="vertical"
              margin={{ right: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="month"
                width={120}
              />
              <Tooltip
                formatter={(value) => `${value.toLocaleString()}원`}
                labelFormatter={(label) => `${label}`}
              />
              <Bar 
                dataKey="amount" 
                fill="#8884d8"
                label={{
                  position: 'right',
                  formatter: (value) => `${value.toLocaleString()}원`
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </main>
  )
} 