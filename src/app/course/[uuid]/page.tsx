'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCourseStatus } from '@/features/course/hooks/useCourse';
import { useStudentAuth } from '@/features/auth/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

type Step = 'studentNumber' | 'pin' | 'newPin';

export default function StudentAuthPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const [step, setStep] = useState<Step>('studentNumber');
  const [studentNumber, setStudentNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const { data: course, isLoading: courseLoading, error: courseError } = useCourseStatus(uuid);
  const { mutate: auth, isPending } = useStudentAuth();

  const getDaysRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleStudentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setStudentNumber(value);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setter(value);
  };

  const handleStudentNumberSubmit = () => {
    if (studentNumber.length !== 9) {
      toast({ title: '오류', description: '학번은 9자리 숫자여야 합니다', variant: 'destructive' });
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      toast({ title: '오류', description: 'PIN은 4자리 숫자여야 합니다', variant: 'destructive' });
      return;
    }

    auth(
      { courseId: uuid, studentNumber, pin, isNewUser: false },
      {
        onSuccess: (data) => {
          if (data?.courseStatus === 'CONFIRMED') {
            router.push(`/course/${uuid}/team`);
          } else if (data?.courseStatus === 'LOCKED') {
            router.push(`/course/${uuid}/waiting`);
          } else {
            router.push(`/course/${uuid}/profile`);
          }
        },
        onError: (error) => {
          if (error.message?.includes('학번') || error.message?.includes('등록')) {
            setIsNewUser(true);
            setStep('newPin');
            setPin('');
          } else {
            toast({
              title: '로그인 실패',
              description: error.message || 'PIN이 올바르지 않습니다',
              variant: 'destructive',
            });
          }
        },
      }
    );
  };

  const handleNewPinSubmit = () => {
    if (pin.length !== 4) {
      toast({ title: '오류', description: 'PIN은 4자리 숫자여야 합니다', variant: 'destructive' });
      return;
    }
    if (pin !== confirmPin) {
      toast({ title: '오류', description: 'PIN이 일치하지 않습니다', variant: 'destructive' });
      return;
    }

    auth(
      { courseId: uuid, studentNumber, pin, isNewUser: true },
      {
        onSuccess: () => {
          toast({ title: '등록 완료', description: '프로필을 입력해주세요' });
          router.push(`/course/${uuid}/profile`);
        },
        onError: (error) => {
          toast({
            title: '등록 실패',
            description: error.message || '등록에 실패했습니다',
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">코스 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">코스를 찾을 수 없습니다</CardTitle>
            <CardDescription className="text-center">
              유효하지 않은 코스 링크입니다. 교수자에게 문의해주세요.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(course.deadline);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Badge variant={course.status === 'OPEN' ? 'default' : 'secondary'}>
              {course.status === 'OPEN' ? '입력 가능' : course.status === 'LOCKED' ? '마감됨' : '팀 확정'}
            </Badge>
            {course.status === 'OPEN' && daysRemaining > 0 && (
              <span className="text-sm font-medium text-orange-600">
                D-{daysRemaining}
              </span>
            )}
          </div>
          <CardTitle className="text-xl">{course.courseName}</CardTitle>
          <CardDescription>
            코스 코드: {course.courseCode}
          </CardDescription>
          <p className="text-sm text-muted-foreground">
            마감일: {new Date(course.deadline).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </CardHeader>

        <CardContent>
          {step === 'studentNumber' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentNumber">학번 (9자리)</Label>
                <Input
                  id="studentNumber"
                  type="text"
                  inputMode="numeric"
                  placeholder="202500001"
                  value={studentNumber}
                  onChange={handleStudentNumberChange}
                  className="text-center tracking-widest text-lg"
                  maxLength={9}
                />
              </div>
              <Button
                onClick={handleStudentNumberSubmit}
                className="w-full"
                disabled={studentNumber.length !== 9}
              >
                다음
              </Button>
            </div>
          )}

          {step === 'pin' && !isNewUser && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-center mb-4">
                <p className="text-sm text-muted-foreground">학번</p>
                <p className="font-medium">{studentNumber}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN (4자리)</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => handlePinChange(e, setPin)}
                  className="text-center tracking-[0.5em] text-lg"
                  maxLength={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('studentNumber');
                    setPin('');
                  }}
                  className="flex-1"
                >
                  이전
                </Button>
                <Button
                  onClick={handlePinSubmit}
                  className="flex-1"
                  disabled={isPending || pin.length !== 4}
                >
                  {isPending ? '확인 중...' : '로그인'}
                </Button>
              </div>
              <Button
                variant="link"
                onClick={() => {
                  setIsNewUser(true);
                  setStep('newPin');
                  setPin('');
                }}
                className="w-full text-sm"
              >
                처음 등록하시나요?
              </Button>
            </div>
          )}

          {step === 'newPin' && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-center mb-4">
                <p className="text-sm text-muted-foreground">학번</p>
                <p className="font-medium">{studentNumber}</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-sm text-blue-700">
                  처음 등록하시는 경우 사용할 PIN을 설정해주세요.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPin">새 PIN (4자리)</Label>
                <Input
                  id="newPin"
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => handlePinChange(e, setPin)}
                  className="text-center tracking-[0.5em] text-lg"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPin">PIN 확인</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => handlePinChange(e, setConfirmPin)}
                  className="text-center tracking-[0.5em] text-lg"
                  maxLength={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('studentNumber');
                    setPin('');
                    setConfirmPin('');
                    setIsNewUser(false);
                  }}
                  className="flex-1"
                >
                  이전
                </Button>
                <Button
                  onClick={handleNewPinSubmit}
                  className="flex-1"
                  disabled={isPending || pin.length !== 4 || confirmPin.length !== 4}
                >
                  {isPending ? '등록 중...' : '등록하기'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
