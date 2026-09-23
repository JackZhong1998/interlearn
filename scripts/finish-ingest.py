#!/usr/bin/env python3
"""Resume-safe cuts from local caches. Does not delete finished series."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

PROJ = Path("/cursor/stores/bc-01a0c9f7-1b4c-7341-886f-a0ee86592e93/media/interlearn/series")
APP = Path("/agent/interlearn/public/media/series")
SELF = Path("/cursor/stores/self/media/interlearn")
SRC = Path("/tmp/ingest-src")

REMAINING = [
    {
        "series": "earth-carbon",
        "id": "branch-a",
        "title": "水在地球上怎么走",
        "script": "蒸发、云、雨、径流。水循环把能量和物质一起搬。碳账和水账是连着的。",
        "local": SRC / "water-cycle.ogv",
        "ss": 40,
        "t": 16,
        "license": "Public domain (NASA)",
        "source": "Earth's Water Cycle, NASA/GSFC. https://commons.wikimedia.org/wiki/File:Earth%27s_Water_Cycle.ogv",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Earth%27s_Water_Cycle.ogv",
    },
    {
        "series": "earth-carbon",
        "id": "branch-b",
        "title": "云和雨从哪来",
        "script": "水离开地面以后，并没有消失。下一镜看它怎样被大气托住，再还回来。",
        "local": SRC / "water-cycle.ogv",
        "ss": 120,
        "t": 16,
        "license": "Public domain (NASA)",
        "source": "Earth's Water Cycle, NASA/GSFC.",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Earth%27s_Water_Cycle.ogv",
    },
    {
        "series": "earth-carbon",
        "id": "branch-c",
        "title": "整颗星球的循环",
        "script": "把水圈看完，再回到碳：同一套卫星眼睛，在记不同的账。系统科学从这里起步。",
        "local": SRC / "water-cycle.ogv",
        "ss": 220,
        "t": 16,
        "license": "Public domain (NASA)",
        "source": "Earth's Water Cycle, NASA/GSFC.",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Earth%27s_Water_Cycle.ogv",
    },
    {
        "series": "deep-space",
        "id": "start",
        "title": "一座气体的山",
        "script": "哈勃拍到的不是风景明信片，是正在被紫外线雕刻的星云。先看现场，再选你要追的问题。",
        "local": SRC / "mystic.webm",
        "ss": 8,
        "t": 16,
        "license": "Public domain (NASA SVS)",
        "source": "Hubble Inside the Image: Mystic Mountain, NASA SVS 14252. https://svs.gsfc.nasa.gov/14252",
        "url": "https://svs.gsfc.nasa.gov/vis/a010000/a014200/a014252/14252_MYSTIC_VERT_MP4.webm",
    },
    {
        "series": "deep-space",
        "id": "branch-a",
        "title": "两颗太阳的行星",
        "script": "开普勒找到绕两颗恒星走的行星。轨道不再是小学课本里的一个圆。",
        "local": SRC / "two-suns.ogv",
        "ss": 20,
        "t": 16,
        "license": "Public domain (NASA)",
        "source": "Circling Two Suns, NASA/GSFC. https://commons.wikimedia.org/wiki/File:Circling_Two_Suns.ogv",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/99/Circling_Two_Suns.ogv",
    },
    {
        "series": "deep-space",
        "id": "branch-b",
        "title": "中子星撞上以后",
        "script": "两颗中子星相撞，光和引力波一起出门。天体物理用同一次事件校准多种信号。",
        "local": SRC / "crash.ogv",
        "ss": 20,
        "t": 16,
        "license": "Public domain (NASA)",
        "source": "Crash and Burst, NASA/GSFC. https://commons.wikimedia.org/wiki/File:Crash_and_Burst.ogv",
        "url": "https://upload.wikimedia.org/wikipedia/commons/0/06/Crash_and_Burst.ogv",
    },
    {
        "series": "deep-space",
        "id": "branch-c",
        "title": "我们怎样看见太阳",
        "script": "从地面影子到日夜不停的卫星眼睛。观测工具一换，太阳就换一张脸。",
        "local": SRC / "sun.m4v",
        "ss": 5,
        "t": 16,
        "license": "Public domain (NASA SVS)",
        "source": "From Stonehenge to STEREO, NASA SVS 10720. https://svs.gsfc.nasa.gov/10720",
        "url": "https://svs.gsfc.nasa.gov/vis/a010000/a010700/a010720/G2011-010_How_We_See_the_Sun_ipod_lg.m4v",
    },
]

LICENSES = {
    "logic-machine": [
        {"id": "start", "title": "机器怎么分工", "license": "Public Domain", "source": "All About Polymorphics (1959), Thompson Ramo Wooldridge. Internet Archive. https://archive.org/details/AllAboutPolymorphics", "url": "https://archive.org/download/AllAboutPolymorphics/AllAboutPolymorphics_512kb.mp4"},
        {"id": "branch-a", "title": "并行而不是排队", "license": "Public Domain", "source": "All About Polymorphics (1959), Internet Archive.", "url": "https://archive.org/download/AllAboutPolymorphics/AllAboutPolymorphics_512kb.mp4"},
        {"id": "branch-b", "title": "单元之间怎么通信", "license": "Public Domain", "source": "All About Polymorphics (1959), Internet Archive.", "url": "https://archive.org/download/AllAboutPolymorphics/AllAboutPolymorphics_512kb.mp4"},
        {"id": "branch-c", "title": "为什么这像后来的网络", "license": "Public Domain", "source": "All About Polymorphics (1959), Internet Archive.", "url": "https://archive.org/download/AllAboutPolymorphics/AllAboutPolymorphics_512kb.mp4"},
    ],
    "meaning-of-pi": [
        {"id": "start", "title": "π 是一种比", "license": "Public Domain Mark 1.0", "source": "Meaning of Pi (1949), Coronet Instructional Films. https://archive.org/details/MeaningOfPi", "url": "https://archive.org/download/MeaningOfPi/MeaningOfPi.mp4"},
        {"id": "branch-a", "title": "用圆去量世界", "license": "Public Domain Mark 1.0", "source": "Meaning of Pi (1949), Coronet Instructional Films.", "url": "https://archive.org/download/MeaningOfPi/MeaningOfPi.mp4"},
        {"id": "branch-b", "title": "自己验一次 π", "license": "Public Domain Mark 1.0", "source": "Meaning of Pi (1949), Coronet Instructional Films.", "url": "https://archive.org/download/MeaningOfPi/MeaningOfPi.mp4"},
        {"id": "branch-c", "title": "为什么需要这个数", "license": "Public Domain Mark 1.0", "source": "Meaning of Pi (1949), Coronet Instructional Films.", "url": "https://archive.org/download/MeaningOfPi/MeaningOfPi.mp4"},
    ],
    "pythagoras": [
        {"id": "start", "title": "直角上的面积", "license": "NASA / Project Mathematics! (Caltech), U.S. government educational release; see Archive.org item.", "source": "Project Mathematics!: Theorem of Pythagoras (1988). https://archive.org/details/theorem_of_pythagoras", "url": "https://archive.org/download/theorem_of_pythagoras/theorem_of_pythagoras_512kb.mp4"},
        {"id": "branch-a", "title": "用面积去证", "license": "NASA / Project Mathematics! (Caltech)", "source": "Project Mathematics!: Theorem of Pythagoras (1988).", "url": "https://archive.org/download/theorem_of_pythagoras/theorem_of_pythagoras_512kb.mp4"},
        {"id": "branch-b", "title": "换一种拼接", "license": "NASA / Project Mathematics! (Caltech)", "source": "Project Mathematics!: Theorem of Pythagoras (1988).", "url": "https://archive.org/download/theorem_of_pythagoras/theorem_of_pythagoras_512kb.mp4"},
        {"id": "branch-c", "title": "公式从图形里出来", "license": "NASA / Project Mathematics! (Caltech)", "source": "Project Mathematics!: Theorem of Pythagoras (1988).", "url": "https://archive.org/download/theorem_of_pythagoras/theorem_of_pythagoras_512kb.mp4"},
    ],
    "science-method": [
        {"id": "start", "title": "地球是行星吗", "license": "Public Domain Mark 1.0 (NET)", "source": "Of Science and Scientists 04, WGBH / Harvard / NET (1957). https://archive.org/details/of-science-and-scientists", "url": "https://archive.org/download/of-science-and-scientists/Of%20Science%20And%20Scientists%2004%20Is%20The%20Earth%20A%20Planet.mp4"},
        {"id": "branch-a", "title": "新物理怎么出生", "license": "Public Domain Mark 1.0 (NET)", "source": "Of Science and Scientists 05, WGBH / Harvard / NET (1957).", "url": "https://archive.org/download/of-science-and-scientists/Of%20Science%20And%20Scientists%2005%20Birth%20Of%20A%20New%20Physics.mp4"},
        {"id": "branch-b", "title": "原子看得见吗", "license": "Public Domain Mark 1.0 (NET)", "source": "Of Science and Scientists 16, WGBH / Harvard / NET (1957).", "url": "https://archive.org/download/of-science-and-scientists/Of%20Science%20And%20Scientists%2016%20Are%20Atoms%20Real.mp4"},
        {"id": "branch-c", "title": "科学为什么管用", "license": "Public Domain Mark 1.0 (NET)", "source": "Of Science and Scientists 22, WGBH / Harvard / NET (1957).", "url": "https://archive.org/download/of-science-and-scientists/Of%20Science%20And%20Scientists%2022%20Why%20Science%20Works.mp4"},
    ],
    "earth-carbon": [
        {"id": "start", "title": "植物在吞碳", "license": "Public domain (NASA)", "source": "Carbonivores, NASA/GSFC. https://commons.wikimedia.org/wiki/File:Carbonivores.ogv", "url": "https://upload.wikimedia.org/wikipedia/commons/2/2b/Carbonivores.ogv"},
        {"id": "branch-a", "title": "水在地球上怎么走", "license": "Public domain (NASA)", "source": "Earth's Water Cycle, NASA/GSFC. https://commons.wikimedia.org/wiki/File:Earth%27s_Water_Cycle.ogv", "url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Earth%27s_Water_Cycle.ogv"},
        {"id": "branch-b", "title": "云和雨从哪来", "license": "Public domain (NASA)", "source": "Earth's Water Cycle, NASA/GSFC.", "url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Earth%27s_Water_Cycle.ogv"},
        {"id": "branch-c", "title": "整颗星球的循环", "license": "Public domain (NASA)", "source": "Earth's Water Cycle, NASA/GSFC.", "url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Earth%27s_Water_Cycle.ogv"},
    ],
    "deep-space": [
        {"id": "start", "title": "一座气体的山", "license": "Public domain (NASA SVS)", "source": "Hubble Inside the Image: Mystic Mountain, NASA SVS 14252. https://svs.gsfc.nasa.gov/14252", "url": "https://svs.gsfc.nasa.gov/vis/a010000/a014200/a014252/14252_MYSTIC_VERT_MP4.webm"},
        {"id": "branch-a", "title": "两颗太阳的行星", "license": "Public domain (NASA)", "source": "Circling Two Suns, NASA/GSFC. https://commons.wikimedia.org/wiki/File:Circling_Two_Suns.ogv", "url": "https://upload.wikimedia.org/wikipedia/commons/9/99/Circling_Two_Suns.ogv"},
        {"id": "branch-b", "title": "中子星撞上以后", "license": "Public domain (NASA)", "source": "Crash and Burst, NASA/GSFC. https://commons.wikimedia.org/wiki/File:Crash_and_Burst.ogv", "url": "https://upload.wikimedia.org/wikipedia/commons/0/06/Crash_and_Burst.ogv"},
        {"id": "branch-c", "title": "我们怎样看见太阳", "license": "Public domain (NASA SVS)", "source": "From Stonehenge to STEREO, NASA SVS 10720. https://svs.gsfc.nasa.gov/10720", "url": "https://svs.gsfc.nasa.gov/vis/a010000/a010700/a010720/G2011-010_How_We_See_the_Sun_ipod_lg.m4v"},
    ],
}


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def duration(mp4: Path) -> float:
    if not mp4.exists() or mp4.stat().st_size < 80_000:
        return 0.0
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp4)],
        text=True,
    ).strip()
    try:
        return float(out)
    except ValueError:
        return 0.0


def cut(src: Path, ss: float, t: float, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    run([
        "ffmpeg", "-y", "-ss", str(ss), "-t", str(t), "-i", str(src),
        "-vf", "scale=720:-2",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "26",
        "-c:a", "aac", "-ac", "1", "-b:a", "96k",
        "-movflags", "+faststart",
        str(dest),
    ])


def poster(mp4: Path, jpg: Path) -> None:
    run(["ffmpeg", "-y", "-i", str(mp4), "-ss", "1", "-vframes", "1", "-q:v", "3", str(jpg)])


def publish(slug: str, cid: str) -> None:
    out_dir = PROJ / slug
    app_dir = APP / slug
    app_dir.mkdir(parents=True, exist_ok=True)
    SELF.joinpath("videos").mkdir(parents=True, exist_ok=True)
    SELF.joinpath("scripts").mkdir(parents=True, exist_ok=True)
    SELF.joinpath("posters").mkdir(parents=True, exist_ok=True)
    for name in (f"{cid}.mp4", f"{cid}.jpg", f"{cid}.txt"):
        src = out_dir / name
        if src.exists():
            (app_dir / name).write_bytes(src.read_bytes())
    if cid == "start" and (out_dir / "poster.jpg").exists():
        (app_dir / "poster.jpg").write_bytes((out_dir / "poster.jpg").read_bytes())
        (SELF / "posters" / f"{slug}.jpg").write_bytes((out_dir / "poster.jpg").read_bytes())
    if (out_dir / f"{cid}.mp4").exists():
        (SELF / "videos" / f"{slug}-{cid}.mp4").write_bytes((out_dir / f"{cid}.mp4").read_bytes())
    if (out_dir / f"{cid}.txt").exists():
        (SELF / "scripts" / f"{slug}-{cid}.txt").write_text((out_dir / f"{cid}.txt").read_text(encoding="utf-8"), encoding="utf-8")


def main() -> None:
    for clip in REMAINING:
        slug, cid = clip["series"], clip["id"]
        mp4 = PROJ / slug / f"{cid}.mp4"
        if duration(mp4) >= 8:
            print("SKIP", slug, cid, flush=True)
            publish(slug, cid)
            continue
        print("CUT", slug, cid, flush=True)
        cut(clip["local"], clip["ss"], clip["t"], mp4)
        if duration(mp4) < 8:
            raise SystemExit(f"cut too short: {slug}/{cid} {duration(mp4)}")
        poster(mp4, PROJ / slug / f"{cid}.jpg")
        if cid == "start":
            poster(mp4, PROJ / slug / "poster.jpg")
        txt = f"{clip['title']}\n{clip['script']}\n\nLicense: {clip['license']}\nSource: {clip['source']}\n"
        (PROJ / slug / f"{cid}.txt").write_text(txt, encoding="utf-8")
        publish(slug, cid)
    for slug, rows in LICENSES.items():
        payload = json.dumps(rows, ensure_ascii=False, indent=2)
        (PROJ / slug).mkdir(parents=True, exist_ok=True)
        (APP / slug).mkdir(parents=True, exist_ok=True)
        (PROJ / slug / "license.json").write_text(payload, encoding="utf-8")
        (APP / slug / "license.json").write_text(payload, encoding="utf-8")
    print("done")


if __name__ == "__main__":
    main()
