"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <div className="flex gap-1 text-sm">
      <button
        onClick={() => switchLocale("ja")}
        className={`rounded px-2 py-1 transition ${
          locale === "ja"
            ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        JA
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={`rounded px-2 py-1 transition ${
          locale === "en"
            ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        EN
      </button>
    </div>
  );
}
