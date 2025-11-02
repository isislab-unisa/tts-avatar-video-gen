import { redirect } from "next/navigation";
import { isDevMode } from "@/lib/dev-auth";
import { HeroSectionOne } from "@/components/HeroSectionOne";

export default function HomePage() {
  // In dev mode, redirect directly to dashboard
  if (isDevMode()) {
    redirect("/dashboard");
  }

  return (
    <main>
      <HeroSectionOne />
    </main>
  );
}
