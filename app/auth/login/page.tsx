import { LoginForm } from "@/components/login-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl: string }>;
}) {
  const { returnUrl } = await searchParams;
  console.log(`debug:returnUrl`, returnUrl);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm returnUrl={returnUrl} />
      </div>
    </div>
  );
}
