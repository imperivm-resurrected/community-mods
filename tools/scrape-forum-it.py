#!/usr/bin/env python3
"""Crawl the content sections of the Italian forum imperivmeditor.forumcommunity.net (ex Imperivm World) -> raw/forum-it.json.
Sections need a login: export the browser's forumcommunity.net cookies as FORUM_IT_COOKIE ("name=value; name=value").
Every external link of every post is kept with its poster, like scrape-forum.py. Resumable: topics already saved are skipped.
  python3 tools/scrape-forum-it.py [f<id> ...]   (only those sections)"""
import html
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.request

BASE = "https://imperivmeditor.forumcommunity.net"
# id -> name. Left out: rules, introductions, chat (Agorà, Locanda, Spam...), other games, replays and online matches
SUBFORUMS = {
    8926117: "Downloads", 9074753: "Wikimperivm", 8967003: "Tutorial e assistenza generale", 8967171: "Assistenza",
    8558735: "Tutorial", 8902764: "Tutorial di base (editor)", 8902768: "Tutorial avanzati (editor)",
    8904176: "Scenari", 8902833: "Avventure & Conquiste", 8558736: "Mappe degli Eroi", 8562955: "Mappe create da supreme19",
    8563979: "Domande sulle mappe di supreme19", 8562956: "Mappe create da CaptainHighlander",
    8563978: "Domande sulle mappe di CaptainHighlander", 8562957: "Mappe create da TheMaster0017",
    8563977: "Domande sulle mappe di TheMaster0017", 8938371: "Mappe create da Rázor", 8938372: "Domande sulle mappe di Rázor",
    8562958: "Mappe create da Ïmpë", 8563976: "Domande sulle mappe di Ïmpë", 9075002: "Mappe dei Pretoriani",
    9074999: "Mappe dei Nobili", 8632445: "Mappe dei Princeps", 9075000: "Mappe dei Legionari",
    8558738: "Materiale", 8675652: "Sequenze predefinite", 8902898: "Collaborazioni Mappe", 8558737: "Assistenza Editor",
    8572729: "Assistenza per sviluppo di sequenze", 8678404: "Assistenza grafica", 8903391: "Assistenza generica",
    8938224: "Laboratorio", 8926183: "Private LAB", 8904780: "Graphic LAB", 8974473: "Materiale grafico",
    8998642: "Greek Civilization Mod Projects", 8954091: "Old Projects", 8902995: "Archivio Mods Imperivm World",
    8904179: "Altre MOD", 8629973: "Tutorial e utilità Mod", 8938558: "Assistenza Mod",
}
# page furniture, avatars and emoji: not downloads
SKIP_HOSTS = re.compile(r"forumcommunity|forumfree|illipro|consentframework|gstatic|googleapis|facebook|twitter|youtube|youtu\.be|"
                        r"sgaclangbr\.altervista\.org/(FORUM|IMP)|imperivmworld\.altervista\.org/(images|forum)|iubenda|addtoany", re.I)
IMG = re.compile(r"\.(png|jpe?g|gif|bmp|webp)(\?|$)", re.I)
GUESTBOOK = "58960908"  # "Libro delle visite": pinned in every section, thousands of greetings
OUT = pathlib.Path(__file__).resolve().parent.parent / "raw" / "forum-it.json"
COOKIE = os.environ.get("FORUM_IT_COOKIE", "")


def get(path):
    for _ in range(3):
        try:
            # BASE is a fixed https:// origin, so no file:/custom schemes can reach urlopen
            req = urllib.request.Request(BASE + path, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/154.0 Safari/537.36", "Cookie": COOKIE})  # noqa: S310
            time.sleep(1)
            return urllib.request.urlopen(req, timeout=30).read().decode("cp1252", "replace")  # noqa: S310 - the forum is windows-1252
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):  # a section our account cannot see (Private LAB, Wikimperivm...)
                print("no access", path, flush=True)
                return ""
            print("retry", path, e, flush=True)
            time.sleep(5)
        except Exception as e:  # noqa: BLE001 - retry any network error
            print("retry", path, e, flush=True)
            time.sleep(5)
    return ""


def text(s):
    return html.unescape(re.sub(r"<[^>]+>", " ", s)).strip()


def topics_of(fid):
    seen, st = {}, 0
    while True:
        s = get(f"/?f={fid}" + (f"&st={st}" if st else ""))
        new = 0
        for tid, title in re.findall(r'<a href="/\?t=(\d+)(?:&amp;view=getlastpost#lastpost)?"[^>]*>(.*?)</a>', s, re.S):
            if tid not in seen and tid != GUESTBOOK and "help.forumfree" not in title:
                seen[tid] = {"id": int(tid), "path": f"/?t={tid}", "title": re.sub(r"\s+", " ", text(title)), "subforum": f"{fid} {SUBFORUMS.get(fid, '')}".strip()}
                new += 1
        pages = re.search(rf"page_jump\('[^']*f={fid}',(\d+),(\d+)\)", s)
        st += 30
        if not new or not pages or st >= int(pages.group(1)) * int(pages.group(2)):
            return list(seen.values())


def posts_of(topic):
    posts, seen, st = [], set(), 0
    while True:
        s = get(topic["path"] + (f"&st={st}" if st else ""))
        pages = re.search(r"page_jump\('[^']*',(\d+),(\d+)\)", s)
        new = 0
        for pid, ch in re.findall(r'<li id="ee(\d+)" class="post[^"]*">(.*?)(?=<li id="ee\d+" class="post|</ul>|$)', s, re.S):
            if pid in seen:
                continue
            seen.add(pid)
            new += 1
            author = re.search(r'<div class="nick">(.*?)</div>', ch, re.S)
            date = re.search(r'<span class="when" title="([^"]*)"', ch)
            body = re.search(r'<table class="color"[^>]*>(.*?)(?=<div class="signature|<tr class="title2 bottom"|$)', ch, re.S)
            body = body.group(1) if body else ""
            plain = re.sub(r"[ \t]+", " ", text(re.sub(r"<br\s*/?>", "\n", body)))
            hrefs = [html.unescape(u) for u in re.findall(r'href="(https?://[^"]+)"', body)]
            urls = [html.unescape(u).rstrip(".,;)]") for u in re.findall(r"https?://[\w\-.~:/?#\[\]@!$&'()*+,;=%]+", plain)]
            links = sorted({u for u in hrefs + urls if not SKIP_HOSTS.search(u) and not IMG.search(u)})
            shots = sorted({u for u in re.findall(r'<img[^>]*src="(https?://[^"]+)"', body) if IMG.search(u) and not SKIP_HOSTS.search(u)
                            and "/emoji/" not in u})
            inner = re.findall(r'href="(\?[ft]=\d+[^"]*)"', body)  # "download is in Downloads" and the like
            posts.append({"id": int(pid), "author": text(author.group(1)) if author else "", "date": date.group(1) if date else "",
                          "links": links, "shots": shots, "inner": sorted(set(inner)),
                          "text": plain[:4000] if links or not posts else ""})
        st += 15
        if not new or not pages or st >= int(pages.group(1)) * int(pages.group(2)):
            return posts


def downloads_table():
    """The Downloads section is one page with a table (title, author, link) under headings (Avventure, Conquiste...), not topics."""
    s = get("/?f=8926117")
    rows = []
    for sec in re.split(r"<div class='section_wiki'>", s)[1:]:  # "1. Aggiornamenti", "2. Avventure", "3. Conquiste"...
        section = text(sec.split("</div>")[0]).split(".", 1)[-1].strip()
        for tr in re.findall(r'<tr class="td_download_normal"[^>]*>.*?</tr>', sec, re.S):
            cells = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)
            link = re.search(r'href="(https?://[^"]+)"', tr)
            if link and len(cells) >= 3:
                rows.append({"section": section, "title": text(cells[0]), "author": text(cells[1]), "link": html.unescape(link.group(1))})
    return rows


def main():
    if not COOKIE:
        sys.exit("set FORUM_IT_COOKIE (the browser's forumcommunity.net cookies)")
    try:
        data = json.loads(OUT.read_text())  # resume a previous run
    except (FileNotFoundError, json.JSONDecodeError):
        data = {}
    only = {int(a.lstrip("f")) for a in sys.argv[1:]}
    if not only or 8926117 in only:
        rows = downloads_table()
        OUT.with_name("forum-it-downloads.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1))
        print("downloads table:", len(rows), "rows", flush=True)
    for fid in SUBFORUMS:
        if only and fid not in only:
            continue
        for t in topics_of(fid):
            key = str(t["id"])
            if key in data:
                continue
            t["posts"] = posts_of(t)
            t["author"] = t["posts"][0]["author"] if t["posts"] else ""
            data[key] = t
            OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1))
            print(len(data), t["subforum"], "|", t["title"][:60], "|", sum(len(p["links"]) for p in t["posts"]), "links", flush=True)


if __name__ == "__main__":
    main()
