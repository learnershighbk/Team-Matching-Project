// Student 인증 페이지
// TODO: 실제 인증 폼 구현 필요

export default async function CourseAuthPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-2xl font-bold">Course Access</h1>
        <p className="text-muted-foreground">
          학생 인증 페이지 (구현 예정)
        </p>
        <p className="text-sm text-muted-foreground">
          Course UUID: {uuid}
        </p>
      </div>
    </div>
  );
}

