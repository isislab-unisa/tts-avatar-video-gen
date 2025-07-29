import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
      <div className="flex items-center gap-8 lg:gap-16">
        <div className="w-full max-w-xs">
          <LoginForm />
        </div>

        <div className="relative w-[440px] h-[440px] hidden lg:block">
          <Image
            src="/cody.png"
            alt="Robot"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </main>
  );
}
