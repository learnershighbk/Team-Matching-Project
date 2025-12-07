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
import { extractApiErrorCode } from '@/lib/remote/api-client';
import { AUTH_ERROR_CODES } from '@/lib/errors/codes';
import { Globe } from 'lucide-react';

type Step = 'studentNumber' | 'pin' | 'newPin';
type Language = 'ko' | 'en';

const translations = {
  ko: {
    error: '오류',
    studentNumberError: '학번은 9자리 숫자여야 합니다',
    pinError: 'PIN은 4자리 숫자여야 합니다',
    pinMismatch: 'PIN이 일치하지 않습니다',
    registrationError: '등록 오류',
    newUser: '새 사용자',
    newUserMessage: '처음 등록하시는 경우 PIN을 설정해주세요.',
    loginFailed: '로그인 실패',
    loginFailedMessage: '학번 또는 PIN이 올바르지 않습니다',
    registrationComplete: '등록 완료',
    registrationCompleteMessage: '프로필을 입력해주세요',
    registrationFailed: '등록 실패',
    registrationFailedMessage: '등록에 실패했습니다',
    loadingCourse: '코스 정보를 불러오는 중...',
    courseNotFound: '코스를 찾을 수 없습니다',
    invalidCourseLink: '유효하지 않은 코스 링크입니다. 교수자에게 문의해주세요.',
    inputAvailable: '입력 가능',
    closed: '마감됨',
    teamConfirmed: '팀 확정',
    deadline: '마감일:',
    studentNumber: '학번 (9자리)',
    next: '다음',
    pin: 'PIN (4자리)',
    previous: '이전',
    checking: '확인 중...',
    login: '로그인',
    firstTime: '처음 등록하시나요?',
    newPin: '새 PIN (4자리)',
    pinConfirm: 'PIN 확인',
    registering: '등록 중...',
    register: '등록하기',
    courseCode: '코스 코드:',
  },
  en: {
    error: 'Error',
    studentNumberError: 'Student number must be 9 digits',
    pinError: 'PIN must be 4 digits',
    pinMismatch: 'PINs do not match',
    registrationError: 'Registration Error',
    newUser: 'New User',
    newUserMessage: 'If this is your first time, please set your PIN.',
    loginFailed: 'Login Failed',
    loginFailedMessage: 'Student number or PIN is incorrect',
    registrationComplete: 'Registration Complete',
    registrationCompleteMessage: 'Please enter your profile',
    registrationFailed: 'Registration Failed',
    registrationFailedMessage: 'Registration failed',
    loadingCourse: 'Loading course information...',
    courseNotFound: 'Course not found',
    invalidCourseLink: 'Invalid course link. Please contact your instructor.',
    inputAvailable: 'Input Available',
    closed: 'Closed',
    teamConfirmed: 'Team Confirmed',
    deadline: 'Deadline:',
    studentNumber: 'Student Number (9 digits)',
    next: 'Next',
    pin: 'PIN (4 digits)',
    previous: 'Previous',
    checking: 'Checking...',
    login: 'Login',
    firstTime: 'First time registering?',
    newPin: 'New PIN (4 digits)',
    pinConfirm: 'Confirm PIN',
    registering: 'Registering...',
    register: 'Register',
    courseCode: 'Course Code:',
  },
};

export default function StudentAuthPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const [language, setLanguage] = useState<Language>('ko');
  const [step, setStep] = useState<Step>('studentNumber');
  const [studentNumber, setStudentNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  
  const t = translations[language];
  const locale = language === 'ko' ? 'ko-KR' : 'en-US';

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
      toast({ title: t.error, description: t.studentNumberError, variant: 'destructive' });
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      toast({ title: t.error, description: t.pinError, variant: 'destructive' });
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
          const errorMessage = error.message || '';
          const errorCode = extractApiErrorCode(error);
          
          // "이미 등록된 학번" 에러는 명확하게 toast로 표시
          // AUTH_003 코드이고 메시지에 "이미 등록된 학번"이 포함된 경우
          if (errorCode === AUTH_ERROR_CODES.AUTH_FAILED && errorMessage.includes('이미 등록된 학번')) {
            toast({
              title: t.registrationError,
              description: errorMessage,
              variant: 'destructive',
            });
            // PIN 입력 단계로 돌아가기
            setStep('pin');
            setPin('');
          } else if (errorMessage.includes('학번을 찾을 수 없습니다') || errorMessage.includes('존재하지 않는')) {
            // 학번이 없는 경우 새 유저 플로우로 전환
            setIsNewUser(true);
            setStep('newPin');
            setPin('');
            toast({
              title: t.newUser,
              description: t.newUserMessage,
            });
          } else {
            // "학번 또는 PIN이 올바르지 않습니다" 에러 및 기타 에러 처리
            // 학번이 존재하지 않거나 PIN이 틀린 경우 모두 이 메시지가 반환됨
            toast({
              title: t.loginFailed,
              description: errorMessage || t.loginFailedMessage,
              variant: 'destructive',
            });
          }
        },
      }
    );
  };

  const handleNewPinSubmit = () => {
    if (pin.length !== 4) {
      toast({ title: t.error, description: t.pinError, variant: 'destructive' });
      return;
    }
    if (pin !== confirmPin) {
      toast({ title: t.error, description: t.pinMismatch, variant: 'destructive' });
      return;
    }

    auth(
      { courseId: uuid, studentNumber, pin, isNewUser: true },
      {
        onSuccess: () => {
          toast({ title: t.registrationComplete, description: t.registrationCompleteMessage });
          router.push(`/course/${uuid}/profile`);
        },
        onError: (error) => {
          const errorMessage = error.message || t.registrationFailedMessage;
          toast({
            title: t.registrationFailed,
            description: errorMessage,
            variant: 'destructive',
          });
          // 에러 발생 시 PIN 입력 단계로 돌아가기
          setStep('newPin');
        },
      }
    );
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t.loadingCourse}</p>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">{t.courseNotFound}</CardTitle>
            <CardDescription className="text-center">
              {t.invalidCourseLink}
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
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
              className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-70 text-muted-foreground"
              title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
            >
              <Globe className="w-4 h-4" />
              {language === 'ko' ? 'EN' : '한'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant={course.status === 'OPEN' ? 'default' : 'secondary'}>
              {course.status === 'OPEN' ? t.inputAvailable : course.status === 'LOCKED' ? t.closed : t.teamConfirmed}
            </Badge>
            {course.status === 'OPEN' && daysRemaining > 0 && (
              <span className="text-sm font-medium text-orange-600">
                D-{daysRemaining}
              </span>
            )}
          </div>
          <CardTitle className="text-xl">{course.courseName}</CardTitle>
          <CardDescription>
            {t.courseCode} {course.courseCode}
          </CardDescription>
          <p className="text-sm text-muted-foreground">
            {t.deadline} {new Date(course.deadline).toLocaleDateString(locale, {
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
                <Label htmlFor="studentNumber">{t.studentNumber}</Label>
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
                {t.next}
              </Button>
            </div>
          )}

          {step === 'pin' && !isNewUser && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-center mb-4">
                <p className="text-sm text-muted-foreground">{t.studentNumber.split(' ')[0]}</p>
                <p className="font-medium">{studentNumber}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">{t.pin}</Label>
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
                  {t.previous}
                </Button>
                <Button
                  onClick={handlePinSubmit}
                  className="flex-1"
                  disabled={isPending || pin.length !== 4}
                >
                  {isPending ? t.checking : t.login}
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
                {t.firstTime}
              </Button>
            </div>
          )}

          {step === 'newPin' && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-center mb-4">
                <p className="text-sm text-muted-foreground">{t.studentNumber.split(' ')[0]}</p>
                <p className="font-medium">{studentNumber}</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-sm text-blue-700">
                  {t.newUserMessage}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPin">{t.newPin}</Label>
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
                <Label htmlFor="confirmPin">{t.pinConfirm}</Label>
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
                  {t.previous}
                </Button>
                <Button
                  onClick={handleNewPinSubmit}
                  className="flex-1"
                  disabled={isPending || pin.length !== 4 || confirmPin.length !== 4}
                >
                  {isPending ? t.registering : t.register}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
