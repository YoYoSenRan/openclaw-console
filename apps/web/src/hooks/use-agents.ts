import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { agentsApi } from "@/apis/agents";

const AGENTS_KEY = ["agents"] as const;

export function useAgentList() {
  return useQuery({
    queryKey: AGENTS_KEY,
    queryFn: () => agentsApi.list(),
  });
}

export function useAgentSync() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => agentsApi.sync(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: AGENTS_KEY });
      toast.success(
        t("agents.syncSuccess", { upserted: result.upserted, skipped: result.skipped }),
      );
    },
    onError: () => {
      toast.error(t("agents.syncError"));
    },
  });
}
