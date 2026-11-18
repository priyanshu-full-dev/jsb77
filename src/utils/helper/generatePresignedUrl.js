import { generatePresignedUrlFromS3Url } from "../../socketClient";

export function formatS3PathStyle(url) {
  if (!url) return "";
  if (typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url;
}

export async function generatePresignedUrl(s3Urlurl) {

  try {
    const url = await generatePresignedUrlFromS3Url(s3Urlurl);    
    return url?.url;
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    throw error;
  }
}

