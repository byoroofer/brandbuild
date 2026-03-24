import { StudioControlCenter } from "@/components/settings/studio-control-center";
import { getStudioSystemAudit } from "@/lib/studio/system-audit";

export default function DashboardSettingsPage() {
  const audit = getStudioSystemAudit();

  return <StudioControlCenter audit={audit} />;
}
