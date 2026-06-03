import { uploadBufferToCloudinary } from "./uploadBuffer.js";
export const uploadMultipleFiles = async (files) => {
  return Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer)),
  );
};
