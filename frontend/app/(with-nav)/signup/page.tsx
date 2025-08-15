import Image from "next/image";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
      <div className="flex items-center gap-8 lg:gap-16">
        <SignupForm />

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
      </div>
    </main>
  );
}
