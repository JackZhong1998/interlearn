#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageEnhance

PROJ = Path("/cursor/stores/bc-01a0c9f7-1b4c-7341-886f-a0ee86592e93/media/interlearn/series")
APP = Path("/agent/interlearn/public/media/series")
SELF = Path("/cursor/stores/self/media/interlearn")
ASSETS = Path("/opt/cursor/artifacts/assets")
FONT = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"

POSTERS = {
    "proof-gap": "series-proof-poster.png",
    "sentence-cut": "series-sentence-poster.png",
    "energy-ledger": "series-energy-poster.png",
    "source-fight": "series-source-poster.png",
    "bug-first": "series-runtime-poster.png",
}

CLIPS = [
    ("proof-gap", "start", "证明卡壳", ["黑板写到一半。中间那一跳过不去。", "选一种拆法，不要再抄下一行。"]),
    ("proof-gap", "branch-a", "先写反面", ["对，先写假如结论不成立。", "看它和假设哪一句打架。"]),
    ("proof-gap", "branch-b", "先找特例", ["先丢一个具体数字进去。", "特例不是证明，是探路灯。"]),
    ("proof-gap", "branch-c", "先拆条件", ["把假设逐条编号。", "没用上的条件，常常就是断点。"]),
    ("sentence-cut", "start", "长难句切开", ["三十个词排成一队，主语还没着落。", "先别翻译。选一种切法。"]),
    ("sentence-cut", "branch-a", "先圈谓语", ["对，先圈真正的谓语。", "谓语一立住，主干才现身。"]),
    ("sentence-cut", "branch-b", "先剥从句", ["能整段拿掉的先用括号括起来。", "剩下那根骨头才是主句。"]),
    ("sentence-cut", "branch-c", "先找连接词", ["and、that、which 是切口。", "先切开，再决定每块在干什么。"]),
    ("energy-ledger", "start", "能量账对不上", ["温度掉得比公式快。能量不会消失。", "账本缺了一行。选一种记账法。"]),
    ("energy-ledger", "branch-a", "先算交换", ["对，先写和对流、辐射、蒸发的交换。", "绝热在桌上不成立。"]),
    ("energy-ledger", "branch-b", "分清热和温度", ["温度是强度量，热是转移的能量。", "漏掉的是乘在后面的因子。"]),
    ("energy-ledger", "branch-c", "先画边界", ["先画谁算系统。", "边界没画清，守恒句是空的。"]),
    ("source-fight", "start", "两份史料打架", ["一份说正午出发，一份说黄昏才走。", "先别站队。选一种读法。"]),
    ("source-fight", "branch-a", "先问写给谁", ["对，先问作者、读者、场合。", "立场是滤镜，滤镜标出来才能比。"]),
    ("source-fight", "branch-b", "先对时空", ["先对齐时间、地点、对象。", "对不上，矛盾可能是假的。"]),
    ("source-fight", "branch-c", "先看缺什么", ["没写的常常比写了的重。", "先列出两边都跳过的问题。"]),
    ("bug-first", "start", "程序先炸了", ["测试红了。手已经去改第 40 行。", "停。先选一步取证。"]),
    ("bug-first", "branch-a", "先读栈顶", ["对，先读最上面那一行。", "下面是来路，不是现场。"]),
    ("bug-first", "branch-b", "先缩复现", ["把输入砍到还能红的最小例子。", "复现稳了，才知道改完算不算修好。"]),
    ("bug-first", "branch-c", "先看中间值", ["打印此刻的值，别猜它是谁。", "看见值，再决定改哪里。"]),
]


def to_poster(src: Path, dest: Path) -> None:
    img = Image.open(src).convert("RGB")
    w, h = img.size
    target = 720 / 1280
    if w / h > target:
        nw = int(h * target)
        left = (w - nw) // 2
        img = img.crop((left, 0, left + nw, h))
    else:
        nh = int(w / target)
        top = (h - nh) // 2
        img = img.crop((0, top, w, top + nh))
    img = img.resize((720, 1280), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, quality=90)


def compose(poster: Path, title: str, lines: list[str], dest: Path) -> None:
    img = Image.open(poster).convert("RGB").resize((720, 1280), Image.Resampling.LANCZOS)
    img = ImageEnhance.Brightness(img).enhance(0.7)
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(740, 1280):
        a = int(220 * (y - 740) / 540)
        draw.line([(0, y), (720, y)], fill=(8, 8, 12, a))
    font_brand = ImageFont.truetype(FONT, 22)
    font_title = ImageFont.truetype(FONT, 40)
    font_body = ImageFont.truetype(FONT, 28)
    draw.text((36, 48), "INTERLEARN · 互动学习", font=font_brand, fill=(255, 255, 255, 200))
    y = 880
    draw.text((36, y), title, font=font_title, fill=(255, 255, 255, 255))
    y += 62
    for line in lines:
        draw.text((36, y), line, font=font_body, fill=(240, 240, 245, 235))
        y += 40
    Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB").save(dest, quality=92)


def render_mp4(card: Path, mp4: Path) -> None:
    mp4.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg", "-y", "-loop", "1", "-i", str(card), "-t", "8",
            "-vf", "zoompan=z='min(zoom+0.0009,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=200:s=720x1280:fps=25",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-crf", "23",
            "-movflags", "+faststart", str(mp4),
        ],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )


def main() -> None:
    for slug, name in POSTERS.items():
        src = ASSETS / name
        for dest_root in (PROJ / slug, APP / slug):
            dest_root.mkdir(parents=True, exist_ok=True)
            to_poster(src, dest_root / "poster.jpg")
            to_poster(src, dest_root / "start.jpg")
            for bid in ("branch-a", "branch-b", "branch-c"):
                to_poster(src, dest_root / f"{bid}.jpg")
        SELF.joinpath("posters").mkdir(parents=True, exist_ok=True)
        to_poster(src, SELF / "posters" / f"{slug}.jpg")

    made = []
    for series, cid, title, lines in CLIPS:
        poster = PROJ / series / f"{cid}.jpg"
        txt = title + "\n" + "\n".join(lines) + "\n"
        (PROJ / series / f"{cid}.txt").write_text(txt, encoding="utf-8")
        (APP / series).mkdir(parents=True, exist_ok=True)
        (APP / series / f"{cid}.txt").write_text(txt, encoding="utf-8")
        SELF.joinpath("scripts").mkdir(parents=True, exist_ok=True)
        (SELF / "scripts" / f"{series}-{cid}.txt").write_text(txt, encoding="utf-8")
        store_mp4 = PROJ / series / f"{cid}.mp4"
        with tempfile.TemporaryDirectory() as td:
            card = Path(td) / "card.jpg"
            compose(poster, title, lines, card)
            render_mp4(card, store_mp4)
        (APP / series / f"{cid}.mp4").write_bytes(store_mp4.read_bytes())
        SELF.joinpath("videos").mkdir(parents=True, exist_ok=True)
        (SELF / "videos" / f"{series}-{cid}.mp4").write_bytes(store_mp4.read_bytes())
        made.append(str(store_mp4))
    print(json.dumps({"made": made}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
