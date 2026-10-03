"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "./I18nProvider";

// Goes back where the user came from (recommendations, cart…), or to the home page if there is no history.
export default function BackLink({ className = "" }: { className?: string }) {
  const { m } = useI18n();
  const router = useRouter();
  return (
    <button className={`text-sm text-ink-soft ${className}`} onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}>
      {m.product.back}
    </button>
  );
}
