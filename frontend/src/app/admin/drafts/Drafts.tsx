"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";
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

import { private_api_call } from "@/actions/parivate_api_calll";
import { toast } from "sonner";

type Draft = {
    id: string | number;
    content?: string;
    media_urls?: string;
    scheduled_at?: string;
};

export default function DraftsPage() {
    const [pages, setPages] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
    const [editContent, setEditContent] = useState("");
    const [editScheduledAt, setEditScheduledAt] = useState("");
    const [isSaving, setIsSaving] = useState(false);

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

    const fetchDrafts = async () => {
        try {
            setLoading(true);

            const response = await private_api_call({
                path: "facebook/drafts",
                method: "GET",
            });


            if (response.success) {
                toast.success("Facebook drafts fetched successfully!");
                setPages(response.data);
            } else {
                toast.error(response.message);
                console.error("Failed to fetch Facebook drafts:", response.message);
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch Facebook drafts.");
        } finally {
            setLoading(false);
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

                <Button onClick={fetchDrafts} disabled={loading}>
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    {loading ? "Loading..." : "Fetch Drafts"}
                </Button>
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
                                <Button size="sm">
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
                        <DialogTitle>Edit Draft</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Content */}
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                placeholder="Enter post content..."
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-30 resize-none"
                                disabled
                            />
                        </div>

                        {/* Scheduled Date */}
                        <div className="space-y-2">
                            <Label htmlFor="scheduled-at">
                                Schedule (Optional)
                            </Label>
                            <Input
                                id="scheduled-at"
                                type="datetime-local"
                                value={editScheduledAt}
                                onChange={(e) => setEditScheduledAt(e.target.value)}
                            />
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
        </div>
    );
}