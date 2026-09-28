import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/admin/Controls";
import { Logo } from "@/components/Icons";
import { isAuthenticated } from "@/lib/auth";
import { login } from "../actions";

export const metadata: Metadata = { title: "Admin нэвтрэх", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/st-admin/login">) {
  if (await isAuthenticated()) redirect("/st-admin");
  const { error } = await searchParams;

  return (
    <main className="login">
      <form action={login} className="login-card">
        <div className="logo">
          <Logo height={26} /> <span className="a-tag">Admin</span>
        </div>
        {error && (
          <p className="a-alert" role="alert">
            {String(error)}
          </p>
        )}
        <div className="field">
          <label htmlFor="username">Нэвтрэх нэр</label>
          <input id="username" name="username" autoComplete="username" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="password">Нууц үг</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <SubmitButton className="btn lg full">Нэвтрэх</SubmitButton>
      </form>
    </main>
  );
}
