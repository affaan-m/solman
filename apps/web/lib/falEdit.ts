export type FalEditResponse = {
  images: { url: string }[];
  description?: string;
};

const FAL_EDIT_ENDPOINT = "https://fal.run/fal-ai/nano-banana/edit";

export async function editWithReference(prompt: string, imageUrls: string[]): Promise<string> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("Missing FAL_KEY env var");

  const res = await fetch(FAL_EDIT_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, image_urls: imageUrls, num_images: 1, output_format: "jpeg", sync_mode: false })
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`FAL edit failed: ${res.status} ${t}`);
  }
  const data = (await res.json()) as FalEditResponse;
  const url = data.images?.[0]?.url;
  if (!url) throw new Error("FAL edit response missing image url");
  return url;
}
