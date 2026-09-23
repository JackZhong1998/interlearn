import type { Series } from "@/lib/types";
import { withBase } from "@/lib/base-path";

function clip(
  id: string,
  title: string,
  script: string,
  seriesId: string,
  depth: number,
  choices: { id: string; label: string; hint: string; next: string }[],
): Series["clips"][string] {
  const media = withBase(`/media/series/${seriesId}`);
  return {
    id,
    title,
    script,
    video: `${media}/${id}.mp4`,
    poster: `${media}/${id}.jpg`,
    prefab: depth <= 1,
    depth,
    choices: choices.map((c) => ({
      id: c.id,
      label: c.label,
      hint: c.hint,
      nextClipId: c.next,
    })),
  };
}

export const LEARNING_SLUGS = [
  "logic-machine",
  "meaning-of-pi",
  "pythagoras",
  "science-method",
  "earth-carbon",
  "deep-space",
] as const;

export const BUNDLED_SERIES: Series[] = [
  {
    id: "logic-machine",
    title: "机器怎么分工",
    subtitle: "并行计算的老电影，用来理解后来的大模型训练",
    tag: "计算思维",
    author: "TRW / 公开域",
    cover: withBase("/media/series/logic-machine/poster.jpg"),
    startClipId: "start",
    source: "bundled",
    clips: {
      start: clip("start", "机器怎么分工", "一台机器要同时办很多事，不能只靠一条流水线。先看它怎么把工作拆开。", "logic-machine", 0, [
        { id: "a", label: "看并行怎么拆活", hint: "不是更快的一个人", next: "branch-a" },
        { id: "b", label: "看单元怎么通信", hint: "没有通道就散了", next: "branch-b" },
        { id: "c", label: "看它怎样像网络", hint: "通向后来的训练", next: "branch-c" },
      ]),
      "branch-a": clip("branch-a", "并行而不是排队", "同一份活可以分给许多单元一起做。", "logic-machine", 1, [
        { id: "a1", label: "再看通信", hint: "拆开之后怎么递", next: "branch-b" },
        { id: "a2", label: "再看网络", hint: "连起来以后", next: "branch-c" },
        { id: "a3", label: "回到片头", hint: "重看分工", next: "start" },
      ]),
      "branch-b": clip("branch-b", "单元之间怎么通信", "拆开还不够，单元必须能把中间结果递出去。", "logic-machine", 1, [
        { id: "b1", label: "回去看并行", hint: "先拆再递", next: "branch-a" },
        { id: "b2", label: "看网络直觉", hint: "连成一张网", next: "branch-c" },
        { id: "b3", label: "回到片头", hint: "重看分工", next: "start" },
      ]),
      "branch-c": clip("branch-c", "为什么这像后来的网络", "把许多处理单元连起来，就接近一张可扩展的网。", "logic-machine", 1, [
        { id: "c1", label: "并行怎么拆", hint: "回到分工", next: "branch-a" },
        { id: "c2", label: "通信怎么走", hint: "回到通道", next: "branch-b" },
        { id: "c3", label: "回到片头", hint: "重看现场", next: "start" },
      ]),
    },
  },
  {
    id: "meaning-of-pi",
    title: "π 是一种比",
    subtitle: "1949 年教学片：先量，再谈符号",
    tag: "数学",
    author: "Coronet / 公开域",
    cover: withBase("/media/series/meaning-of-pi/poster.jpg"),
    startClipId: "start",
    source: "bundled",
    clips: {
      start: clip("start", "π 是一种比", "圆周和直径为什么总是同一个比？先把 π 看成测量。", "meaning-of-pi", 0, [
        { id: "a", label: "看圆怎样出现在干活里", hint: "轮子和齿轮", next: "branch-a" },
        { id: "b", label: "自己验一次 π", hint: "量了再除", next: "branch-b" },
        { id: "c", label: "问为什么需要这个数", hint: "弯曲变成可算", next: "branch-c" },
      ]),
      "branch-a": clip("branch-a", "用圆去量世界", "轮子、齿轮、圆弧，都在重复同一条比。", "meaning-of-pi", 1, [
        { id: "a1", label: "去动手验", hint: "量周长和直径", next: "branch-b" },
        { id: "a2", label: "问它为何必要", hint: "没有比就写不出圆", next: "branch-c" },
        { id: "a3", label: "回到片头", hint: "重看定义现场", next: "start" },
      ]),
      "branch-b": clip("branch-b", "自己验一次 π", "量周长、量直径，相除。数学结论要经得起动手。", "meaning-of-pi", 1, [
        { id: "b1", label: "看它在工业里", hint: "圆在干活", next: "branch-a" },
        { id: "b2", label: "问为何需要它", hint: "弯曲如何入算", next: "branch-c" },
        { id: "b3", label: "回到片头", hint: "重看比", next: "start" },
      ]),
      "branch-c": clip("branch-c", "为什么需要这个数", "π 不是装饰，是把弯曲变成可算。", "meaning-of-pi", 1, [
        { id: "c1", label: "看圆在干活", hint: "先现场", next: "branch-a" },
        { id: "c2", label: "自己再量一次", hint: "动手", next: "branch-b" },
        { id: "c3", label: "回到片头", hint: "重看比", next: "start" },
      ]),
    },
  },
  {
    id: "pythagoras",
    title: "直角上的面积",
    subtitle: "NASA / Caltech 教学片：勾股从图形里长出来",
    tag: "数学",
    author: "Project Mathematics!",
    cover: withBase("/media/series/pythagoras/poster.jpg"),
    startClipId: "start",
    source: "bundled",
    clips: {
      start: clip("start", "直角上的面积", "斜边上的正方形，为什么等于两条直角边上的正方形之和？", "pythagoras", 0, [
        { id: "a", label: "用面积去证", hint: "三个正方形", next: "branch-a" },
        { id: "b", label: "换一种拼接", hint: "同一事实多种摆法", next: "branch-b" },
        { id: "c", label: "看公式怎样出来", hint: "图形说完再写", next: "branch-c" },
      ]),
      "branch-a": clip("branch-a", "用面积去证", "把三个正方形摆在直角三角形上。", "pythagoras", 1, [
        { id: "a1", label: "换拼接", hint: "另一种证明", next: "branch-b" },
        { id: "a2", label: "落到公式", hint: "图形之后的一行", next: "branch-c" },
        { id: "a3", label: "回到片头", hint: "重看问题", next: "start" },
      ]),
      "branch-b": clip("branch-b", "换一种拼接", "同样的块，另一种拼法。", "pythagoras", 1, [
        { id: "b1", label: "回到面积证", hint: "第一种摆法", next: "branch-a" },
        { id: "b2", label: "看公式出场", hint: "a²+b²=c²", next: "branch-c" },
        { id: "b3", label: "回到片头", hint: "重看问题", next: "start" },
      ]),
      "branch-c": clip("branch-c", "公式从图形里出来", "a² + b² = c² 是正方形面积说完以后留下的一行。", "pythagoras", 1, [
        { id: "c1", label: "面积证", hint: "先图形", next: "branch-a" },
        { id: "c2", label: "另一种拼", hint: "再换摆法", next: "branch-b" },
        { id: "c3", label: "回到片头", hint: "重看问题", next: "start" },
      ]),
    },
  },
  {
    id: "science-method",
    title: "科学怎么问",
    subtitle: "1957 哈佛 / WGBH 公开课：观察、理论和纠错",
    tag: "科学方法",
    author: "NET / 公开域",
    cover: withBase("/media/series/science-method/poster.jpg"),
    startClipId: "start",
    source: "bundled",
    clips: {
      start: clip("start", "地球是行星吗", "常识说太阳升起，证据说地球在走。", "science-method", 0, [
        { id: "a", label: "看新物理怎样出生", hint: "旧图景让位", next: "branch-a" },
        { id: "b", label: "问原子看得见吗", hint: "看不见也能研究", next: "branch-b" },
        { id: "c", label: "问科学为何管用", hint: "程序允许被打脸", next: "branch-c" },
      ]),
      "branch-a": clip("branch-a", "新物理怎么出生", "旧图景撑不住新观察时，理论才肯让位。", "science-method", 1, [
        { id: "a1", label: "问原子实在吗", hint: "看不见的对象", next: "branch-b" },
        { id: "a2", label: "问方法为何管用", hint: "能纠错", next: "branch-c" },
        { id: "a3", label: "回到片头", hint: "重看地球", next: "start" },
      ]),
      "branch-b": clip("branch-b", "原子看得见吗", "看不见的东西，怎样仍然算科学对象？", "science-method", 1, [
        { id: "b1", label: "理论如何让位", hint: "新物理", next: "branch-a" },
        { id: "b2", label: "方法为何管用", hint: "纠错程序", next: "branch-c" },
        { id: "b3", label: "回到片头", hint: "重看观察", next: "start" },
      ]),
      "branch-c": clip("branch-c", "科学为什么管用", "方法能纠错，结论才能累积。", "science-method", 1, [
        { id: "c1", label: "新物理出生", hint: "理论让位", next: "branch-a" },
        { id: "c2", label: "原子实在吗", hint: "实验逼问", next: "branch-b" },
        { id: "c3", label: "回到片头", hint: "重看问题", next: "start" },
      ]),
    },
  },
  {
    id: "earth-carbon",
    title: "地球在记账",
    subtitle: "NASA：碳季节和水循环",
    tag: "地球科学",
    author: "NASA / 公开域",
    cover: withBase("/media/series/earth-carbon/poster.jpg"),
    startClipId: "start",
    source: "bundled",
    clips: {
      start: clip("start", "植物在吞碳", "夏天陆地变绿，空气里的二氧化碳跟着降。", "earth-carbon", 0, [
        { id: "a", label: "看水在地球上怎么走", hint: "蒸发到径流", next: "branch-a" },
        { id: "b", label: "看云和雨从哪来", hint: "水没有消失", next: "branch-b" },
        { id: "c", label: "看整颗星球的循环", hint: "同一双卫星眼睛", next: "branch-c" },
      ]),
      "branch-a": clip("branch-a", "水在地球上怎么走", "蒸发、云、雨、径流。水循环把能量和物质一起搬。", "earth-carbon", 1, [
        { id: "a1", label: "云和雨", hint: "下一段水账", next: "branch-b" },
        { id: "a2", label: "整颗星球", hint: "系统和碳连上", next: "branch-c" },
        { id: "a3", label: "回到片头", hint: "重看吞碳", next: "start" },
      ]),
      "branch-b": clip("branch-b", "云和雨从哪来", "水离开地面以后，并没有消失。", "earth-carbon", 1, [
        { id: "b1", label: "水怎么走", hint: "循环全图", next: "branch-a" },
        { id: "b2", label: "星球尺度", hint: "系统和碳", next: "branch-c" },
        { id: "b3", label: "回到片头", hint: "重看碳", next: "start" },
      ]),
      "branch-c": clip("branch-c", "整颗星球的循环", "同一套卫星眼睛，在记不同的账。", "earth-carbon", 1, [
        { id: "c1", label: "水循环", hint: "先看水", next: "branch-a" },
        { id: "c2", label: "云和雨", hint: "水还回来", next: "branch-b" },
        { id: "c3", label: "回到片头", hint: "重看碳", next: "start" },
      ]),
    },
  },
  {
    id: "deep-space",
    title: "深空怎么被看见",
    subtitle: "NASA：星云、双星行星、中子星、太阳观测史",
    tag: "天体物理",
    author: "NASA / 公开域",
    cover: withBase("/media/series/deep-space/poster.jpg"),
    startClipId: "start",
    source: "bundled",
    clips: {
      start: clip("start", "一座气体的山", "哈勃拍到的不是明信片，是正在被紫外线雕刻的星云。", "deep-space", 0, [
        { id: "a", label: "看两颗太阳的行星", hint: "开普勒-47", next: "branch-a" },
        { id: "b", label: "看中子星相撞", hint: "光和引力波", next: "branch-b" },
        { id: "c", label: "看我们怎样看见太阳", hint: "工具一换脸就变", next: "branch-c" },
      ]),
      "branch-a": clip("branch-a", "两颗太阳的行星", "开普勒找到绕两颗恒星走的行星。", "deep-space", 1, [
        { id: "a1", label: "中子星相撞", hint: "下一种信号", next: "branch-b" },
        { id: "a2", label: "太阳怎么被看见", hint: "观测史", next: "branch-c" },
        { id: "a3", label: "回到片头", hint: "重看星云", next: "start" },
      ]),
      "branch-b": clip("branch-b", "中子星撞上以后", "光和引力波一起出门。", "deep-space", 1, [
        { id: "b1", label: "双星行星", hint: "另一种轨道", next: "branch-a" },
        { id: "b2", label: "太阳观测", hint: "工具史", next: "branch-c" },
        { id: "b3", label: "回到片头", hint: "重看星云", next: "start" },
      ]),
      "branch-c": clip("branch-c", "我们怎样看见太阳", "从地面影子到日夜不停的卫星眼睛。", "deep-space", 1, [
        { id: "c1", label: "双星行星", hint: "开普勒", next: "branch-a" },
        { id: "c2", label: "中子星相撞", hint: "多信使", next: "branch-b" },
        { id: "c3", label: "回到片头", hint: "重看星云", next: "start" },
      ]),
    },
  },
];
