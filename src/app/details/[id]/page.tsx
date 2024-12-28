import { ReviewForm } from "~/components/ReviewForm";

const EditReviewPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  return <ReviewForm id={+(await params).id} />;
};

export default EditReviewPage;
