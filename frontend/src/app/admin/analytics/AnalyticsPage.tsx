
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MessageCircle,
  ThumbsUp,
  Share2,
  Clock3,
  BarChart3,
  ArrowRight,
  FileText,
  Activity,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import React from "react";
export interface PostAnalytics {
  id: number;
  post_id: number | null;
  platform_post_id: string;
  platform_name: string;
  total_reactions: number;
  total_shares: number;
  total_comments: number;
  performance_label: string;
  description: string;
  last_updated: string;
}


export default function AnalyticsPage({ analyticsData }: { analyticsData: PostAnalytics[] }) {
    const [loadingRedirect, setLoadingRedirect] = React.useState(false);
    const router= useRouter();
    const handleClick = ({ id }: { id: number }) => {
        setLoadingRedirect(true);
        router.push(`/admin/analytics/${id.toString()}`);
    }
    console.log("Rendering AnalyticsPage with data:", analyticsData);
  return (
    <div className="min-h-screen bg-muted">
      <div className=" p-6">
        {/* Header */}

        <div className="mb-8 flex flex-col">
          <h1 className="text-xl font-bold text-foreground">
            Post Analytics
          </h1>

          <p className="text-sm text-muted-foreground">
            View engagement and performance insights for your published posts.
          </p>
        </div>

        {/* Content */}

        <div className="">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {analyticsData.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden rounded-2xl border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-accent p-3">
                        <Building2 className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground">
                          {post.platform_name}
                        </h3>

                        <p className="text-xs text-muted-foreground">
                          Platform
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className="capitalize gap-1"
                    >
                      <Activity className="h-3 w-3" />
                      {post.performance_label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />

                      <span className="text-sm font-medium text-foreground">
                        Description
                      </span>
                    </div>

                    <p className="line-clamp-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                      {post.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 rounded-xl border border-border bg-background p-4">
                    <div className="flex flex-col items-center gap-1">
                      <ThumbsUp className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {post.total_reactions}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Reactions
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1 border-x border-border">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {post.total_comments}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Comments
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <Share2 className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {post.total_shares}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Shares
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Post ID
                      </span>

                      <span className="max-w-[180px] truncate text-right text-xs font-medium text-foreground">
                        {post.platform_post_id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Last Updated
                      </span>

                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Clock3 className="h-4 w-4" />

                        {format(
                          new Date(post.last_updated),
                          "dd MMM yyyy • hh:mm a"
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full flex gap-2" onClick={() => handleClick({ id: post.id })} disabled={loadingRedirect}>
                        {
                    loadingRedirect ? ( <Loader2 className="h-4 w-4 animate-spin" />):  ( <BarChart3 className="h-4 w-4" />)
                  }
                    View Analytics
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

