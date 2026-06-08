import { private_api_call } from "@/actions/parivate_api_calll";

export const getScheduledPosts = async () => {
    const response = await private_api_call({
        path: "facebook/scheduled_posts",
        method: "GET",
    });
    if (response.success) {
        return response.data;
    } else {
        console.error("Failed to fetch scheduled posts:", response.message);
        return [];
    }
};
    



    