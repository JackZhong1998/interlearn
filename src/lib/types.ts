export type Gender = "female" | "male";

export type Teacher = {
  id: string;
  name: string;
  gender: Gender;
  tag: string;
  image: string;
  generated?: boolean;
};

export type Choice = {
  id: string;
  label: string;
  hint: string;
  nextClipId: string;
};

export type Clip = {
  id: string;
  title: string;
  script: string;
  video?: string;
  poster?: string;
  prefab: boolean;
  depth: number;
  choices: Choice[];
};

export type Series = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  author: string;
  cover: string;
  startClipId: string;
  clips: Record<string, Clip>;
  source: "bundled" | "store";
};

export type CreationDraft = {
  id: string;
  title: string;
  hook: string;
  firstScript: string;
  branches: { label: string; hint: string; script: string }[];
  expansion: string;
  status: "draft" | "saved";
  updatedAt: number;
};

export type ApiStatus = {
  llm: { ready: boolean; model: string; provider: string };
  fal: { ready: boolean; image: string; i2v: string; t2v: string };
};
