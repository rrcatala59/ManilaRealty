import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getAdminOrNull } from "@/src/lib/auth-guard";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import { safeAdminPath } from "@/src/lib/supabase/auth-config";

export const metadata = {
  title: "Advisor login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const afterLogin = safeAdminPath(next);
  if (await getAdminOrNull()) redirect(afterLogin);

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-20">
      <div className="w-full max-w-md border border-border bg-card p-8">
        <p className="font-heading text-center text-3xl tracking-[0.2em]">BRISA</p>
        <h1 className="font-heading mt-6 text-center text-4xl">Advisor login</h1>
        <p className="mt-2 mb-8 text-center text-sm text-muted-foreground">
          The studio is for Brisa administrators only.
        </p>
        <LoginForm next={afterLogin} usesSupabaseAuth={isSupabaseConfigured()} />
      </div>
    </div>
  );
}
