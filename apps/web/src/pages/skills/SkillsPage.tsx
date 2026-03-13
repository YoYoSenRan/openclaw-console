import { useTranslation } from "react-i18next";

export default function SkillsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t("skills.title")}</h2>
      <p className="text-muted-foreground">{t("skills.description")}</p>
    </div>
  );
}
