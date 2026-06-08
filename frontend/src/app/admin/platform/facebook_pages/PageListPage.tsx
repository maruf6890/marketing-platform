"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Facebook } from "lucide-react";
import { Asset } from "./action";
import { cleanString } from "@/lib/utils";
import { private_api_call } from "@/actions/parivate_api_calll";
import { toast } from "sonner";
import { Elsie_Swash_Caps } from "next/font/google";


export default function PagesListPage({data}: {data:Asset[] | null}) {
  const router = useRouter();
  const [pages, setPages] = useState<Asset[]>(data || []);
  const [loading, setLoading] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);

    const response = await private_api_call({
                path: "facebook/request_pages",
                method: "GET",
              });
    

        if (response.success) {
          toast.success("Facebook pages fetched successfully!");
          setPages(response.data);
        } else {
            toast.error(response.message);
            console.error("Failed to fetch Facebook pages:", response.message);
        }
      
    }catch (err) {
      console.error(err);
      toast.error("Failed to fetch Facebook pages.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facebook Pages</h1>
          <p className="text-sm text-muted-foreground">
            Manage all connected pages
          </p>
        </div>

        <Button onClick={fetchPages} disabled={loading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Loading..." : "Fetch Pages"}
        </Button>
      </div>

      {/* Empty */}
      {!loading && pages.length === 0 && (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No pages found.
        </div>
      )}

      {/* Full Row Cards */}

      <div className="space-y-3">
        {pages.map((page) => (
          <div
            key={page.id}
            className="flex items-center justify-between rounded-xl border bg-background px-5 py-4 shadow-sm transition hover:shadow-md"
          >
            {/* Left */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Facebook className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="font-medium">{page.name}</p>
                <p className="text-xs text-muted-foreground">
                  Asset ID: {page.asset_id}
                </p>
                <Badge variant="secondary" className="uppercase text-xs">
                  {cleanString(page.type)}
                </Badge>
              </div>
            </div>

           

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => router.push("/admin/feed/facebook")}>
                View
              </Button>
              <Button size="sm">Post</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}