import { useTranslation } from "react-i18next";

export default function SessionsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t("sessions.title")}</h2>
      <p className="text-muted-foreground">{t("sessions.description")}</p>
    </div>
  );
}
