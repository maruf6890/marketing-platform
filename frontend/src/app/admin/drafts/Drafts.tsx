"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DefaultSelect } from "@/components/app_inputs/DefaultSelect";

import { private_api_call } from "@/actions/parivate_api_calll";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/app_inputs/DateTimePicker";

type Draft = {
    id: string | number;
    content?: string;
    media_urls?: string;
    scheduled_at?: string;
};

type Page = {
    id: number;
    asset_id: string;
    name: string;
    type: string;
};

export default function DraftsPage({ drafts }: { drafts: Draft[] }) {
    const [pages, setPages] = useState<Draft[]>(drafts);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
    const [editContent, setEditContent] = useState("");
    const [editScheduledAt, setEditScheduledAt] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [pagesList, setPagesList] = useState<Page[]>([]);
    const [selectedPageId, setSelectedPageId] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);
    const [loadingPages, setLoadingPages] = useState(false);

    const openEditModal = (draft: Draft) => {
        setSelectedDraft(draft);
        setEditContent(draft.content || "");
        setEditScheduledAt(draft.scheduled_at || "");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDraft(null);
        setEditContent("");
        setEditScheduledAt("");
    };

    const openPublishModal = async (draft: Draft) => {
        setSelectedDraft(draft);
        setIsPublishModalOpen(true);

        if (pagesList.length > 0) return;

        try {
            setLoadingPages(true);
            const response = await private_api_call({
                path: "facebook/page_list",
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

    const handleSaveDraft = async () => {
        if (!selectedDraft) return;

        try {
            setIsSaving(true);
            const response = await private_api_call({
                path: `facebook/drafts/${selectedDraft.id}`,
                method: "PUT",
                body: {
                    content: editContent,
                    scheduled_at: editScheduledAt || null,
                },
            });

            if (response.success) {
                toast.success("Draft updated successfully!");
                // Update the draft in the list
                setPages(pages.map(p =>
                    p.id === selectedDraft.id
                        ? { ...p, content: editContent, scheduled_at: editScheduledAt }
                        : p
                ));
                closeModal();
            } else {
                toast.error(response.message || "Failed to update draft");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update draft");
        } finally {
            setIsSaving(false);
        }
    };



    const handlePublishDraft = async () => {
        if (!selectedDraft || !selectedPageId) return;

        try {
            setIsPublishing(true);

            const imageUrls = selectedDraft.media_urls
                ? selectedDraft.media_urls
                    .split(",")
                    .map((url) => url.trim())
                    .filter(Boolean)
                : [];

            const response = await private_api_call({
                path: "facebook/publish_post",
                method: "POST",
                body: {
                    pageId: Number(selectedPageId),
                    postId: selectedDraft.id,
                    message: selectedDraft.content || "",
                    images: imageUrls.map((url) => ({ url })),
                    tags: [],
                    scheduled_at: selectedDraft.scheduled_at || null,
                },
            });

            if (response.success) {
                toast.success("Draft published successfully!");
                setPages((prev) => prev.filter((draft) => draft.id !== selectedDraft.id));
                closePublishModal();
            } else {
                toast.error(response.message || "Failed to publish draft");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to publish draft");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Facebook Drafts</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage all your draft posts
                    </p>
                </div>
            </div>

            {/* Empty */}
            {!loading && pages.length === 0 && (
                <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                    No drafts found.
                </div>
            )}

            {/* Full Row Cards */}
            <div className="grid gap-4">
                {pages.map((draft: Draft) => (
                    <div
                        key={draft.id}
                        className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col gap-4">
                            {/* Header with ID and Date */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        Draft ID: {draft.id}
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="bg-muted/50 rounded p-3">
                                <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                    {draft.content}
                                </p>
                            </div>

                            {/* Media Preview */}
                            {draft.media_urls && (
                                <div className="flex gap-2 flex-wrap">
                                    {draft.media_urls
                                        .split(",")
                                        .slice(0, 3)
                                        .map((url: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className="relative w-24 h-24 rounded-md overflow-hidden bg-muted"
                                            >
                                                <img
                                                    src={url.trim()}
                                                    alt={`Media ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect fill='%23e5e7eb' width='96' height='96'/%3E%3Ctext x='50%25' y='50%25' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EImage Error%3C/text%3E%3C/svg%3E";
                                                    }}
                                                />
                                            </div>
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
                                    onClick={() => openEditModal(draft)}
                                >
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive">
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

            {/* Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Scheduled At</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                       

                        {/* Scheduled Date */}
                        <div className="space-y-2">
                            <Label htmlFor="scheduled-at">
                                Schedule
                            </Label>
                            <DateTimePicker value={editScheduledAt? new Date(editScheduledAt) : new Date()} onChange={(date) => setEditScheduledAt(date.toISOString())}  />
                        </div>
                    </div>

                    <DialogFooter>  
                        <Button
                            variant="outline"
                            onClick={closeModal}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveDraft}
                            disabled={isSaving || !editContent.trim()}
                            >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Publish Modal */}
            <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Publish Draft</DialogTitle>
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
                                placeholder={loadingPages ? "Loading pages..." : "Choose a page"}
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
                            onClick={handlePublishDraft}
                            disabled={isPublishing || !selectedPageId}
                        >
                            {isPublishing ? "Publishing..." : "Publish"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}