/**
 * Model IDs and env names from internal/model-research.md — do not invent others.
 */
export const MODELS = {
  llmFast: "gpt-oss-120b",
  llmChinese: "deepseek-flash",
  image: "fal-ai/flux-2/turbo",
  videoT2v: "minimax/h3-max-turbo/text-to-video",
  videoI2v: "minimax/h3-max-turbo/image-to-video",
  videoR2v: "minimax/h3-max/reference-to-video",
} as const;

export function llmConfig() {
  const model = process.env.LLM_MODEL || MODELS.llmFast;
  const preferDeepseek =
    model === MODELS.llmChinese && Boolean(process.env.DEEPSEEK_API_KEY);

  if (preferDeepseek) {
    return {
      ready: true,
      provider: "deepseek",
      model: MODELS.llmChinese,
      apiKey: process.env.DEEPSEEK_API_KEY!,
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
      extra: { thinking: { type: "disabled" as const } },
    };
  }

  const apiKey = process.env.CEREBRAS_API_KEY;
  return {
    ready: Boolean(apiKey),
    provider: "cerebras",
    model: process.env.LLM_MODEL || MODELS.llmFast,
    apiKey: apiKey || "",
    baseURL: process.env.LLM_BASE_URL || "https://api.cerebras.ai/v1",
    extra: { reasoning_effort: "low" as const },
  };
}

export function falConfig() {
  return {
    ready: Boolean(process.env.FAL_KEY),
    key: process.env.FAL_KEY || "",
    image: process.env.FAL_IMAGE_MODEL || MODELS.image,
    t2v: process.env.FAL_VIDEO_T2V_MODEL || MODELS.videoT2v,
    i2v: process.env.FAL_VIDEO_I2V_MODEL || MODELS.videoI2v,
    r2v: process.env.FAL_VIDEO_R2V_MODEL || MODELS.videoR2v,
  };
}
