import { private_api_call } from "@/actions/parivate_api_calll";
import { PostAnalytics } from "./AnalyticsPage";

export const getAnalyticsData = async () => {
    const response = await private_api_call({
      path: "facebook/analytics",
      method: "GET",
    });
    console.log("Response from getAnalyticsData:", response);
    if (response.success) {
        return response.data as PostAnalytics[];
    } else {
        console.error("Failed to fetch analytics data:", response.message);
        return [];
    }
};

interface CommentInsight {
  id: number;
  analytics_id: number;
  platform_user_id: string | null;
  platform_comment_id: string;
  user_name: string;
  message_summary: string;
  sentiment: "positive" | "neutral" | "negative";
  priority: "low" | "medium" | "high";
  created_at: string;
  message: string | null;
  created_time: string;
}

export interface PostAnalyticsDetails {
  id: number;
  post_id: number | null;
  platform_post_id: string;
  platform_name: string;
  total_reactions: number;
  total_shares: number;
  total_comments: number;
  performance_label: string;
  description: string;
  response_summary: string;
  sentiment_summary: string;
  marketing_suggestions: string;
  content_recommendations: string;
  comment_insights: CommentInsight[];
}
export const getFacebookAnalyticsById = async (
  id: string,
): Promise<PostAnalyticsDetails | null> => {
  const response = await private_api_call({
    path: `facebook/analytics/${id}`,
    method: "GET",
  });
  console.log("Response from getFacebookAnalyticsById:", response);
  if (response.success) {
    return response.data as PostAnalyticsDetails;
  } else {
    console.error("Failed to fetch analytics data:", response.message);
    return null;
  }
};
    
