import { private_api_call } from "@/actions/parivate_api_calll";
//convert into hashmap of platform name and its details

export interface PlatformAccount {
  name: string;
  connected_at: string | null; 
  last_synced_at: string | null;
  is_active: number | null;
}
const getEmptyPlatforms = (name: string) : PlatformAccount => ({
  name: name,
  connected_at: null,
  last_synced_at: null,
  is_active: null,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertToHashMap = (platforms: any[]) => {
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hashMap: Record<string, any> = {};
    platforms.forEach((platform) => {
        hashMap[platform.name] = platform as PlatformAccount;
    });
    return hashMap;
}
export const getIntegrations = async () => {
    try {
        const response = await private_api_call(
            {
                path: "user/platforms",
                method: "GET",
            }
        );

        console.log("Integrations response:", response);
        if(response.success) {
            return {
                data: convertToHashMap(response.data),
            };
        } else {
            return {
              data: {
                facebook: getEmptyPlatforms("facebook"),
                instagram: getEmptyPlatforms("instagram"),
                twitter: getEmptyPlatforms("twitter"),
              },
            };
        }
       
    } catch (error) {
        console.error("Error fetching integrations:", error);
        return {
          data: {
            facebook: getEmptyPlatforms("facebook"),
            instagram: getEmptyPlatforms("instagram"),
            twitter: getEmptyPlatforms("twitter"),
          },
        };
    }
}

