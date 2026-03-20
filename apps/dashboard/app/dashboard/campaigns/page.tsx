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

  return (
    <CampaignTable
      campaigns={campaigns}
      mode={mode}
      openCreateOnLoad={openCreateOnLoad}
      persistenceEnabled={isStudioPersistenceEnabled()}
    />
  );
}
