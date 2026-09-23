import type { Teacher } from "@/lib/types";
import { withBase } from "@/lib/base-path";

export const TEACHERS: Teacher[] = [
  {
    id: "female-default",
    name: "林晚",
    gender: "female",
    tag: "默认",
    image: withBase("/media/teachers/teacher-female-default.png"),
  },
  {
    id: "female-elegant",
    name: "苏澄",
    gender: "female",
    tag: "学者",
    image: withBase("/media/teachers/teacher-female-elegant.png"),
  },
  {
    id: "female-casual",
    name: "许安",
    gender: "female",
    tag: "博主",
    image: withBase("/media/teachers/teacher-female-casual.png"),
  },
  {
    id: "male-wealthy",
    name: "沈予",
    gender: "male",
    tag: "高富帅",
    image: withBase("/media/teachers/teacher-male-wealthy.png"),
  },
  {
    id: "male-athletic",
    name: "江澈",
    gender: "male",
    tag: "腹肌",
    image: withBase("/media/teachers/teacher-male-athletic.png"),
  },
  {
    id: "male-scholar",
    name: "顾衡",
    gender: "male",
    tag: "学者",
    image: withBase("/media/teachers/teacher-male-scholar.png"),
  },
  {
    id: "male-artist",
    name: "陈予歌",
    gender: "male",
    tag: "艺术家",
    image: withBase("/media/teachers/teacher-male-artist.png"),
  },
];

export const DEFAULT_TEACHER_ID = "female-default";
