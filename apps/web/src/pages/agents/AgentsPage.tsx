import { useTranslation } from "react-i18next";

export default function AgentsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t("agents.title")}</h2>
      <p className="text-muted-foreground">{t("agents.description")}</p>
    </div>
  );
}
