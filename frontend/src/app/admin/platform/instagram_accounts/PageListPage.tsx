"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Instagram } from "lucide-react";
import { Asset } from "./action";
import { cleanString } from "@/lib/utils";
import { private_api_call } from "@/actions/parivate_api_calll";
import { toast } from "sonner";

export default function PagesListPage({ data }: { data: Asset[] | null }) {
  const [accounts, setAccounts] = useState<Asset[]>(data || []);
  const [loading, setLoading] = useState(false);

  const fetchAcc = async () => {
    try {
      setLoading(true);

      const response = await private_api_call({
        path: "instagram/request_accounts",
        method: "GET",
      });

      if (response.success) {
        toast.success("Instagram accounts fetched successfully!");
        setAccounts(response.data);
      } else {
        toast.error(response.message);
        console.error("Failed to fetch Instagram accounts:", response.message);
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch Instagram accounts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instagram Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Manage all connected accounts
          </p>
        </div>

        <Button onClick={fetchAcc} disabled={loading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Loading..." : "Fetch Accounts"}
        </Button>
      </div>

      {/* Empty */}
      {!loading && accounts.length === 0 && (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No accounts found.
        </div>
      )}

      {/* Full Row Cards */}

      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between rounded-xl border bg-background px-5 py-4 shadow-sm transition hover:shadow-md"
          >
            {/* Left */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Instagram className="h-6 w-6 text-pink-500" />
              </div>

              <div>
                <p className="font-medium">{account.name}</p>
                <p className="text-xs text-muted-foreground">
                  Asset ID: {account.asset_id}
                </p>
                <Badge variant="secondary" className="uppercase text-xs">
                  {cleanString(account.type)}
                </Badge>
              </div>
            </div>


            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
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