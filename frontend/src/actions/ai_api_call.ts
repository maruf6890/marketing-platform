"use server"




interface request_props {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
}
const AI_BASE_URL = "http://127.0.0.1:8000/api/v1";
export const ai_api_call = async (
    { path, method="POST", body }: request_props
) => {
    console.log("Initiating API call with parameters:", { path, method, body });
   try {
        console.log("Making API call to:", `${AI_BASE_URL}/${path}`);
         const res = await fetch(`${AI_BASE_URL}/${path}`, {
           method: method,
           headers: {
             "Content-Type": "application/json",
              accept: "application/json",
           },
           body: body ? JSON.stringify(body) : undefined,
         });

       const result = await res.json();
       console.log("Raw API response:", result);
         if (!res.ok) {
           return {
             success: false,
             data: null,
             message: result.message || "An error occurred",    
           };
       }
       console.log("API call successful, response data:", result);
       return {
           success: true,
           data: result.data,
           message: result.message || "Request successful",
       };
   } catch (error) {
       console.error("Error in public_api_call:", error);
       return {
           success: false,
           data: null,
           message: error instanceof Error ? error.message : "An unknown error occurred",   
       };
   }
}