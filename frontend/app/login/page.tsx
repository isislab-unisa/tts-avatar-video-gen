import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
      <div className="flex items-center gap-x-8 lg:gap-x-16">
        <LoginForm />
        <div className="lg:flex items-center justify-center min-w-[400px] max-w-[400px] w-full hidden h-full">
          <Image
            src="/cody.png"
            alt="Robot"
            width={320}
            height={320}
            className="object-contain"
            priority
          />
        </div>

        {/* <div className="relative w-full max-w-[440px] h-[440px] hidden lg:block">
          <Image
            src="/cody.png"
            alt="Robot"
            fill
            className="object-contain"
            priority
          />
        </div> */}
      </div>
    </main>
  );
}
