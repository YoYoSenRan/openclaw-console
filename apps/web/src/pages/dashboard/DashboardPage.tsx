import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t("dashboard.title")}</h2>
      <p className="text-muted-foreground">{t("dashboard.welcome")}</p>
    </div>
  );
}
