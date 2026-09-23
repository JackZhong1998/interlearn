#!/usr/bin/env python3
"""Render 9:16 placeholder clips with Ken Burns + Chinese captions. Skip existing mp4s."""
from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

PROJ = Path("/cursor/stores/bc-01a0c9f7-1b4c-7341-886f-a0ee86592e93/media/interlearn/series")
SELF = Path("/cursor/stores/self/media/interlearn")
APP = Path("/agent/interlearn/public/media/series")
FONT = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"

CLIPS = [
    # llm-basics
    {
        "series": "llm-basics",
        "id": "start",
        "title": "大模型在做什么",
        "lines": [
            "大语言模型在做一件很单纯的事：",
            "根据已经出现的文字，预测下一个词。",
            "它不是在检索答案，而是沿着概率",
            "一个 token 一个 token 地往下写。",
        ],
    },
    {
        "series": "llm-basics",
        "id": "branch-a",
        "title": "Token 与分词",
        "lines": [
            "模型不直接读汉字或单词。",
            "它先把文本切成 token：字、词根或标点。",
            "上下文窗口，就是一次能装下的 token 数。",
            "钱、遗忘、长度限制，都和它有关。",
        ],
    },
    {
        "series": "llm-basics",
        "id": "branch-b",
        "title": "注意力机制",
        "lines": [
            "每个词都会问其他词：谁和我最相关？",
            "Query、Key、Value 三组向量打分，",
            "再加权汇总上下文。",
            "所以「它」能指回前面的「大语言模型」。",
        ],
    },
    {
        "series": "llm-basics",
        "id": "branch-c",
        "title": "训练与对齐",
        "lines": [
            "预训练：下一个词预测，得到通用能力。",
            "微调：用指令数据教会它听话。",
            "对齐：人类反馈，让回答更安全。",
            "能力来自预训练，听话来自对齐。",
        ],
    },
    {
        "series": "kitchen-crash",
        "id": "start",
        "title": "翻车厨房",
        "lines": [
            "停。锅在冒烟，糖色已经过了。",
            "你现在有三十秒，选一种救法，",
            "别凭感觉乱加水。",
        ],
    },
    {
        "series": "kitchen-crash",
        "id": "branch-a",
        "title": "关火焖回去",
        "lines": [
            "对，先关火。余温会把焦苦压下去。",
            "二十秒后开盖，只铲中间没糊的，",
            "边缘丢掉。下一刀再调糖色。",
        ],
    },
    {
        "series": "kitchen-crash",
        "id": "branch-b",
        "title": "沿边淋热水",
        "lines": [
            "热水沿锅壁走，别直冲肉。",
            "焦糖会浮起来，你撇掉那层黑沫。",
            "它不再是红烧，是带苦香的半汤菜。",
        ],
    },
    {
        "series": "kitchen-crash",
        "id": "branch-c",
        "title": "改做干锅",
        "lines": [
            "承认翻车反而快。倒掉糊油，",
            "留底部那层焦香，",
            "青椒干辣椒进去——今晚改名叫干锅。",
        ],
    },
    {
        "series": "interview-trap",
        "id": "start",
        "title": "面试陷阱",
        "lines": [
            "HR 笑着问：你上家为什么离职？",
            "这不是关心，是在听你怎么讲别人。",
            "三秒后你开口，选一条路。",
        ],
    },
    {
        "series": "interview-trap",
        "id": "branch-a",
        "title": "专业收口",
        "lines": [
            "可以说：上一份做到阶段性目标，",
            "想找更能扛业务的位置。一句就停。",
            "别补故事，补故事就是在递把柄。",
        ],
    },
    {
        "series": "interview-trap",
        "id": "branch-b",
        "title": "转成你要的环境",
        "lines": [
            "先答半句稳定，再补你要的：",
            "我更想待在决策快、能看到结果的团队。",
            "你在招人，我也在挑平台。",
        ],
    },
    {
        "series": "interview-trap",
        "id": "branch-c",
        "title": "轻反问",
        "lines": [
            "反问要轻：方便问问，",
            "这个岗位最近在补的是执行还是方法？",
            "你在听他们慌不慌，不在抬杠。",
        ],
    },
    {
        "series": "payday-night",
        "id": "start",
        "title": "工资到账夜",
        "lines": [
            "到账一万八。购物车亮着，",
            "室友在喊今晚庆祝。",
            "钱还热着的时候，最容易做后悔的决定。",
        ],
    },
    {
        "series": "payday-night",
        "id": "branch-a",
        "title": "先砍最贵的债",
        "lines": [
            "打开账单，找利率最高的那一张。",
            "今晚只转这一笔。",
            "爽感会延迟，下个月利息不会再咬你。",
        ],
    },
    {
        "series": "payday-night",
        "id": "branch-b",
        "title": "两百庆祝金",
        "lines": [
            "庆祝可以，设一个上限：两百。",
            "红包、奶茶、出租车，全算进去。",
            "超了就不是奖励，是泄漏。",
        ],
    },
    {
        "series": "payday-night",
        "id": "branch-c",
        "title": "先锁房租",
        "lines": [
            "房租、饭钱、通勤，先划走。",
            "剩下的才叫可支配。",
            "没划之前，你没有「余钱」这个词。",
        ],
    },
    {
        "series": "party-icebreak",
        "id": "start",
        "title": "酒局破冰",
        "lines": [
            "朋友局，那个人看了你一眼，",
            "又低头转杯子。",
            "这不是信号，是窗口。只有十几秒。",
        ],
    },
    {
        "series": "party-icebreak",
        "id": "branch-a",
        "title": "借杯子开口",
        "lines": [
            "别说你好好看。走过去：",
            "杯子是空的吗，我正好去倒。",
            "具体、可拒绝、不把人钉在座位上。",
        ],
    },
    {
        "series": "party-icebreak",
        "id": "branch-b",
        "title": "夸能回嘴的细节",
        "lines": [
            "夸要能接：腕绳的结很少见，",
            "自己编的？对方能讲二十秒，",
            "你就有下一句。",
        ],
    },
    {
        "series": "party-icebreak",
        "id": "branch-c",
        "title": "先离开再路过",
        "lines": [
            "先离开。倒水、洗手、再路过。",
            "第二次开口比第一次安全，",
            "因为你们已经「偶遇」过。",
        ],
    },
    {
        "series": "elevator-night",
        "id": "start",
        "title": "困电梯",
        "lines": [
            "二十三点十七分。",
            "电梯停在十六和十七之间。",
            "灯还在，门不听。对面刚摘下耳机。",
        ],
    },
    {
        "series": "elevator-night",
        "id": "branch-a",
        "title": "先按应急",
        "lines": [
            "应急按钮按下去会响。先按，",
            "再看对方一眼说：我按了，应该有人来。",
            "秩序比幽默先到。",
        ],
    },
    {
        "series": "elevator-night",
        "id": "branch-b",
        "title": "先报平安",
        "lines": [
            "先说话：还好灯还在，我们等一下。",
            "短、稳、不开玩笑。",
            "人一害怕，就会把幽默听成轻佻。",
        ],
    },
    {
        "series": "elevator-night",
        "id": "branch-c",
        "title": "先看信号",
        "lines": [
            "先看信号。有就发定位给门外的人；",
            "没信号就省电。",
            "别两个人同时刷短视频耗光电池。",
        ],
    },
]


def wrap(text: str, n: int = 16) -> list[str]:
    lines, buf = [], ""
    for ch in text:
        buf += ch
        if len(buf) >= n:
            lines.append(buf)
            buf = ""
    if buf:
        lines.append(buf)
    return lines


def compose_card(poster: Path, title: str, lines: list[str], dest: Path) -> None:
    img = Image.open(poster).convert("RGB").resize((720, 1280), Image.Resampling.LANCZOS)
    img = ImageEnhance.Brightness(img).enhance(0.72)
    img = ImageEnhance.Color(img).enhance(1.05)
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    # bottom gradient
    for y in range(720, 1280):
        a = int(210 * (y - 720) / 560)
        draw.line([(0, y), (720, y)], fill=(8, 8, 12, a))
    # top fade
    for y in range(0, 180):
        a = int(140 * (1 - y / 180))
        draw.line([(0, y), (720, y)], fill=(8, 8, 12, a))
    font_brand = ImageFont.truetype(FONT, 22)
    font_title = ImageFont.truetype(FONT, 40)
    font_body = ImageFont.truetype(FONT, 28)
    draw.text((36, 48), "INTERLEARN · 互动学习", font=font_brand, fill=(255, 255, 255, 200))
    y = 860
    draw.text((36, y), title, font=font_title, fill=(255, 255, 255, 255))
    y += 64
    for line in lines:
        draw.text((36, y), line, font=font_body, fill=(240, 240, 245, 235))
        y += 40
    out = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, quality=92)


def render_mp4(card: Path, mp4: Path) -> None:
    mp4.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-y",
        "-loop",
        "1",
        "-i",
        str(card),
        "-t",
        "9",
        "-vf",
        "zoompan=z='min(zoom+0.0008,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=225:s=720x1280:fps=25",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-movflags",
        "+faststart",
        str(mp4),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main() -> None:
    SELF.joinpath("scripts").mkdir(parents=True, exist_ok=True)
    made = []
    skipped = []
    for clip in CLIPS:
        series, cid = clip["series"], clip["id"]
        store_mp4 = PROJ / series / f"{cid}.mp4"
        app_mp4 = APP / series / f"{cid}.mp4"
        poster = PROJ / series / ("start.jpg" if not (PROJ / series / f"{cid}.jpg").exists() else f"{cid}.jpg")
        if not poster.exists():
            poster = PROJ / series / "poster.jpg"
        script_path = PROJ / series / f"{cid}.txt"
        script_path.write_text(clip["title"] + "\n" + "\n".join(clip["lines"]) + "\n", encoding="utf-8")
        SELF.joinpath("scripts", f"{series}-{cid}.txt").write_text(
            clip["title"] + "\n" + "\n".join(clip["lines"]) + "\n", encoding="utf-8"
        )
        # Never overwrite another agent's finished mp4
        if store_mp4.exists() and store_mp4.stat().st_size > 20_000:
            skipped.append(str(store_mp4))
            if not app_mp4.exists():
                app_mp4.parent.mkdir(parents=True, exist_ok=True)
                app_mp4.write_bytes(store_mp4.read_bytes())
            continue
        with tempfile.TemporaryDirectory() as td:
            card = Path(td) / "card.jpg"
            compose_card(poster, clip["title"], clip["lines"], card)
            render_mp4(card, store_mp4)
        app_mp4.parent.mkdir(parents=True, exist_ok=True)
        app_mp4.write_bytes(store_mp4.read_bytes())
        self_mp4 = SELF / "videos" / f"{series}-{cid}.mp4"
        self_mp4.parent.mkdir(parents=True, exist_ok=True)
        self_mp4.write_bytes(store_mp4.read_bytes())
        made.append(str(store_mp4))
    print(json.dumps({"made": made, "skipped": skipped}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
