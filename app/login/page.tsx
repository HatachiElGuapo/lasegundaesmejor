import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Entrar — La Segunda Es Mejor",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / marca */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl text-ink tracking-widest uppercase">
            La Segunda
          </h1>
          <p className="text-sm text-muted mt-1 tracking-wide">
            Acceso a tu cuenta
          </p>
        </div>

        <div className="bg-surface border border-border rounded p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
