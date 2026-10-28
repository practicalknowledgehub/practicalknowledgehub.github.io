#!/usr/bin/env python3
"""Notify IndexNow of changed/new/deleted public HTML URLs after Pages success.
No key in browser JavaScript. Key verification file is intentionally public.
"""
import json, os, subprocess, urllib.request, urllib.error
import xml.etree.ElementTree as ET
from urllib.parse import quote
from pathlib import Path

origin = os.environ.get('SITE_ORIGIN', 'https://msmeknowledgehub.com').rstrip('/')
key = os.environ['INDEXNOW_KEY']
sha = os.environ.get('DEPLOY_SHA', 'HEAD')
mode = os.environ.get('INDEXNOW_MODE', 'changed')

def git(*args):
    return subprocess.run(['git', *args], text=True, capture_output=True, check=True).stdout

def public_url(path):
    path = path.strip().lstrip('/')
    if path == 'index.html': return origin + '/'
    if not path.endswith('.html'): return None
    if path.startswith(('.github/', 'scripts/')) or '..' in Path(path).parts: return None
    return origin + '/' + quote(path, safe='/')

if mode == 'full':
    # One-time catch-up: read canonical URLs from the published sitemap and include new HTML pages.
    sitemap = Path('sitemap.xml')
    listed = []
    if sitemap.exists():
        root = ET.parse(sitemap).getroot()
        listed = [el.text.strip() for el in root.iter() if el.tag.endswith('loc') and el.text and el.text.strip().startswith(origin + '/')]
    local = [public_url(str(p)) for p in Path('.').glob('*.html') if p.name not in ('test.html',) and not p.name.startswith('google')]
    urls = sorted(set(listed + [u for u in local if u]))
else:
 try:
    # Include deletions as IndexNow supports removed URLs (server should return 404/410).
    lines = git('diff', '--name-only', '--diff-filter=ACDMRT', sha+'~10', sha).splitlines()
 except (subprocess.CalledProcessError, ValueError):
    lines = [str(p.relative_to('.')) for p in Path('.').glob('*.html')]
 urls = sorted({u for path in lines if (u := public_url(path)) and path not in ('test.html',) and not path.startswith('google')})
if not urls:
    print('No changed HTML URLs; nothing to notify.')
    raise SystemExit(0)
print('IndexNow mode:', mode, '| notifying', len(urls), 'URLs')
for url in urls: print('SUBMIT', url)
for start in range(0, len(urls), 10000):
    payload = json.dumps({'host': 'msmeknowledgehub.com', 'key': key,
      'keyLocation': origin+'/'+key+'.txt', 'urlList': urls[start:start+10000]}).encode()
    req = urllib.request.Request('https://api.indexnow.org/indexnow', data=payload,
      headers={'Content-Type': 'application/json; charset=utf-8','User-Agent':'MSMEKnowledgeHub-IndexNow/1.0'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            print('IndexNow HTTP', response.status)
    except urllib.error.HTTPError as e:
        print('IndexNow HTTP', e.code, e.read(500).decode(errors='replace'))
        raise
