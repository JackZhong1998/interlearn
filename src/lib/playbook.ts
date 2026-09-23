import fs from "fs";
import { CATALOG_MD } from "@/lib/paths";

function readPlayPattern(): string {
  try {
    const md = fs.readFileSync(CATALOG_MD, "utf8");
    const start = md.indexOf("## 玩法知识");
    if (start < 0) return "";
    const end = md.indexOf("\n---\n", start + 4);
    return md.slice(start, end > start ? end : undefined).trim();
  } catch {
    return "";
  }
}

const FALLBACK_PLAY = `## 玩法知识
只出学习题。机制是「短片播完停住 → 三个叠层选项 → 点了播下一段预制」。
同一知识现场分出三条真不一样的拆法。不要厨房、面试、酒局、到账、困电梯。
适合：证明卡壳、长句找不到主语、能量账对不上、史料打架、测试红了。
首条先扔现场再锁「选」；8–12 秒；不要先下定义。
按钮 ≤ 12 字写动作。第一层 3 条预制秒开。换老师只换脸。`;

export function getPlaybook(): string {
  const play = readPlayPattern() || FALLBACK_PLAY;
  return `
你是 interlearn 创作 Agent，中文回复。只做互动学习视频，不做生活剧。
两个职能：1) 设计片头  2) 对着当前镜头推 3 个学习分支，并写清后面怎么长。

必须遵守下面的「玩法知识」：

${play}

产品补充：
- 首页是学习向抖音全屏信息流，播完不自动下滑，点选项必须立刻播下一段。
- 已上线样例：机器怎么分工、π 是一种比、直角上的面积、科学怎么问、地球在记账、深空怎么被看见。
- 首页只播真实教学片；选项只出现在 /watch 二级页。
- 禁止：糊锅、酒局、到账、困电梯、面试套话。
- 有钥匙时走 Cerebras gpt-oss-120b；肖像 fal-ai/flux-2/turbo；后续镜头 minimax/h3-max-turbo/image-to-video。

用户要片头或分支时，附 json 代码块：
{
  "title": "",
  "hook": "",
  "firstScript": "",
  "branches": [
    { "label": "", "hint": "", "script": "" },
    { "label": "", "hint": "", "script": "" },
    { "label": "", "hint": "", "script": "" }
  ],
  "expansion": "第二层如何沿着已选拆法再长出 3 个选项"
}
label ≤ 12 字，写学习动作。口播 8–12 秒。
`.trim();
}

export const PLAYBOOK = getPlaybook();

export function localAgentReply(userText: string): {
  reply: string;
  draft: {
    title: string;
    hook: string;
    firstScript: string;
    branches: { label: string; hint: string; script: string }[];
    expansion: string;
  };
} {
  const q = userText.trim() || "这道题卡在中间一步";
  const title = q.length > 12 ? q.slice(0, 12) : q;
  const draft = {
    title: `${title} · 三选一`,
    hook: `同一知识现场，三条真不一样的拆法。`,
    firstScript: `停。${q}已经摊在桌上。先别往下抄。选一种下手方式——选完才播下一段，不会自动讲完。`,
    branches: [
      {
        label: "先把反面写出来",
        hint: "反证探缺口",
        script: `对，先写假如结论不成立。反面往往更好下手。写下它，看和已知哪一句打架。`,
      },
      {
        label: "先丢一个特例",
        hint: "数字钉住抽象",
        script: `先丢一个具体例子进去。特例不是证明，是探路灯。灯亮了再回到一般情形。`,
      },
      {
        label: "先拆还没用的条件",
        hint: "缺口常在这",
        script: `把已知逐条编号。没用上的那一条，常常就是断掉的一跳。`,
      },
    ],
    expansion:
      "每一层还是短片→停→三选。沿着已选拆法往下长，第二层把数字、原句、公式写具体。第一层 3 条预制秒开。换老师只换脸。禁止生活剧。",
  };

  const reply = [
    "按学习向玩法知识出题：观众在选一种拆法，不是在等把课讲完。",
    "",
    `片头钩子：${draft.hook}`,
    `口播：${draft.firstScript}`,
    "",
    "三个互斥按钮：",
    ...draft.branches.map((b, i) => `${"ABC"[i]} ${b.label}（${b.hint}）`),
    "",
    `更后面怎么长：${draft.expansion}`,
    "",
    "```json",
    JSON.stringify(draft, null, 2),
    "```",
  ].join("\n");

  return { reply, draft };
}
