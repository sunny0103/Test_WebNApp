import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { courseConfig, formatPrice } from '@/components/Course'

const HeroSection = () => {
  return (
    <Card className="relative w-full h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-black/50 z-[1]" />
      <Image
        className="object-cover"
        src="/hero-image.jpg"
        alt="hero background"
        fill
      />
      <CardHeader className="relative z-10 h-full flex flex-col justify-center items-center text-white pt-6">
        <CardTitle className="text-3xl md:text-4xl font-bold mb-3">
          Next.js 14 + supabase + Cursor AI를 활용한 풀스택 개발코스
        </CardTitle>
        <CardDescription className="text-base md:text-lg mb-4 text-left max-w-2xl text-white">
          이제는 당신이 AI툴과 함께 원하는 아이디어를 직접 만들어 보세요.
          <CardTitle className="text-base mt-3 text-left">✨ 이런 분들께 추천드립니다</CardTitle>
          <CardContent className="space-y-2 text-left p-2">
            <ul className="text-sm space-y-1">
              <li>💻 웹 개발을 처음부터 체계적으로 배우고 싶으신 분</li>
              <li>🤖 AI 도구를 활용한 개발 방법을 익히고 싶으신 분</li>
              <li>🚀 실제 서비스를 만들어보고 싶으신 분</li>
            </ul>
            <Card className="bg-black/20 border-none">
              <CardContent className="p-1">
                <p className="text-xs text-center text-white">총 40시간 강의 | 실습 프로젝트 포함 | 무제한 수강</p>
              </CardContent>
            </Card>
          </CardContent>
        </CardDescription>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              {courseConfig.discountPercent}% 할인
            </Badge>
            <span className="text-lg line-through text-gray-400">
              {courseConfig.currency}{formatPrice(courseConfig.originalPrice)}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {courseConfig.currency}{formatPrice(courseConfig.discountPrice)}
          </div>
        </div>
        <Button className="bg-white text-black px-8 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-base">
          자세히 보기
        </Button>
      </CardHeader>
    </Card>
  );
};

export default HeroSection; 