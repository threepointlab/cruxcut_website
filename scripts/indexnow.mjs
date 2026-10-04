// Ping IndexNow (Bing, Naver, Yandex, Seznam...) after a deploy.
// Usage: node scripts/indexnow.mjs            -> submits every <loc> in sitemap.xml
//        node scripts/indexnow.mjs /guides ... -> submits only the given paths
import {readFile} from "node:fs/promises";

const HOST = "www.cruxcut.com";
const KEY = "45a88d81a27616c4aba619d05f46d1d3";
const paths = process.argv.slice(2);
const urlList = paths.length
    ? paths.map((p) => new URL(p, `https://${HOST}`).href)
    : [...(await readFile(new URL("../sitemap.xml", import.meta.url), "utf8")).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

for (const endpoint of ["https://api.indexnow.org/indexnow", "https://searchadvisor.naver.com/indexnow"]) {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSON.stringify({host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList}),
    });
    console.log(endpoint, res.status, urlList.length, "urls");
}
