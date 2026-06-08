import { private_api_call } from "@/actions/parivate_api_calll";

export const getDrafts = async () => {
    const response = await private_api_call({
        path: "facebook/drafts",
        method: "GET",
    });
    if (response.success) {
        return response.data;
    } else {
        console.error("Failed to fetch drafts:", response.message);
        return [];
    }
};
    



    