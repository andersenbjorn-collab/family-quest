/**
 * Fetch any image URL and return it as a base64 data URL.
 * Used to permanently store DiceBear avatars so they don't depend on
 * the DiceBear CDN being reachable at render time.
 */
export async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
