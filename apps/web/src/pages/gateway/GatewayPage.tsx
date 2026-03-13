import { useTranslation } from "react-i18next";

export default function GatewayPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t("gateway.title")}</h2>
      <p className="text-muted-foreground">{t("gateway.description")}</p>
    </div>
  );
}
