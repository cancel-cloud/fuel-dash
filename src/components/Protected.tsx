// src/components/Protected.tsx
"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await account.get();       // requires active Appwrite session
        setOk(true);
      } catch {
        setOk(false);
        router.replace("/login");
      } finally {
        setReady(true);
      }
    })();
  }, [router]);

  if (!ready) return null;
  if (!ok) return null;
  return <>{children}</>;
}
