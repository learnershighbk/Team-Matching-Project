'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInstructorLogin } from '@/features/auth/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export default function InstructorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');

  const { mutate: login, isPending } = useInstructorLogin();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({ title: '오류', description: '이메일을 입력해주세요', variant: 'destructive' });
      return;
    }
    if (pin.length !== 4) {
      toast({ title: '오류', description: 'PIN은 4자리 숫자여야 합니다', variant: 'destructive' });
      return;
    }

    login(
      { email, pin },
      {
        onError: (error) => {
          toast({
            title: '로그인 실패',
            description: error.message || '이메일 또는 PIN이 올바르지 않습니다',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">TeamMatch Instructor</CardTitle>
          <CardDescription className="text-center">
            교수자 계정으로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="instructor@kdischool.ac.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN (4자리)</Label>
              <Input
                id="pin"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="••••"
                value={pin}
                onChange={handlePinChange}
                disabled={isPending}
                className="text-center tracking-[0.5em] text-lg"
                maxLength={4}
              />
              <p className="text-xs text-muted-foreground">
                관리자로부터 발급받은 4자리 PIN을 입력하세요
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || pin.length !== 4}
            >
              {isPending ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => router.push('/')}
              className="text-sm text-muted-foreground"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


