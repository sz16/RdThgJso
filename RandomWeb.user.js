// ==UserScript==
// @name         RandomWeb
// @namespace    http://tampermonkey.net/
// @description  Random something in nhentai
// @version      4.1
// @match        *://nhentai.net/*
// @grant        none 
// ==/UserScript==

(function () {
    'use strict';

    const blacklist = ["scat","yaoi","males only","guro" ,"blood", "tentacles","monster","no penetration",];

    // ---- GET SESSION STORAGE
    let history = JSON.parse(sessionStorage.getItem("history")||"[]");
    let stopCheck = sessionStorage.getItem("stopCheck") == "true";
    let oldPage = sessionStorage.getItem("oldPage") || "https://nhentai.net/random/";

    // ---- CHECK URL ----
    const url = window.location.href;
    const tagMatch = url.match(/^https:\/\/nhentai\.net\/tag\/([^\/]+)\/?(?:\?page=\d+)?$/);
    const searchMatch = url.match(/^https:\/\/nhentai\.net\/search\/([^\/]+)\/?(?:\?page=\d+)?$/);
    const pageRd = tagMatch || searchMatch;

    // ---- RANDOM BUTTON ----
    const button = document.createElement("div");
    if (pageRd) {
        button.textContent = "RdPage";
        // This name would be changed later
        sessionStorage.setItem("oldPage", window.location.href);
        const nowPage = document.querySelector("a.page.current").textContent;
        const lastPageA = document.querySelector("a.last");
        const matchPage = lastPageA.href.match(/page=(\d+)/);
        const lastPage = matchPage ? parseInt(matchPage[1], 10) : 1;
        button.textContent = "RdPage(" + nowPage + "/" + lastPage + ")"; //Show RdPage(nowPage/lastPage)
    }
    else {
        button.textContent = "Random";
        sessionStorage.removeItem("oldPage");
    }
    Object.assign(button.style, {
        position: "fixed",
        left: "20px",
        bottom: "70px",
        zIndex: "99999",
        padding: "10px 15px",
        background: "#1877f2",
        color: "#fff",
        borderRadius: "10px",
        cursor: "pointer",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        fontSize: "15px"
    });

    // ---- REDO BUTTON ----
    const redoButton = document.createElement("div");
    if (history.length >= 1) {
        redoButton.textContent = history[history.length - 1][0] + " (" + history.length + ")";
    }
    else {
        redoButton.textContent = "None";
    }

    Object.assign(redoButton.style, {
        position: "fixed",
        left: "20px",
        bottom: "120px",
        zIndex: "99999",
        padding: "10px 15px",
        background: "#1877f2",
        color: "#fff",
        borderRadius: "10px",
        cursor: "pointer",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        fontSize: "15px"
    });

    // ---- SEARCH TAG BUTTON ----
    const searchTagButton = document.createElement("div");
    if (tagMatch){
        Object.assign(searchTagButton.style, {
            position: "fixed",
            left: "20px",
            bottom: "170px",
            zIndex: "99999",
            padding: "10px 15px",
            background: "#1877f2",
            color: "#fff",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            fontSize: "15px"
        })
        searchTagButton.textContent = "Search";
    }

    const regex1 = /^https:\/\/nhentai\.net\/g\/\d+\/\d+\/?$/;
    if (!regex1.test(window.location.href)){
        document.body.appendChild(button);
        document.body.appendChild(redoButton);
        document.body.appendChild(searchTagButton);
    }

    button.addEventListener("click", () => {
        const url = window.location.href;

        // Kiểm tra trang TAG
        const tagMatch = url.match(
            /^https:\/\/nhentai\.net\/tag\/([^\/]+)\/?(?:\?page=\d+)?$/
        );

        // Kiểm tra trang SEARCH
        const searchMatch = url.match(
            /^https:\/\/nhentai\.net\/search\/\?q=([^&]+)(?:&page=\d+)?$/
        );

        // ==========================
        // 1. Nếu không phải TAG hoặc SEARCH → random
        // ==========================
        if (!tagMatch && !searchMatch) {
            window.location.href = "https://nhentai.net/random/";
            return;
        }

        // ==========================
        // 2. Trang TAG
        // ==========================
        if (tagMatch) {
            const tagName = tagMatch[1];
            const nowPage = document.querySelector("a.page.current").textContent;
            const lastPageA = document.querySelector("a.last");

            if (!lastPageA) {
                window.location.href = `https://nhentai.net/tag/${tagName}/?page=1`;
                return;
            }
        
            const matchPage = lastPageA.href.match(/page=(\d+)/);
            const lastPage = matchPage ? parseInt(matchPage[1], 10) : 1;
            const randomPage = Math.floor(Math.random() * lastPage) + 1;
            button.textContent = "RdPage(" + nowPage + "/" + lastPage + ")"; //Show RdPage(nowPage/lastPage)

            window.location.href = `https://nhentai.net/tag/${tagName}/?page=${randomPage}`;
            return;
        }

        // ==========================
        // 3. Trang SEARCH
        // ==========================
        if (searchMatch) {
            const query = searchMatch[1]; // vd: little+girl
            const lastPageA = document.querySelector("a.last");

            if (!lastPageA) {
                window.location.href = `https://nhentai.net/search/?q=${query}&page=1`;
                return;
            }

            const matchPage = lastPageA.href.match(/page=(\d+)/);
            const lastPage = matchPage ? parseInt(matchPage[1], 10) : 1;
            const randomPage = Math.floor(Math.random() * lastPage) + 1;

            window.location.href = `https://nhentai.net/search/?q=${query}&page=${randomPage}`;
            return;
        }
    });

    // Kiem tra tags
    const checkTags = () => {
        const tagNodes = document.querySelectorAll('#tags .name');
        if (!tagNodes.length) return; // chờ load

        const names = [...tagNodes].map(e => e.textContent.trim().toLowerCase());

        console.log("Tags:", names.join(", "));

        // tìm tag vi phạm
        const violated = names.filter(t => blacklist.includes(t));

        if (violated.length > 0) {
            console.log("⚠ Blacklist detected →", violated.join(", "));
            history.push([violated[0], window.location.href]);
            sessionStorage.setItem("history", JSON.stringify(history));
            window.location.href = oldPage;
        } else {
            console.log("✓ Clean doujin → stop");
        }
    };

    // ---- CHECK TAGS ----
    if (/^\/g\/\d+\/$/.test(window.location.pathname)) {
        if (!stopCheck){
            const observer = new MutationObserver((m, o) => {
                if (document.querySelector('#tags .name')) {
                    o.disconnect();
                    checkTags();
                }
            });
            observer.observe(document, { childList: true, subtree: true });
        }
        else {
            sessionStorage.setItem("stopCheck", "false");
        }
    }

    // ---- REDO BUTTON ----
    redoButton.addEventListener("click", () => {
        if (history.length >= 1) {
            window.location.href = history[history.length - 1][1];
            history.pop();
            sessionStorage.setItem("history", JSON.stringify(history));
            sessionStorage.setItem("stopCheck", "true");
        }
    });

    // ---- RANDOM TAG BUTTON ----
    searchTagButton.addEventListener("click", () => {
        const wikiLink = "https://ehwiki.org/wiki/Special:Search?search="
        const text = document.querySelector('a.tag span.name').textContent.trim();
        window.location.href = wikiLink + text;
    });

})();
