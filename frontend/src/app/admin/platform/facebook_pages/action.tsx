import { private_api_call } from "@/actions/parivate_api_calll"

export interface Asset {
  id: number;
  asset_id: string;
  name: string;
  type: string;
}
const reqUsersPageList = async () => {
    try {
        const response = await private_api_call({
          path: "facebook/request_pages",
          method: "GET",
        });
        console.log("Facebook pages response:", response);
        if(response.success) {
            return response.data;
        } else {
           console.error("Failed to fetch Facebook pages:", response.message);
           return null;
        }
     }catch (error) {
        console.error("Error fetching Facebook pages:", error);
        return null;
    }
}
export const getUsersPageList = async () : Promise<Asset[] | null> => {
  try {
    const response = await private_api_call({
      path: "facebook/page_list",
      method: "GET",
    });
    console.log("Facebook pages response:", response);
    if (response.success) {
      return response.data;
    } else {
      console.error("Failed to fetch Facebook pages:", response.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching Facebook pages:", error);
    return null;
  }
};
