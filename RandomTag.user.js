// ==UserScript==
// @name         RandomTags
// @namespace    local-random-tags
// @version      4.0
// @match        https://example.com/
// @grant        GM_xmlhttpRequest
// ==/UserScript==
(function () {
    'use strict';
    const TAG_SOURCE =
        'https://raw.githubusercontent.com/sz16/RdThgJso/main/rdthgjso.jso';
    // Random theo weight, không lặp
    function pickWeightedRandom(arr, n) {
        const result = [];
        const pool = [...arr];
        for (let i = 0; i < n && pool.length; i++) {
            const total = pool.reduce((s, x) => s + (4 - (x.weight || 1)), 0);
            let r = Math.random() * total;
            for (let j = 0; j < pool.length; j++) {
                r -= (pool[j].weight || 1);
                if (r <= 0) {
                    result.push(pool[j]);
                    pool.splice(j, 1);
                    break;
                }
            }
        }
        return result;
    }
    function render(allTags) {
        const selected = pickWeightedRandom(allTags, 5);
        document.documentElement.innerHTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Random nhentai Tags</title>
<style>
body {
    background: #0f172a;
    color: white;
    font-family: system-ui;
    padding: 20px;
}
h2 {
    text-align: center;
}
.item {
    display: flex;
    gap: 10px;
    margin: 12px 0;
}
a.tag {
    flex: 1;
    padding: 15px;
    background: #1e293b;
    color: #38bdf8;
    text-decoration: none;
    border-radius: 10px;
    text-align: center;
}
a.wiki {
    width: 48px;
    background: #334155;
    color: #facc15;
    text-decoration: none;
    border-radius: 10px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}
.count {
    color: #94a3b8;
    font-size: 13px;
}
button {
    width: 100%;
    padding: 14px;
    background: #22c55e;
    border: none;
    border-radius: 12px;
    margin-top: 20px;
    font-size: 16px;
}
</style>
</head>
<body>
<h2>🔀 Random nhentai Tags</h2>
${selected.map(t => {
    const wiki =
        'https://ehwiki.org/wiki/Special:Search?search=' +
        encodeURIComponent(t.name);
    return `
    <div class="item">
        <a class="tag" href="${t.href}">
            ${t.name} <span class="count">(${t.count})</span>
        </a>
        <a class="wiki" href="${wiki}" target="_blank">?</a>
    </div>`;
}).join("")}
<button id="reload">🎲 Random lại</button>
</body>
</html>`;
        document.getElementById("reload").onclick = () => render(allTags);
    }
    GM_xmlhttpRequest({
        method: "GET",
        url: TAG_SOURCE,
        onload(res) {
            try {
                const data = JSON.parse(res.responseText);
                render(data);
            } catch {
                alert("❌ Không parse được JSON");
            }
        }
    });
})();