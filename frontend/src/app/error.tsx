
"use client";

import GlobalErrorPage from "@/components/common/global_error_page";


export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);

  return (
    <GlobalErrorPage
      code="500"
      title="Something went wrong"
      description={error.message}
      primaryAction={{ label: "Try Again", onClick: reset }}
    />
  );
}
