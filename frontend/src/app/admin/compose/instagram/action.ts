import { private_api_call } from "@/actions/parivate_api_calll";
const extractHashtagFormMessage = (message: string): string[] => {
    const regex = /#(\w+)/g;
    const hashtags: string[] = [];
    let match;
    while ((match = regex.exec(message)) !== null) {
        hashtags.push(match[1]);
    }
    return hashtags;
};
const onlyTextWithHashtags = (message: string): string => {
    const regex = /#\w+/g;
    return message.replace(regex, '').trim();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api_adapter = (data:any) => {
    return {
        id: data.id,
        message: onlyTextWithHashtags(data.content),
        tags: extractHashtagFormMessage(data.content),
        images: data.media? data.media.map((item: { url: string, public_id: string }) => ({ url: item.url, public_id: item.public_id })) : [],
        status: data.status,
        scheduledAt: data.scheduled_at
    };
};

export const getPostById = async (postId: string) => {
    try {
        const res = await private_api_call({
            path: `posts/${postId}`,
            method: "GET"
        });
        if (res.success) {
            if(res.data){
                return api_adapter(res.data);
            } else {
                console.warn("Post not found with the given ID:", postId);
                return null;
            }
        } else {
            console.error("Failed to fetch post details:", res.message);
            return null;
        }
    } catch (error) {
        console.error("Error fetching post details:", error);
        return null;
    }
};

//delete media by url
export const deleteMediaByUrl = async (url: string) => {
    try {
        const publicId = url.split('/').pop()?.split('.')[0];
        if (!publicId) {
            console.error("Invalid URL format, cannot extract public ID:", url);
            return false;
        }
        const res = await private_api_call({
            path: `media/${publicId}`,
            method: "DELETE"
        });
        if (res.success) {
            return true;
        } else {
            console.error("Failed to delete media:", res.message);
            return false;
        }
    } catch (error) {
    console.error("Error deleting media:", error);
        return false;
    }
};
