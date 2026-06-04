"use client";
import { useEffect, useState } from "react";
import { Facebook, Link2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { private_api_call } from "@/actions/parivate_api_calll";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PlatformAccount } from "./action";


export default function IntegrationsPage({data}: {data: Record<string,  PlatformAccount >}) {
  const searchParams=  useSearchParams();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const success = searchParams.get("success");
  


  const connectFacebook = async () => {
    setLoading("facebook");
    const res = await private_api_call({
      path: "user/facebook",
      method: "GET",
    });
    console.log(res);
    if (res.success) {
      window.location.href = res.data?.url;
    } else {
      alert("Failed to connect to Facebook: " + res.message);
      setLoading(undefined);
    }
  };
  useEffect(() => {
    if (success === "true") {
      toast.success("Successfully connected to Facebook!");
    }
  }, [success]);





  return (
    <div className="min-h-screen bg-muted p-4 text-foreground">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-foreground">Integrations</h1>
        <p className="text-muted-foreground text-sm">
          Connect your platforms to automate your workflow
        </p>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Facebook Integration */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent p-2 text-accent-foreground">
                <Facebook className="text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Facebook</h2>
                <p className="text-sm text-muted-foreground">Pages & Posting</p>
              </div>
            </div>

            {data.facebook?.connected_at ? (
              <Badge variant="secondary" className="text-sm!">
                Connected
              </Badge>
            ) : (
              <span className="text-xs bg-destructive px-1.5 rounded-sm py-1 text-primary-foreground">
                Disconnected
              </span>
            )}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Manage pages, publish posts, and track engagement from your app.
          </div>

          <div className="mt-2 flex gap-3">
            {!connected ? (
              <Button
                disabled={data.facebook?.connected_at ? true : false}
                onClick={connectFacebook}
                className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/90"
              >
                {loading === "facebook" ? "Connecting..." : "Connect"}
              </Button>
            ) : (
              <Button
                disabled={data.facebook?.connected_at ? false : true}
                onClick={() => setConnected(false)}
                variant="outline"
                className="w-full rounded-lg px-4 py-2"
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {/* Placeholder integrations */}
        <div className="bg-card border border-border rounded-xl p-5 opacity-60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-muted p-2 text-muted-foreground">
              <Link2 />
            </div>
            <h2 className="font-semibold">Youtube</h2>
          </div>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 opacity-60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-muted p-2 text-muted-foreground">
              <Settings />
            </div>
            <h2 className="font-semibold">More Integrations</h2>
          </div>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
