import { AssetLibrary } from "@/components/assets/asset-library";
import { listAssets } from "@/lib/studio/repository";

export default async function AssetsPage() {
  const { assets, campaigns, mode, shots } = await listAssets();

  return <AssetLibrary assets={assets} campaigns={campaigns} mode={mode} shots={shots} />;
}
