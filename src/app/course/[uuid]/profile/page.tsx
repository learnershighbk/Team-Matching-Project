// Student 프로필 입력 페이지
// TODO: 실제 프로필 폼 구현 필요

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="text-muted-foreground mt-4">
        프로필 입력 페이지 (구현 예정)
      </p>
      <p className="text-sm text-muted-foreground">
        Course UUID: {uuid}
      </p>
    </div>
  );
}

