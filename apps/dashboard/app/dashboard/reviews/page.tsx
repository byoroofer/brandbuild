import { ReviewsWorkbench } from "@/components/reviews/reviews-workbench";
import { getReviewsSummary } from "@/lib/studio/repository";

export default async function ReviewsPage() {
  const summary = await getReviewsSummary();

  return <ReviewsWorkbench summary={summary} />;
}
