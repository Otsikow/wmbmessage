"""Import the transcripts and song arrangements from a Church Presenter HTML export."""

import argparse
import base64
import gzip
import hashlib
import json
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
BATCH_SIZE = 50


def extract_script(html, script_id):
    match = re.search(r'<script id="' + script_id + r'"[^>]*>(.*?)</script>', html, re.S)
    if match is None:
        raise ValueError(f"Missing Church Presenter data: {script_id}")
    return match[1]


def json_bytes(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()


def import_messages(html):
    encoded = extract_script(html, "messages-data")
    rows = json.loads(gzip.decompress(base64.b64decode(encoded)))
    codes = [row[0] for row in rows]
    if len(codes) != len(set(codes)):
        raise ValueError("The message archive contains repeated date codes")

    folder = ROOT / "public/data/message-archive"
    folder.mkdir(parents=True, exist_ok=True)
    catalog = []
    current_files = set()
    for offset in range(0, len(rows), BATCH_SIZE):
        batch = rows[offset:offset + BATCH_SIZE]
        compressed = gzip.compress(json_bytes(batch), compresslevel=6, mtime=0)
        digest = hashlib.sha256(compressed).hexdigest()[:12]
        file = folder / f"messages-{digest}.json.gz"
        file.write_bytes(compressed)
        current_files.add(file)
        catalog.extend({"code": code, "title": title, "file": file.name} for code, title, _ in batch)

    (folder / "catalog.json").write_bytes(json_bytes(catalog) + b"\n")
    for stale_file in set(folder.glob("messages-*.json.gz")) - current_files:
        stale_file.unlink()
    return len(rows), sum(len(row[2]) for row in rows)


def import_songs(html):
    rows = json.loads(extract_script(html, "songs"))
    numbers = json.loads(re.search(r"const traditionalNumbers=new Map\(Object.entries\((\{[^\n]+\})\)\);", html)[1])
    source_ids = set()
    songs = []
    for row in rows:
        title, slides, *metadata = row
        labels = metadata[2] if len(metadata) > 2 and metadata[2] else []
        groups = metadata[-1] if len(metadata) >= 4 else None
        if not groups:
            groups = [["chorus" if label and label.lower().startswith("chorus") else "verse", [index]]
                      for index, label in enumerate([*labels, *([None] * (len(slides) - len(labels)))])]
        sections = []
        for section_type, indices, *_ in groups:
            lines = "\n".join(slides[index] for index in indices).strip().splitlines()
            if lines:
                sections.append({
                    "type": section_type,
                    "label": next((labels[i] for i in indices if i < len(labels) and labels[i]), None),
                    "lines": lines,
                })
        if not sections:
            raise ValueError(f"Missing lyrics for {title}")
        song_id = "presenter-" + hashlib.sha256(title.encode()).hexdigest()[:16]
        if song_id in source_ids:
            song_id += "-" + hashlib.sha256(json_bytes(slides)).hexdigest()[:8]
        if song_id in source_ids:
            raise ValueError(f"Repeated song: {title}")
        source_ids.add(song_id)
        songs.append({
            "id": song_id,
            "number": numbers.get(title),
            "title": title.strip(),
            "sections": sections,
        })

    target = ROOT / "public/data/presenter-songs.json"
    target.write_bytes(json_bytes(songs) + b"\n")
    return len(songs)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("presenter_html", type=Path)
    args = parser.parse_args()
    html = args.presenter_html.read_text(encoding="utf-8")
    messages, paragraphs = import_messages(html)
    songs = import_songs(html)
    print(f"Imported {messages} messages, {paragraphs} paragraphs and {songs} songs.")
