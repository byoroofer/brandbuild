import { CampaignTable } from "@/components/campaigns/campaign-table";
import {
  isStudioPersistenceEnabled,
  listCampaigns,
} from "@/lib/studio/repository";
import { getSearchParamValue } from "@/lib/utils";

type CampaignsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  const resolvedSearchParams = await searchParams;
  const { campaigns, mode } = await listCampaigns();
  const openCreateOnLoad = getSearchParamValue(resolvedSearchParams.compose) === "new";
  const persistenceEnabled = mode === "live" && isStudioPersistenceEnabled();
  const persistenceMessage = persistenceEnabled
    ? null
    : mode === "demo"
      ? "BrandBuild is in demo/setup mode because the live Supabase schema is not available here yet. Apply the migrations to enable real campaign creation."
      : "Connect Supabase persistence before campaign creation is enabled.";

  return (
    <CampaignTable
      campaigns={campaigns}
      mode={mode}
      openCreateOnLoad={openCreateOnLoad}
      persistenceEnabled={persistenceEnabled}
      persistenceMessage={persistenceMessage}
    />
  );
}
