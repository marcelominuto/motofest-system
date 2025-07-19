"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    // Remove o cookie em todos os paths possíveis
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Strict";
    document.cookie = "auth_token=; path=/admin; max-age=0; SameSite=Strict";
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace("/login");
  }, [router]);
  return null;
}
