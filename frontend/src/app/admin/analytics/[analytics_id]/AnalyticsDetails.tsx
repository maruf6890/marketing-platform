import {
  BarChart3,
  Heart,
  MessageCircle,
  Share2,
  Lightbulb,
  TrendingUp,
  FileText,
  Clock,
} from "lucide-react";

import { PostAnalyticsDetails } from "../action";



export default function AnalyticsDetails({ data }: { data: PostAnalyticsDetails }) {
  const badgeColor = {
    positive:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    neutral:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    negative: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  const priorityColor = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-orange-100 text-orange-700",
    high: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Post Analytics</h2>

            <p className="text-sm text-gray-500 mt-1">{data.platform_name}</p>

            <p className="text-xs text-gray-400 mt-1 break-all">
              {data.platform_post_id}
            </p>
          </div>

          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              data.performance_label === "poor"
                ? "bg-red-100 text-red-700"
                : data.performance_label === "average"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
            }`}
          >
            {data.performance_label.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-5 bg-white">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5" />
            <span>Reactions</span>
          </div>

          <h2 className="text-3xl font-bold mt-3">{data.total_reactions}</h2>
        </div>

        <div className="rounded-xl border p-5 bg-white">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5" />
            <span>Comments</span>
          </div>

          <h2 className="text-3xl font-bold mt-3">{data.total_comments}</h2>
        </div>

        <div className="rounded-xl border p-5 bg-white">
          <div className="flex items-center gap-3">
            <Share2 className="h-5 w-5" />
            <span>Shares</span>
          </div>

          <h2 className="text-3xl font-bold mt-3">{data.total_shares}</h2>
        </div>
      </div>

      {/* Description */}

      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center gap-2 font-semibold mb-3">
          <FileText className="h-5 w-5" />
          Post Description
        </div>

        <p className="whitespace-pre-line text-gray-700">{data.description}</p>
      </div>

      {/* AI Summary */}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center gap-2 font-semibold mb-3">
            <BarChart3 className="h-5 w-5" />
            Response Summary
          </div>

          <p className="text-gray-700">{data.response_summary}</p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center gap-2 font-semibold mb-3">
            <TrendingUp className="h-5 w-5" />
            Sentiment Summary
          </div>

          <p className="text-gray-700">{data.sentiment_summary}</p>
        </div>
      </div>

      {/* Suggestions */}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center gap-2 font-semibold mb-3">
            <Lightbulb className="h-5 w-5" />
            Marketing Suggestions
          </div>

          <div className="whitespace-pre-line text-gray-700">
            {data.marketing_suggestions}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center gap-2 font-semibold mb-3">
            <Lightbulb className="h-5 w-5" />
            Content Recommendations
          </div>

          <div className="whitespace-pre-line text-gray-700">
            {data.content_recommendations}
          </div>
        </div>
      </div>

      {/* Comments */}

      <div className="rounded-xl border bg-white p-6">
        <h3 className="text-xl font-semibold mb-5">Comment Insights</h3>

        <div className="space-y-4">
          {data.comment_insights.map((comment) => (
            <div key={comment.id} className="rounded-lg border p-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h4 className="font-semibold">{comment.user_name}</h4>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(comment.created_time).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      badgeColor[comment.sentiment]
                    }`}
                  >
                    {comment.sentiment}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      priorityColor[comment.priority]
                    }`}
                  >
                    {comment.priority}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-gray-700">{comment.message_summary}</p>

              {comment.message && (
                <div className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-600">
                  {comment.message}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
