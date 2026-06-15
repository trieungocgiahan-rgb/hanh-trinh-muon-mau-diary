import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

export async function uploadMedia(
  projectId: string,
  activityId: string,
  file: File | Blob,
  fileName: string,
): Promise<string> {
  const path = `${projectId}/${activityId}/${crypto.randomUUID()}-${safeName(fileName)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: (file as File).type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

export async function removeMedia(path: string) {
  await supabase.storage.from(BUCKET).remove([path]);
}
