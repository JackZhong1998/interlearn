import { falConfig } from "./models";

async function falRun<T>(modelId: string, input: Record<string, unknown>): Promise<T> {
  const cfg = falConfig();
  if (!cfg.ready) throw new Error("FAL_KEY 未配置");
  const res = await fetch(`https://fal.run/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${cfg.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal ${modelId} ${res.status}: ${text.slice(0, 400)}`);
  }
  return (await res.json()) as T;
}

export async function generateTeacherPortraits(prompt: string, n = 4) {
  const cfg = falConfig();
  return falRun<{ images: { url: string }[] }>(cfg.image, {
    prompt,
    image_size: "portrait_4_3",
    num_images: Math.min(4, Math.max(1, n)),
    sync_mode: false,
  });
}

export async function generateVideoFromTeacher(
  imageUrl: string,
  prompt: string,
  duration = 5,
) {
  const cfg = falConfig();
  return falRun<{ video?: { url: string }; url?: string }>(cfg.i2v, {
    image_url: imageUrl,
    prompt,
    duration,
    resolution: "768P",
    prompt_expansion_mode: "balanced",
  });
}

export async function generateVideoFromText(prompt: string, duration = 5) {
  const cfg = falConfig();
  return falRun<{ video?: { url: string }; url?: string }>(cfg.t2v, {
    prompt,
    duration,
    resolution: "768P",
    aspect_ratio: "9:16",
    prompt_expansion_mode: "balanced",
  });
}

export function videoUrlFromFal(data: { video?: { url: string }; url?: string }) {
  return data.video?.url || data.url || "";
}
