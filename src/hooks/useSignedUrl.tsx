import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get a signed URL for a private storage file
 * @param bucket - Storage bucket name
 * @param filePath - Path to the file in the bucket
 * @param expiresIn - URL expiration time in seconds (default 1 hour)
 */
export function useSignedUrl(
  bucket: string,
  filePath: string | null | undefined,
  expiresIn: number = 3600
) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath) {
      setSignedUrl(null);
      return;
    }

    const getSignedUrl = async () => {
      setLoading(true);
      setError(null);

      try {
        // Extract just the path if it's a full URL
        let path = filePath;
        if (filePath.includes("/storage/v1/object/public/")) {
          const parts = filePath.split("/storage/v1/object/public/");
          if (parts[1]) {
            const bucketAndPath = parts[1];
            const firstSlash = bucketAndPath.indexOf("/");
            if (firstSlash > -1) {
              path = bucketAndPath.substring(firstSlash + 1);
            }
          }
        }

        const { data, error: urlError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, expiresIn);

        if (urlError) throw urlError;
        setSignedUrl(data?.signedUrl || null);
      } catch (err) {
        console.error("Error getting signed URL:", err);
        setError(err instanceof Error ? err.message : "Failed to get signed URL");
        setSignedUrl(null);
      } finally {
        setLoading(false);
      }
    };

    getSignedUrl();
  }, [bucket, filePath, expiresIn]);

  return { signedUrl, loading, error };
}

/**
 * Utility function to get a signed URL (non-hook version for event handlers)
 * @param bucket - Storage bucket name
 * @param filePath - Path to the file in the bucket (can be full URL or just path)
 * @param expiresIn - URL expiration time in seconds (default 1 hour)
 */
export async function getSignedUrl(
  bucket: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  if (!filePath) return null;

  try {
    // Extract just the path if it's a full URL
    let path = filePath;
    if (filePath.includes("/storage/v1/object/public/")) {
      const parts = filePath.split("/storage/v1/object/public/");
      if (parts[1]) {
        const bucketAndPath = parts[1];
        const firstSlash = bucketAndPath.indexOf("/");
        if (firstSlash > -1) {
          path = bucketAndPath.substring(firstSlash + 1);
        }
      }
    } else if (filePath.includes("/storage/v1/object/sign/")) {
      // Already a signed URL, return as-is
      return filePath;
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data?.signedUrl || null;
  } catch (err) {
    console.error("Error getting signed URL:", err);
    return null;
  }
}

/**
 * Open a file from private storage in a new tab using signed URL
 */
export async function openSignedUrl(bucket: string, filePath: string): Promise<void> {
  const url = await getSignedUrl(bucket, filePath);
  if (url) {
    window.open(url, "_blank");
  }
}