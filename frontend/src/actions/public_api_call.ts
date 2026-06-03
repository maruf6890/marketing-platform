"use server"

import { BASE_URL } from "@/lib/const";


interface request_props {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
}
export const public_api_call = async (
    { path, method="GET", body }: request_props
) => {
   try {
        console.log("Making API call to:", `${BASE_URL}/${path}`);
         const res = await fetch(`${BASE_URL}/${path}`, {
           method: method,
           headers: {
             "Content-Type": "application/json",
              accept: "application/json",
           },
           body: body ? JSON.stringify(body) : undefined,
         });

         const result = await res.json();
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