import { BASE_URL } from "@/lib/const";
const uploadSingleFile = async (file:File) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${BASE_URL}/upload`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error uploading file:", error);
        return {
            success: false,
            data: null,
            message: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
};

const uploadMultipleFiles = async (files: File[]) => {
    try {
        const formData = new FormData();
        files.forEach((file) => {   
            formData.append("files", file);
        });
        const res = await fetch(`${BASE_URL}/upload-multiple`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        return {
            success: data.success,
            data: data.files,
            message: data.message || "Files uploaded successfully", 
        };
    } catch (error) {
        console.error("Error uploading files:", error);
        return {
            success: false,
            data: null,
            message: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }   
};

export { uploadSingleFile, uploadMultipleFiles };