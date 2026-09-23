import type { Teacher } from "./types";

export type StoryboardShot = {
  id: string;
  title: string;
  script: string;
  visual: string;
  video?: string;
};

export type CustomLearnPlan = {
  goal: string;
  method: string;
  teacher: Pick<Teacher, "id" | "name" | "tag" | "image">;
  explanation: string;
  storyboard: StoryboardShot[];
  provider: string;
  model: string;
  videoModel?: string;
  videoReason?: string;
};

export const GOAL_CHIPS = [
  "搞懂 π 到底是什么比",
  "并行计算为什么比排队快",
  "科学结论怎么被打脸还能进步",
  "碳和水在地球上怎么记账",
];

export const METHOD_CHIPS = ["类比讲解", "逐步推导", "场景问答"];

export function localCustomLearn(input: {
  goal: string;
  method: string;
  teacher: Pick<Teacher, "id" | "name" | "tag" | "image">;
}): CustomLearnPlan {
  const { goal, method, teacher } = input;
  const way =
    method.includes("推导")
      ? "一步一步把条件写开"
      : method.includes("问答")
        ? "先抛现场再逼问"
        : "用一个身边的类比把结构托出来";

  const explanation = `${teacher.name}（${teacher.tag}）用「${method}」带你学「${goal}」。\n\n先不背定义。${way}。讲清楚一件事后停住，让你选下一条要拆的方向。口播控制在 8–12 秒，镜头是竖屏近景讲解加一张能看懂的图。`;

  const storyboard: StoryboardShot[] = [
    {
      id: "start",
      title: "先把问题扔到桌上",
      script: `${teacher.name}对着镜头：我们今天只办一件事——${goal}。先别背词。${way}。看完你选一条继续拆。`,
      visual: `竖屏 9:16，${teacher.name} 半身讲解，背后一块简单板书，写着「${goal}」。`,
    },
    {
      id: "shot-a",
      title: "把结构拆开",
      script: `还是${teacher.name}。按${method}把「${goal}」拆成能看见的两块：什么在变，什么不变。`,
      visual: `老师指向板书左右两栏，镜头轻推。`,
    },
    {
      id: "shot-b",
      title: "做一个最小验证",
      script: `别信嘴。${teacher.name}带你做一次最小验证：量一下、对一下、看误差从哪来。`,
      visual: `手写或比划一次验证，特写结果。`,
    },
    {
      id: "shot-c",
      title: "接到下一层问题",
      script: `这件事站稳以后，真正难的是下一问。${teacher.name}把下一问写在边上，等你下次再选。`,
      visual: `板书多出一行未解的问题，老师看向镜头。`,
    },
  ];

  return {
    goal,
    method,
    teacher,
    explanation,
    storyboard,
    provider: "local-playbook",
    model: "playbook",
    videoReason: "未调用视频模型，先交出讲解和分镜。",
  };
}

export function customLearnSystemPrompt() {
  return `你是 interlearn 定制学习编剧。中文。用户已经锁定：学习目标、学习方式、老师。
只根据这三件事写知识讲解和四条竖屏短片分镜（片头 + 三条展开）。
不要写成生活剧，不要厨房面试酒局。
必须返回 JSON：
{
  "explanation": "200字内的知识讲解，点名老师和学习方式",
  "storyboard": [
    { "id": "start", "title": "", "script": "8-12秒口播", "visual": "画面" },
    { "id": "shot-a", "title": "", "script": "", "visual": "" },
    { "id": "shot-b", "title": "", "script": "", "visual": "" },
    { "id": "shot-c", "title": "", "script": "", "visual": "" }
  ]
}`;
}
