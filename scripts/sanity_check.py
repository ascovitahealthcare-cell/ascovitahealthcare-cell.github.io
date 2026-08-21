#!/usr/bin/env python3
"""Structural sanity check for admin.html:
1. tag depth balance for major tags (script, style, div at block level is too
   noisy — we instead verify <script> and <style> pairs, and page containers).
2. Parse embedded <script> blocks with Python's ast by extracting pure-JS and
   checking for obvious syntax errors via `node -c` per block.
"""
import re, subprocess, sys
from pathlib import Path

path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / 'admin.html'
src = path.read_text(encoding='utf-8')

# 1. script / style balance
for tag in ('script', 'style'):
    opens = len(re.findall(r'<%s[\s>]' % tag, src))
    closes = src.count('</%s>' % tag)
    print(('%s: opens=%d closes=%d -> %s' % (tag, opens, closes, 'OK' if opens == closes else 'MISMATCH')))

# 2. page containers balance (id=page-* opened but not closed)
pages = re.findall(r'<div class="page" id="page-([a-z-]+)"', src)
print('page containers found: %d (%s)' % (len(pages), 'unique' if len(pages) == len(set(pages)) else 'DUPLICATES!'))

# 3. lint each embedded script block via node
blocks = re.findall(r'<script(?:[^>]*)>(.*?)</script>', src, re.S)
bad = 0
for i, b in enumerate(blocks):
    if not b.strip():
        continue
    p = subprocess.run(['node', '-c', '-'], input=b, capture_output=True, text=True)
    if p.returncode != 0:
        bad += 1
        print('BLOCK %d SYNTAX ERROR:\n%s' % (i, p.stderr[:600]))
print('script blocks checked: %d, errors: %d' % (len(blocks), bad))
