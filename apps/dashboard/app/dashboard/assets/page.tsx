import { AssetLibrary } from "@/components/assets/asset-library";
import { listAssets } from "@/lib/studio/repository";

export default async function AssetsPage() {
  const { assets, campaigns, handoffPackages, mode, shots, versionGroups } = await listAssets();

  return (
    <AssetLibrary
      assets={assets}
      campaigns={campaigns}
      handoffPackages={handoffPackages}
      mode={mode}
      shots={shots}
      versionGroups={versionGroups}
    />
  );
}
