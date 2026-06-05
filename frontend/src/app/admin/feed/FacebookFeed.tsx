"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageSquare } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { private_api_call } from "@/actions/parivate_api_calll";
import { toast } from "sonner";

type Post = {
    id: string;
    message?: string;
    images?: string[];
    created_time: string;
    page_name: string;
    page_asset_id: string;
    access_token: string;
    permalink_url?: string;
};

type Comment = {
    id: string;
    message: string;
    created_time: string;
    from: {
        id: string;
        name: string;
        picture?: {
            data: {
                height: number;
                width: number;
                url: string;
            };
        };
    };
    comments?: {
        data: Reply[];
    };
};

type Reply = {
    id: string;
    message: string;
    created_time: string;
    from: {
        id: string;
        name: string;
        picture?: {
            data: {
                height: number;
                width: number;
                url: string;
            };
        };
    };
};

export default function FacebookFeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const fetchFeed = async () => {
        try {
            setLoading(true);

            const response = await private_api_call({
                path: "facebook/feed",
                method: "GET",
            });

            if (response.success) {
                toast.success("Facebook feed loaded successfully!");
                setPosts(response.data);
            } else {
                toast.error(response.message);
                console.error("Failed to fetch feed:", response.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load Facebook feed");
        } finally {
            setLoading(false);
        }
    };

    const handleLoadComments = async (post: Post) => {
        try {
            setSelectedPost(post);
            setLoadingComments(true);
            setComments([]);
            setIsCommentsModalOpen(true);

            const response = await private_api_call({
                path: `facebook/comments/${post.id}`,
                method: "POST",
                body: {
                    accessToken: post.access_token,
                },
            });

            if (response.success) {
                setComments(response.data);
                if (response.data.length === 0) {
                    toast.info("No comments found on this post");
                }
            } else {
                toast.error(response.message || "Failed to load comments");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load comments");
        } finally {
            setLoadingComments(false);
        }
    };

    const closeCommentsModal = () => {
        setIsCommentsModalOpen(false);
        setSelectedPost(null);
        setComments([]);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Facebook Feed</h1>
                    <p className="text-sm text-muted-foreground">
                        View all posts from your Facebook pages
                    </p>
                </div>

                <Button onClick={fetchFeed} disabled={loading}>
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    {loading ? "Loading..." : "Load Feed"}
                </Button>
            </div>

            {/* Empty State */}
            {!loading && posts.length === 0 && (
                <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                    No posts found. Click Load Feed to fetch posts from your pages.
                </div>
            )}

            {/* Posts Grid */}
            <div className="grid gap-4">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col gap-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {post.page_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(post.created_time)}
                                    </p>
                                </div>
                            </div>

                            {/* Post Content */}
                            {(post.message) && (
                                <div className="bg-muted/50 rounded p-3">
                                    <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                        {post.message}
                                    </p>
                                </div>
                            )}

                            {/* Image Preview */}
                            {((post.images && post.images.length > 0)) && (
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {(post.images && post.images.length > 0
                                            ? post.images : []).map((image, idx) => (
                                            <div
                                                key={`${post.id}-image-${idx}`}
                                                className="relative w-full overflow-hidden rounded-md bg-muted"
                                            >
                                                <img
                                                    src={image}
                                                    alt={`Post image ${idx + 1}`}
                                                    className="h-40 w-full object-cover sm:h-48"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%236b7280' text-anchor='middle' dy='.3em'%3EImage Error%3C/text%3E%3C/svg%3E";
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleLoadComments(post)}
                                >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Load Comments
                                </Button>
                                {post.permalink_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <a
                                            href={post.permalink_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on Facebook
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comments Modal */}
            <Dialog open={isCommentsModalOpen} onOpenChange={setIsCommentsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Post Comments</DialogTitle>
                    </DialogHeader>

                    {loadingComments && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Loading comments...</div>
                        </div>
                    )}

                    {!loadingComments && comments.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No comments found on this post
                        </div>
                    )}

                    {!loadingComments && comments.length > 0 && (
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="rounded-lg border p-4 space-y-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            {comment.from.picture?.data?.url && (
                                                <img
                                                    src={comment.from.picture.data.url}
                                                    alt={comment.from.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">
                                                    {comment.from.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(comment.created_time)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                            {comment.message}
                                        </p>
                                        {comment.comments?.data && comment.comments.data.length > 0 && (
                                            <div className="mt-3 space-y-3 border-l pl-4">
                                                {comment.comments.data.map((reply) => (
                                                    <div key={reply.id} className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            {reply.from.picture?.data?.url && (
                                                                <img
                                                                    src={reply.from.picture.data.url}
                                                                    alt={reply.from.name}
                                                                    className="w-6 h-6 rounded-full"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">
                                                                    {reply.from.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatDate(reply.created_time)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                                            {reply.message}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}

                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={closeCommentsModal}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
