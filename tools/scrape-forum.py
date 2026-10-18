#!/usr/bin/env python3
"""Crawl the download/modding subforums of imperivmgbr.foroactivo.com -> raw/forum.json.
Links are hidden from guests: export the browser's forum cookies as FORO_COOKIE.
Every external link of every post is kept with its poster, so later updates by the author are not lost."""
import html
import os
import json
import pathlib
import re
import time
import urllib.request

BASE = "https://imperivmgbr.foroactivo.com"
SUBFORUMS = ["f37-descarga-de-mapas", "f24-modificacion-de-estructuras-tecnologias-unidades-y-objetos",
             "f1-creacion-de-nuevas-unidades-y-edificios", "f23-proyectos-sugerencias-y-reparacion-de-bugs",
             "f31-guias-y-recursos-para-el-editor", "f3-cgwar-greek-civilization-mod", "f6-descarga-e-informacion",
             "f4-rattlesmake-greek-civilization-mod", "f5-descarga-e-informacion", "f46-asvrmod-wrath-of-the-gods",
             "f47-descarga-e-informacion", "f40-mod-de-la-comunidad-imperivm-mci", "f41-descarga-e-informacion",
             "f25-aportes-de-la-comunidad", "f43-imperium-iii-mod-la-reconquista", "f44-descarga-e-informacion"]
SKIP_HOSTS = re.compile(r"foroactivo|forumotion|servimg|2img\.net|ibb\.co|imgur|imageshack|photobucket|tinypic|postimg|"
                        r"consentframework|illipro|directorio-foros|gstatic|googleapis|facebook|twitter|phpbb9|youtube|youtu\.be", re.I)
OUT = pathlib.Path(__file__).resolve().parent.parent / "raw" / "forum.json"


def get(path):
    for _ in range(3):
        try:
            # BASE is a fixed https:// origin, so no file:/custom schemes can reach urlopen
            req = urllib.request.Request(BASE + path, headers={"User-Agent": "Mozilla/5.0", "Cookie": os.environ.get("FORO_COOKIE", "")})  # noqa: S310
            time.sleep(1)
            return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")  # noqa: S310
        except Exception as e:  # noqa: BLE001 - retry any network error
            print("retry", path, e)
            time.sleep(5)
    return ""


def text(s):
    return html.unescape(re.sub(r"<[^>]+>", " ", s)).strip()


def topics_of(sub):
    fid, slug = sub.split("-", 1)
    seen, page = {}, 0
    while True:
        s = get(f"/{fid}{'p' + str(page) if page else ''}-{slug}")
        found = re.findall(r'href="/(t(\d+)-[^"#?]*)"[^>]*class="topictitle"[^>]*>(.*?)</a>|'
                           r'class="topictitle"[^>]*href="/(t(\d+)-[^"#?]*)"[^>]*>(.*?)</a>', s, re.S)
        new = 0
        for a, b, c, d, e, f in found:
            path, tid, title = (a, b, c) if a else (d, e, f)
            if tid not in seen:
                seen[tid] = {"id": int(tid), "path": "/" + path, "title": text(title), "subforum": sub}
                new += 1
        if not new or f'/{fid}p{page + 50}-' not in s:
            return list(seen.values())
        page += 50


def posts_of(topic):
    posts, page = [], 0
    while True:
        p = topic["path"]
        s = get(p if not page else re.sub(r"^/t(\d+)-", rf"/t\1p{page}-", p))
        chunks = re.split(r'<tr class="post post--', s)[1:]
        for ch in chunks:
            pid = re.match(r"(\d+)", ch)
            author = re.search(r'<span class="name">.*?<strong>(.*?)</strong>', ch, re.S)
            date = re.search(r'Tema: .*?/>\s*([^<]+?)</span>', ch, re.S)
            body = re.search(r'<div class="postbody">(.*?)<div class="clear">', ch, re.S)
            body = body.group(1) if body else ""
            plain = text(re.sub(r"<br\s*/?>", "\n", body))
            found = re.findall(r'href="(https?://[^"]+)"', body) + re.findall(r"https?://[\w\-.~:/?#\[\]@!$&'()*+,;=%]+", plain)
            links = sorted({html.unescape(u).rstrip(".,;)]") for u in found if not SKIP_HOSTS.search(u)})
            posts.append({"id": int(pid.group(1)) if pid else 0, "author": text(author.group(1)) if author else "",
                          "date": text(date.group(1)) if date else "", "links": links,
                          "text": plain if links else plain[:600] if not posts else ""})
        page += 25
        if not chunks or re.sub(r"^/t(\d+)-", rf"/t\1p{page}-", p) not in s:
            return posts


def main():
    try:
        data = json.loads(OUT.read_text())  # resume a previous run
    except (FileNotFoundError, json.JSONDecodeError):
        data = {}
    for sub in SUBFORUMS:
        for t in topics_of(sub):
            key = str(t["id"])
            if key in data:
                continue
            t["posts"] = posts_of(t)
            t["author"] = t["posts"][0]["author"] if t["posts"] else ""
            data[key] = t
            OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1))
            print(len(data), sub, t["title"][:60], sum(len(p["links"]) for p in t["posts"]), "links")


if __name__ == "__main__":
    main()
