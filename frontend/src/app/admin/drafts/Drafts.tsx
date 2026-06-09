"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Facebook,
  Hash,
  Instagram,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DefaultSelect } from "@/components/app_inputs/DefaultSelect";

import { private_api_call } from "@/actions/parivate_api_calll";
import { toast } from "sonner";
import Image from "next/image";
import DeleteDialog from "@/components/app_ui_element/DeleteDialog";
import { useRouter } from "next/navigation";

type Draft = {
  id: string | number;
  content?: string;
  media_urls?: string;
  name?: string;
  type?: string;
};

type Page = {
  id: number;
  asset_id: string;
  name: string;
  type: string;
};

export default function DraftsPage({ posts }: { posts: Draft[] }) {
  const [pages, setPages] = useState<Draft[]>(posts);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [pagesList, setPagesList] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | number | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState(false);
  const [redirectingPostId, setRedirectingPostId] = useState<
    string | number | null
  >(null);

  useEffect(() => {
    setPages(posts);
  }, [posts]);

  const openPublishModal = async (draft: Draft) => {
    setSelectedDraft(draft);
    setIsPublishModalOpen(true);

    if (pagesList.length > 0) return;

    try {
      setLoadingPages(true);
      const pageListPath = draft.type === "facebook_page" ? "facebook/page_list" : "instagram/page_list";

      const response = await private_api_call({
        path: pageListPath,
        method: "GET",
      });

      if (response.success) {
        setPagesList(response.data || []);
      } else {
        toast.error(response.message || "Failed to load pages");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pages");
    } finally {
      setLoadingPages(false);
    }
  };

  const closePublishModal = () => {
    setIsPublishModalOpen(false);
    setSelectedPageId("");
  };

  const router = useRouter();
  //redirect to compose page
  const handleRedirectToCompose = (id: string | number, type?: string) => {
    setRedirectingPostId(id);
    const composePath =
      type === "instagram_account"
        ? "/admin/compose/instagram"
        : "/admin/compose/facebook";

    router.push(`${composePath}?post_id=${id}`);
  };

  const handlePublishScheduled = async () => {
    if (!selectedDraft || !selectedPageId) return;

    try {
      setIsPublishing(true);

      const imageUrls = selectedDraft.media_urls
        ? selectedDraft.media_urls
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean)
        : [];

      const pageListPath = selectedDraft.type === "facebook_page" ? "facebook/page_list" : "instagram/page_list";

      const response = await private_api_call({
        path: pageListPath,
        method: "POST",
        body: {
          pageId: Number(selectedPageId),
          postId: selectedDraft.id,
          message: selectedDraft.content || "",
          images: imageUrls.map((url) => ({ url })),
          tags: [],
          scheduled_at: null,
        },
      });

      if (response.success) {
        toast.success("Draft post published successfully!");
        setPages((prev) => prev.filter((item) => item.id !== selectedDraft.id));
        closePublishModal();
      } else {
        toast.error(response.message || "Failed to publish draft post");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish draft post");
    } finally {
      setIsPublishing(false);
    }
  };

  //const handle delete post
  const handleDeleteDraft = async (id: string | number) => {
    if (!id) {
      return toast.error("selected post id is invalid");
    }

    try {
      setPendingDelete(true);
      const response = await private_api_call({
        path: `posts/${id}`,
        method: "DELETE",
      });

      if (response.success) {
        toast.success("Draft post deleted successfully!");
        setPages((prev) => prev.filter((item) => item.id !== id));
        setIsDeleting(false);
        setDeletingPostId(null);
      } else {
        toast.error(response.message || "Failed to delete draft post");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete draft post");
    } finally {
      setPendingDelete(false);
    }
  };

  console.log("Draft Posts:", pages);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Draft Posts</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your draft posts
          </p>
        </div>
      </div>

      {/* Empty */}
      {pages.length === 0 && (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No draft posts found.
        </div>
      )}

      {/* Full Row Cards */}
      <div className="grid gap-4">
        {pages.map((draft: Draft) => (
          <div
            key={draft.id}
            className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="space-y-1">
              {/* Header with ID and Date */}
              <div className="flex items-start justify-between">
              <div>
                <p className="text-xs flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground p-1 rounded-md text-xs flex items-center gap-1">
                    {draft.type === "facebook_page" ? (
                      <Facebook className="size-4" />
                    ) : (
                      <Instagram className="size-4" />
                    )}
                  </span>
                  <span className="truncate capitalize text-base">
                    {draft.name}
                  </span>
                </p>
              </div>
              {draft.id && (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      #Draft-{draft.id}
                    </p>
                  </div>
                  
                </div>
                )}
              </div>  

              {/* Content */}
              <div className=" ">
                <p className="text-sm truncate ">{draft.content}</p>
              </div>

              {/* Media Preview */}
              {draft.media_urls && (
                <div className="flex  gap-3 mt-4">
                  {draft.media_urls
                    .split(",")
                    .slice(0, 3)
                    .map((url: string, idx: number) => (
                      <Image
                        key={idx}
                        height={164}
                        width={164}
                        src={url.trim()}
                        alt={`Media ${idx + 1}`}
                        className=" object-cover aspect-4/3 border border-border rounded-sm"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect fill='%23e5e7eb' width='96' height='96'/%3E%3Ctext x='50%25' y='50%25' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EImage Error%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ))}
                  {draft.media_urls.split(",").length > 3 && (
                    <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      +{draft.media_urls.split(",").length - 3} more
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRedirectToCompose(draft.id, draft.type)}
                >
                  {redirectingPostId === draft.id ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="animate-spin size-4" /> Loading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Edit className="size-4" /> Edit
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    setDeletingPostId(draft.id);
                    setIsDeleting(true);
                  }}
                >
                  Delete
                </Button>
                <Button size="sm" onClick={() => openPublishModal(draft)}>
                  Publish
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
        <DialogContent className="max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Publish Draft Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="page">Select Page</Label>
              <DefaultSelect
                value={selectedPageId}
                onValueChange={setSelectedPageId}
                options={pagesList.map((page) => ({
                  label: page.name,
                  value: String(page.id),
                }))}
                placeholder={
                  loadingPages ? "Loading pages..." : "Choose a page"
                }
                className="w-full"
              />
              {loadingPages && (
                <p className="text-xs text-muted-foreground">
                  Loading pages...
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closePublishModal}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublishScheduled}
              disabled={isPublishing || !selectedPageId}
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteDialog
        open={isDeleting}
        loading={pendingDelete}
        onOpenChange={setIsDeleting}
        onSubmit={() => {
          if (deletingPostId) {
            handleDeleteDraft(deletingPostId);
          }
        }}
        onClose={() => {
          setIsDeleting(false);
          setDeletingPostId(null);
        }}
        title="Confirm Deletion"
        description="Are you sure you want to delete this draft post? This action cannot be undone."
        cancelLabel="Cancel"
        submitLabel="Delete"
      />
    </div>
  );
}
