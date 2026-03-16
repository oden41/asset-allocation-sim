import { useTranslations } from "next-intl";
import SimulationPanel from "@/components/SimulationPanel";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">{t("title")}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      <SimulationPanel />
    </main>
  );
}
