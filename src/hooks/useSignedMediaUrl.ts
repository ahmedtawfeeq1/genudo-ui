import { useState, useEffect } from 'react';
import { db } from "@/lib/mock-db";

const SIGNED_URL_EXPIRY = 604800; // 1 week in seconds

export const useSignedMediaUrl = (storagePath: string | null | undefined) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSignedUrl = async () => {
    if (!storagePath) {
      setSignedUrl(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Extract bucket and path from storage path
      // Format: "messages-media/images/..."
      const pathParts = storagePath.split('/');
      const bucket = pathParts[0]; // "messages-media"
      const filePath = pathParts.slice(1).join('/'); // Rest of the path

      const { data, error: signError } = await db.storage
        .from(bucket)
        .createSignedUrl(filePath, SIGNED_URL_EXPIRY);

      if (signError) throw signError;

      setSignedUrl(data?.signedUrl || null);
    } catch (err) {
      console.error('Error generating signed URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media');
      setSignedUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateSignedUrl();
  }, [storagePath]);

  return {
    signedUrl,
    loading,
    error,
    refresh: generateSignedUrl,
  };
};
