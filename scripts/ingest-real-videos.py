#!/usr/bin/env python3
"""Download openly licensed educational films and cut real clips (not still zooms)."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

PROJ = Path("/cursor/stores/bc-01a0c9f7-1b4c-7341-886f-a0ee86592e93/media/interlearn/series")
APP = Path("/agent/interlearn/public/media/series")
SELF = Path("/cursor/stores/self/media/interlearn")

# Each clip is a real excerpt from an openly licensed educational film.
CLIPS = [
    # computing — All About Polymorphics (PD)
    {
        "series": "logic-machine",
        "id": "start",
        "title": "机器怎么分工",
        "script": "一台机器要同时办很多事，不能只靠一条流水线。先看它怎么把工作拆开。看完选一条，继续拆计算是怎么发生的。",
        "url": "https://archive.org/download/AllAboutPolymorphics/AllAboutPolymorphics_512kb.mp4",
        "ss": 18,
        "t": 16,
        "license": "Public Domain",
        "source": "All About Polymorphics (1959), Thompson Ramo Wooldridge. Internet Archive. https://archive.org/details/AllAboutPolymorphics",
    },
    {
        "series": "logic-machine",
        "id": "branch-a",
        "title": "并行而不是排队",
        "script": "同一份活可以分给许多单元一起做。这就是后来网络和并行计算的直觉：不是更快的一个人，是更多人同时算。",
        "url": "https://archive.org/download/AllAboutPolymorphics/AllAboutPolymorphics_512kb.mp4",
        "ss": 55,
        "t": 16,
        "license": "Public Domain",
        "source": "All About Polymorphics (1959), Internet Archive.",
    },
    {
        "series": "logic-machine",
        "id": "branch-b",
        "title": "单元之间怎么通信",
        "script": "拆开还不够，单元必须能把中间结果递出去。没有通道，并行只是一堆孤立的计算器。",
        "url": "https://archive.org/download/AllAboutPolymorphics/AllAboutPolymorphics_512kb.mp4",
        "ss": 110,
        "t": 16,
        "license": "Public Domain",
        "source": "All About Polymorphics (1959), Internet Archive.",
    },
    {
        "series": "logic-machine",
        "id": "branch-c",
        "title": "为什么这像后来的网络",
        "script": "把许多处理单元连起来，就接近一张可扩展的网。今天的大模型训练，走的还是这条分工和通信的老路。",
        "url": "https://archive.org/download/AllAboutPolymorphics/AllAboutPolymorphics_512kb.mp4",
        "ss": 170,
        "t": 16,
        "license": "Public Domain",
        "source": "All About Polymorphics (1959), Internet Archive.",
    },
    # math — Meaning of Pi
    {
        "series": "meaning-of-pi",
        "id": "start",
        "title": "π 是一种比",
        "script": "圆周和直径为什么总是同一个比？先把 π 看成测量，而不是符号。看完选一条往下量。",
        "url": "https://archive.org/download/MeaningOfPi/MeaningOfPi.mp4",
        "ss": 40,
        "t": 16,
        "license": "Public Domain Mark 1.0",
        "source": "Meaning of Pi (1949), Coronet Instructional Films. https://archive.org/details/MeaningOfPi",
    },
    {
        "series": "meaning-of-pi",
        "id": "branch-a",
        "title": "用圆去量世界",
        "script": "轮子、齿轮、圆弧，都在重复同一条比。π 先出现在干活的地方，再进入公式。",
        "url": "https://archive.org/download/MeaningOfPi/MeaningOfPi.mp4",
        "ss": 95,
        "t": 16,
        "license": "Public Domain Mark 1.0",
        "source": "Meaning of Pi (1949), Coronet Instructional Films.",
    },
    {
        "series": "meaning-of-pi",
        "id": "branch-b",
        "title": "自己验一次 π",
        "script": "量周长、量直径，相除。误差会在，但比会靠近同一个数。数学结论要经得起动手。",
        "url": "https://archive.org/download/MeaningOfPi/MeaningOfPi.mp4",
        "ss": 160,
        "t": 16,
        "license": "Public Domain Mark 1.0",
        "source": "Meaning of Pi (1949), Coronet Instructional Films.",
    },
    {
        "series": "meaning-of-pi",
        "id": "branch-c",
        "title": "为什么需要这个数",
        "script": "没有这个比，圆上的长度就写不进计算。π 不是装饰，是把弯曲变成可算。",
        "url": "https://archive.org/download/MeaningOfPi/MeaningOfPi.mp4",
        "ss": 230,
        "t": 16,
        "license": "Public Domain Mark 1.0",
        "source": "Meaning of Pi (1949), Coronet Instructional Films.",
    },
    # math — Pythagoras / Project Mathematics! (NASA/Caltech)
    {
        "series": "pythagoras",
        "id": "start",
        "title": "直角上的面积",
        "script": "斜边上的正方形，为什么等于两条直角边上的正方形之和？先看几何，再选一种证明走法。",
        "url": "https://archive.org/download/theorem_of_pythagoras/theorem_of_pythagoras_512kb.mp4",
        "ss": 50,
        "t": 16,
        "license": "NASA / Project Mathematics! (Caltech), U.S. government educational release; see Archive.org item.",
        "source": "Project Mathematics!: Theorem of Pythagoras (1988). https://archive.org/details/theorem_of_pythagoras",
    },
    {
        "series": "pythagoras",
        "id": "branch-a",
        "title": "用面积去证",
        "script": "把三个正方形摆在直角三角形上。面积在动，等式就从图形里长出来，不必先背公式。",
        "url": "https://archive.org/download/theorem_of_pythagoras/theorem_of_pythagoras_512kb.mp4",
        "ss": 140,
        "t": 16,
        "license": "NASA / Project Mathematics! (Caltech)",
        "source": "Project Mathematics!: Theorem of Pythagoras (1988).",
    },
    {
        "series": "pythagoras",
        "id": "branch-b",
        "title": "换一种拼接",
        "script": "同样的块，另一种拼法。证明往往不是一条路，是同一件事实的多种摆法。",
        "url": "https://archive.org/download/theorem_of_pythagoras/theorem_of_pythagoras_512kb.mp4",
        "ss": 240,
        "t": 16,
        "license": "NASA / Project Mathematics! (Caltech)",
        "source": "Project Mathematics!: Theorem of Pythagoras (1988).",
    },
    {
        "series": "pythagoras",
        "id": "branch-c",
        "title": "公式从图形里出来",
        "script": "a² + b² = c² 不是先写在纸上的咒语。它是正方形面积说完以后，留下的那一行。",
        "url": "https://archive.org/download/theorem_of_pythagoras/theorem_of_pythagoras_512kb.mp4",
        "ss": 360,
        "t": 16,
        "license": "NASA / Project Mathematics! (Caltech)",
        "source": "Project Mathematics!: Theorem of Pythagoras (1988).",
    },
    # scientific method — Harvard / WGBH NET, PD
    {
        "series": "science-method",
        "id": "start",
        "title": "地球是行星吗",
        "script": "常识说太阳升起，证据说地球在走。科学不是更响的意见，是能对质的观察。看完选一条方法往下走。",
        "url": "https://archive.org/download/of-science-and-scientists/Of%20Science%20And%20Scientists%2004%20Is%20The%20Earth%20A%20Planet.mp4",
        "ss": 80,
        "t": 16,
        "license": "Public Domain Mark 1.0 (NET)",
        "source": "Of Science and Scientists 04, WGBH / Harvard / NET (1957). https://archive.org/details/of-science-and-scientists",
    },
    {
        "series": "science-method",
        "id": "branch-a",
        "title": "新物理怎么出生",
        "script": "旧图景撑不住新观察时，理论才肯让位。下一刀看：它让位时到底改了什么。",
        "url": "https://archive.org/download/of-science-and-scientists/Of%20Science%20And%20Scientists%2005%20Birth%20Of%20A%20New%20Physics.mp4",
        "ss": 90,
        "t": 16,
        "license": "Public Domain Mark 1.0 (NET)",
        "source": "Of Science and Scientists 05, WGBH / Harvard / NET (1957).",
    },
    {
        "series": "science-method",
        "id": "branch-b",
        "title": "原子看得见吗",
        "script": "看不见的东西，怎样仍然算科学对象？看他们怎样用实验逼问实在，而不是用定义结束讨论。",
        "url": "https://archive.org/download/of-science-and-scientists/Of%20Science%20And%20Scientists%2016%20Are%20Atoms%20Real.mp4",
        "ss": 90,
        "t": 16,
        "license": "Public Domain Mark 1.0 (NET)",
        "source": "Of Science and Scientists 16, WGBH / Harvard / NET (1957).",
    },
    {
        "series": "science-method",
        "id": "branch-c",
        "title": "科学为什么管用",
        "script": "方法能纠错，结论才能累积。不是科学家更聪明，是程序允许自己被打脸。",
        "url": "https://archive.org/download/of-science-and-scientists/Of%20Science%20And%20Scientists%2022%20Why%20Science%20Works.mp4",
        "ss": 90,
        "t": 16,
        "license": "Public Domain Mark 1.0 (NET)",
        "source": "Of Science and Scientists 22, WGBH / Harvard / NET (1957).",
    },
    # Earth system — NASA PD
    {
        "series": "earth-carbon",
        "id": "start",
        "title": "植物在吞碳",
        "script": "夏天陆地变绿，空气里的二氧化碳跟着降。碳不是口号，是能看见的季节账。看完选一条继续跟这本账。",
        "url": "https://upload.wikimedia.org/wikipedia/commons/2/2b/Carbonivores.ogv",
        "ss": 2,
        "t": 20,
        "license": "Public domain (NASA)",
        "source": "Carbonivores, NASA/GSFC. https://commons.wikimedia.org/wiki/File:Carbonivores.ogv",
    },
    {
        "series": "earth-carbon",
        "id": "branch-a",
        "title": "水在地球上怎么走",
        "script": "蒸发、云、雨、径流。水循环把能量和物质一起搬。碳账和水账是连着的。",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Earth%27s_Water_Cycle.ogv",
        "ss": 40,
        "t": 16,
        "license": "Public domain (NASA)",
        "source": "Earth's Water Cycle, NASA/GSFC. https://commons.wikimedia.org/wiki/File:Earth%27s_Water_Cycle.ogv",
    },
    {
        "series": "earth-carbon",
        "id": "branch-b",
        "title": "云和雨从哪来",
        "script": "水离开地面以后，并没有消失。下一镜看它怎样被大气托住，再还回来。",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Earth%27s_Water_Cycle.ogv",
        "ss": 120,
        "t": 16,
        "license": "Public domain (NASA)",
        "source": "Earth's Water Cycle, NASA/GSFC.",
    },
    {
        "series": "earth-carbon",
        "id": "branch-c",
        "title": "整颗星球的循环",
        "script": "把水圈看完，再回到碳：同一套卫星眼睛，在记不同的账。系统科学从这里起步。",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Earth%27s_Water_Cycle.ogv",
        "ss": 220,
        "t": 16,
        "license": "Public domain (NASA)",
        "source": "Earth's Water Cycle, NASA/GSFC.",
    },
    # deep space — NASA PD
    {
        "series": "deep-space",
        "id": "start",
        "title": "一座气体的山",
        "script": "哈勃拍到的不是风景明信片，是正在被紫外线雕刻的星云。先看现场，再选你要追的问题。",
        "url": "https://svs.gsfc.nasa.gov/vis/a010000/a014200/a014252/14252_MYSTIC_VERT_MP4.webm",
        "ss": 8,
        "t": 16,
        "license": "Public domain (NASA SVS)",
        "source": "Hubble Inside the Image: Mystic Mountain, NASA SVS 14252. https://svs.gsfc.nasa.gov/14252",
    },
    {
        "series": "deep-space",
        "id": "branch-a",
        "title": "两颗太阳的行星",
        "script": "开普勒找到绕两颗恒星走的行星。轨道不再是小学课本里的一个圆。",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/99/Circling_Two_Suns.ogv",
        "ss": 20,
        "t": 16,
        "license": "Public domain (NASA)",
        "source": "Circling Two Suns, NASA/GSFC. https://commons.wikimedia.org/wiki/File:Circling_Two_Suns.ogv",
    },
    {
        "series": "deep-space",
        "id": "branch-b",
        "title": "中子星撞上以后",
        "script": "两颗中子星相撞，光和引力波一起出门。天体物理用同一次事件校准多种信号。",
        "url": "https://upload.wikimedia.org/wikipedia/commons/0/06/Crash_and_Burst.ogv",
        "ss": 20,
        "t": 16,
        "license": "Public domain (NASA)",
        "source": "Crash and Burst, NASA/GSFC. https://commons.wikimedia.org/wiki/File:Crash_and_Burst.ogv",
    },
    {
        "series": "deep-space",
        "id": "branch-c",
        "title": "我们怎样看见太阳",
        "script": "从地面影子到日夜不停的卫星眼睛。观测工具一换，太阳就换一张脸。",
        "url": "https://svs.gsfc.nasa.gov/vis/a010000/a010700/a010720/G2011-010_How_We_See_the_Sun_ipod_lg.m4v",
        "ss": 5,
        "t": 16,
        "license": "Public domain (NASA SVS)",
        "source": "From Stonehenge to STEREO, NASA SVS 10720. https://svs.gsfc.nasa.gov/10720",
    },
]


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def cut(url: str, ss: float, t: float, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    run([
        "ffmpeg", "-y", "-ss", str(ss), "-t", str(t), "-i", url,
        "-vf", "scale=720:-2",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "26",
        "-c:a", "aac", "-ac", "1", "-b:a", "96k",
        "-movflags", "+faststart",
        str(dest),
    ])


def poster(mp4: Path, jpg: Path) -> None:
    run([
        "ffmpeg", "-y", "-i", str(mp4), "-ss", "1", "-vframes", "1",
        "-q:v", "3", str(jpg),
    ])


def duration(mp4: Path) -> float:
    if not mp4.exists() or mp4.stat().st_size < 80_000:
        return 0.0
    try:
        out = subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp4)],
            text=True,
        ).strip()
        return float(out)
    except (ValueError, subprocess.CalledProcessError):
        return 0.0


def main() -> None:
    SELF.joinpath("videos").mkdir(parents=True, exist_ok=True)
    SELF.joinpath("scripts").mkdir(parents=True, exist_ok=True)
    SELF.joinpath("posters").mkdir(parents=True, exist_ok=True)
    licenses: dict[str, list] = {}
    for clip in CLIPS:
        slug, cid = clip["series"], clip["id"]
        out_dir = PROJ / slug
        mp4 = out_dir / f"{cid}.mp4"
        if duration(mp4) >= 8:
            print("SKIP", slug, cid, flush=True)
        else:
            print("CUT", slug, cid, flush=True)
            cut(clip["url"], clip["ss"], clip["t"], mp4)
        poster(mp4, out_dir / f"{cid}.jpg")
        if cid == "start":
            poster(mp4, out_dir / "poster.jpg")
        txt = f"{clip['title']}\n{clip['script']}\n\nLicense: {clip['license']}\nSource: {clip['source']}\n"
        (out_dir / f"{cid}.txt").write_text(txt, encoding="utf-8")
        app_dir = APP / slug
        app_dir.mkdir(parents=True, exist_ok=True)
        for name in (f"{cid}.mp4", f"{cid}.jpg", f"{cid}.txt"):
            (app_dir / name).write_bytes((out_dir / name).read_bytes())
        if cid == "start":
            (app_dir / "poster.jpg").write_bytes((out_dir / "poster.jpg").read_bytes())
        (SELF / "videos" / f"{slug}-{cid}.mp4").write_bytes(mp4.read_bytes())
        (SELF / "scripts" / f"{slug}-{cid}.txt").write_text(txt, encoding="utf-8")
        licenses.setdefault(slug, []).append({
            "id": cid,
            "title": clip["title"],
            "license": clip["license"],
            "source": clip["source"],
            "url": clip["url"],
        })
    for slug, rows in licenses.items():
        payload = json.dumps(rows, ensure_ascii=False, indent=2)
        (PROJ / slug / "license.json").write_text(payload, encoding="utf-8")
        (APP / slug / "license.json").write_text(payload, encoding="utf-8")
    print(json.dumps({s: [c["id"] for c in rows] for s, rows in licenses.items()}, indent=2))


if __name__ == "__main__":
    main()
