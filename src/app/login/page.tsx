// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      // Do NOT call deleteSession() here when not logged in — it triggers unauthorized errors.
      await account.createEmailPasswordSession(email, password);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto py-16">
      <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <Label>Password</Label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "…" : "Login"}
        </Button>
      </form>
    </main>
  );
}
