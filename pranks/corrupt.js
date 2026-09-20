(() => {
    "use strict";

    const KEY = "__persistent_dom_glitch_v2__";

    if (window.__DOM_GLITCH_RUNNING__) {
        console.log("Glitch is already running.");
        return;
    }

    window.__DOM_GLITCH_RUNNING__ = true;

    // ------------------------------------------------------------
    // State
    // ------------------------------------------------------------

    const pageKey =
        location.origin + location.pathname;

    let db;

    try {
        db = JSON.parse(
            localStorage.getItem(KEY) || "{}"
        );
    } catch {
        db = {};
    }

    if (!db[pageKey]) {
        db[pageKey] = {
            intensity: 0,
            mutations: {}
        };
    }

    const state = db[pageKey];

    // ------------------------------------------------------------
    // Persistence
    // ------------------------------------------------------------

    function save() {
        try {
            localStorage.setItem(
                KEY,
                JSON.stringify(db)
            );
        } catch (e) {
            console.warn(
                "Could not save glitch state:",
                e
            );
        }
    }

    // ------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------

    const ignored = new Set([
        "HTML",
        "HEAD",
        "BODY",
        "SCRIPT",
        "STYLE",
        "META",
        "LINK",
        "TITLE",
        "NOSCRIPT",
        "TEMPLATE"
    ]);

    const selectors = [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "span",
        "a",
        "button",
        "li",
        "label",
        "strong",
        "em",
        "small",
        "td",
        "th",
        "img",
        "input",
        "textarea"
    ];

    const glitchChars =
        "█▓▒░╳╬┼│─<>/\\\\$#@%!?";

    function random(min, max) {
        return min +
            Math.random() * (max - min);
    }

    function pick(array) {
        return array[
            Math.floor(
                Math.random() * array.length
            )
        ];
    }

    function valid(el) {
        if (!el || el.nodeType !== 1)
            return false;

        if (ignored.has(el.tagName))
            return false;

        if (
            el.hasAttribute(
                "data-glitch-artifact"
            )
        )
            return false;

        if (
            el.hasAttribute(
                "data-glitch-ignore"
            )
        )
            return false;

        const r =
            el.getBoundingClientRect();

        return (
            r.width > 2 &&
            r.height > 2
        );
    }

    function getElements() {
        return Array.from(
            document.querySelectorAll(
                selectors.join(",")
            )
        ).filter(valid);
    }

    // ------------------------------------------------------------
    // Stable DOM paths
    // ------------------------------------------------------------

    function elementPath(el) {
        const parts = [];

        let current = el;

        while (
            current &&
            current !== document.body &&
            current.nodeType === 1
        ) {
            let index = 0;

            let sibling =
                current.previousElementSibling;

            while (sibling) {
                if (
                    sibling.tagName ===
                    current.tagName
                ) {
                    index++;
                }

                sibling =
                    sibling.previousElementSibling;
            }

            parts.unshift(
                current.tagName +
                ":" +
                index
            );

            current =
                current.parentElement;
        }

        return parts.join("/");
    }

    function findElement(path) {
        if (!path)
            return null;

        const parts =
            path.split("/");

        let current =
            document.body;

        for (
            const part of parts
        ) {
            const i =
                part.lastIndexOf(":");

            if (i === -1)
                return null;

            const tag =
                part.slice(0, i);

            const index =
                Number(
                    part.slice(i + 1)
                );

            const children =
                Array.from(
                    current.children
                ).filter(
                    x =>
                        x.tagName === tag
                );

            if (!children[index])
                return null;

            current =
                children[index];
        }

        return current;
    }

    // ------------------------------------------------------------
    // Text-node paths
    // ------------------------------------------------------------

    function textNodePath(node) {
        const parent =
            node.parentElement;

        if (!parent)
            return null;

        const parentPath =
            elementPath(parent);

        let index = 0;

        let sibling =
            node.previousSibling;

        while (sibling) {
            if (
                sibling.nodeType ===
                Node.TEXT_NODE
            ) {
                index++;
            }

            sibling =
                sibling.previousSibling;
        }

        return (
            parentPath +
            "|text:" +
            index
        );
    }

    function findTextNode(path) {
        const separator =
            path.lastIndexOf("|text:");

        if (separator === -1)
            return null;

        const parentPath =
            path.slice(
                0,
                separator
            );

        const index =
            Number(
                path.slice(
                    separator + 6
                )
            );

        const parent =
            findElement(parentPath);

        if (!parent)
            return null;

        let count = 0;

        for (
            const child
            of parent.childNodes
        ) {
            if (
                child.nodeType ===
                Node.TEXT_NODE
            ) {
                if (
                    count === index
                ) {
                    return child;
                }

                count++;
            }
        }

        return null;
    }

    // ------------------------------------------------------------
    // Persist text mutation
    // ------------------------------------------------------------

    function saveText(node) {
        const path =
            textNodePath(node);

        if (!path)
            return;

        state.mutations[path] = {
            type: "text",
            value: node.nodeValue
        };
    }

    // ------------------------------------------------------------
    // Persist style mutation
    // ------------------------------------------------------------

    function saveStyle(el) {
        const path =
            elementPath(el);

        if (!path)
            return;

        state.mutations[
            "style|" + path
        ] = {
            type: "style",
            value:
                el.getAttribute("style") || ""
        };
    }

    // ------------------------------------------------------------
    // Restore all actual mutations
    // ------------------------------------------------------------

    function restore() {
        let count = 0;

        for (
            const [
                key,
                mutation
            ]
            of Object.entries(
                state.mutations
            )
        ) {

            if (
                mutation.type === "text"
            ) {
                const node =
                    findTextNode(key);

                if (!node)
                    continue;

                node.nodeValue =
                    mutation.value;

                count++;
            }

            else if (
                mutation.type === "style"
            ) {
                const path =
                    key.slice(6);

                const el =
                    findElement(path);

                if (!el)
                    continue;

                if (
                    mutation.value
                ) {
                    el.setAttribute(
                        "style",
                        mutation.value
                    );
                }
                else {
                    el.removeAttribute(
                        "style"
                    );
                }

                count++;
            }
        }

        console.log(
            `Restored ${count} persistent mutations.`
        );
    }

    // ------------------------------------------------------------
    // Corrupt text
    // ------------------------------------------------------------

    function corruptText(el) {
        const walker =
            document.createTreeWalker(
                el,
                NodeFilter.SHOW_TEXT
            );

        const nodes = [];

        while (
            walker.nextNode()
        ) {
            const node =
                walker.currentNode;

            if (
                node.nodeValue &&
                node.nodeValue.trim()
            ) {
                nodes.push(node);
            }
        }

        if (!nodes.length)
            return;

        const node =
            pick(nodes);

        const chars =
            node.nodeValue.split("");

        const probability =
            Math.min(
                0.6,
                0.01 +
                state.intensity *
                0.01
            );

        for (
            let i = 0;
            i < chars.length;
            i++
        ) {
            if (
                chars[i] === " " ||
                chars[i] === "\n" ||
                chars[i] === "\t"
            ) {
                continue;
            }

            if (
                Math.random() <
                probability
            ) {
                chars[i] =
                    pick(
                        glitchChars.split("")
                    );
            }
        }

        node.nodeValue =
            chars.join("");

        saveText(node);
    }

    // ------------------------------------------------------------
    // RGB separation
    // ------------------------------------------------------------

    function rgb(el) {
        const amount =
            Math.min(
                40,
                2 +
                state.intensity * 1.5
            );

        el.style.textShadow =
            `${amount}px 0 rgba(255,50,50,.65),
             ${-amount}px 0 rgba(50,100,255,.65)`;

        saveStyle(el);
    }

    // ------------------------------------------------------------
    // Displacement
    // ------------------------------------------------------------

    function displacement(el) {
        const amount =
            Math.min(
                30,
                state.intensity
            );

        el.style.transform =
            `translate(
                ${random(-amount, amount)}px,
                ${random(-amount / 3, amount / 3)}px
            )`;

        saveStyle(el);
    }

    // ------------------------------------------------------------
    // Color corruption
    // ------------------------------------------------------------

    function color(el) {
        el.style.color =
            pick([
                "#ff1744",
                "#00d9ff",
                "#ff00aa",
                "#7cff00",
                "#ffffff"
            ]);

        saveStyle(el);
    }

    // ------------------------------------------------------------
    // Clipping
    // ------------------------------------------------------------

    function clipping(el) {
        const amount =
            Math.min(
                30,
                state.intensity
            );

        el.style.clipPath =
            `inset(
                ${random(0, amount)}%
                0
                ${random(0, amount)}%
                0
            )`;

        saveStyle(el);
    }

    // ------------------------------------------------------------
    // Flicker
    // ------------------------------------------------------------

    function flicker(el) {
        el.style.opacity =
            String(
                random(0.3, 1)
            );

        saveStyle(el);

        setTimeout(() => {
            if (
                el.isConnected
            ) {
                el.style.opacity = "";
                saveStyle(el);
            }
        }, random(40, 180));
    }

    // ------------------------------------------------------------
    // Image corruption
    // ------------------------------------------------------------

    function image(el) {
        if (
            el.tagName !== "IMG"
        )
            return;

        el.style.filter =
            pick([
                "contrast(1.8)",
                "saturate(3)",
                "hue-rotate(60deg)",
                "hue-rotate(120deg)",
                "brightness(1.5)",
                "contrast(2.5) saturate(.4)",
                "invert(.5)"
            ]);

        saveStyle(el);
    }

    // ------------------------------------------------------------
    // Digital tearing
    // ------------------------------------------------------------

    function tear(el) {
        const r =
            el.getBoundingClientRect();

        if (
            r.width <= 0 ||
            r.height <= 0
        )
            return;

        const clone =
            el.cloneNode(true);

        clone.removeAttribute("id");

        clone.setAttribute(
            "data-glitch-artifact",
            ""
        );

        Object.assign(
            clone.style,
            {
                position: "fixed",
                left:
                    `${r.left + random(-25,25)}px`,
                top:
                    `${r.top + random(-5,5)}px`,
                width:
                    `${r.width}px`,
                height:
                    `${r.height}px`,
                pointerEvents: "none",
                opacity:
                    random(.03,.15),
                zIndex:
                    "2147483646",
                filter:
                    pick([
                        "hue-rotate(90deg)",
                        "hue-rotate(-90deg)",
                        "contrast(2)"
                    ])
            }
        );

        document.body.appendChild(
            clone
        );

        setTimeout(() => {
            clone.remove();
        }, random(30,150));
    }

    // ------------------------------------------------------------
    // One corruption event
    // ------------------------------------------------------------

    function corrupt(el) {
        if (!valid(el))
            return;

        const r =
            Math.random();

        if (r < .32)
            corruptText(el);

        else if (r < .48)
            rgb(el);

        else if (r < .59)
            displacement(el);

        else if (r < .68)
            flicker(el);

        else if (r < .77)
            clipping(el);

        else if (r < .84)
            color(el);

        else if (r < .92)
            tear(el);

        else if (
            el.tagName === "IMG"
        )
            image(el);
    }

    // ------------------------------------------------------------
    // Progressive corruption
    // ------------------------------------------------------------

    function wave() {
        const list =
            getElements();

        if (!list.length)
            return;

        /*
         * No maximum.
         *
         * Every wave gets stronger.
         */
        state.intensity += 0.025;

        /*
         * More and more elements get hit.
         */
        const amount =
            Math.min(
                list.length,
                Math.max(
                    1,
                    Math.floor(
                        1 +
                        Math.pow(
                            state.intensity,
                            0.15
                        )
                    )
                )
            );

        for (
            let i = 0;
            i < amount;
            i++
        ) {
            corrupt(
                pick(list)
            );
        }

        save();
    }

    // ------------------------------------------------------------
    // Restore FIRST
    // ------------------------------------------------------------

    restore();

    // ------------------------------------------------------------
    // Start corruption
    // ------------------------------------------------------------

    wave();

    const timer =
        setInterval(
            wave,
            100
        );

    // ------------------------------------------------------------
    // Watch dynamically generated DOM
    // ------------------------------------------------------------

    const observer =
        new MutationObserver(
            mutations => {

                for (
                    const mutation
                    of mutations
                ) {

                    for (
                        const node
                        of mutation.addedNodes
                    ) {

                        if (
                            !valid(node)
                        )
                            continue;

                        if (
                            Math.random() <
                            Math.min(
                                .5,
                                state.intensity *
                                .01
                            )
                        ) {
                            corrupt(node);
                        }
                    }
                }
            }
        );

    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );

    // ------------------------------------------------------------
    // Save periodically
    // ------------------------------------------------------------

    setInterval(
        save,
        1000
    );

    // ------------------------------------------------------------
    // Console controls
    // ------------------------------------------------------------

    window.domGlitch = {

        intensity() {
            return state.intensity;
        },

        burst(amount = 50) {
            const list =
                getElements();

            for (
                let i = 0;
                i < amount;
                i++
            ) {
                if (!list.length)
                    break;

                corrupt(
                    pick(list)
                );
            }

            save();
        },

        clear() {
            delete db[pageKey];

            localStorage.setItem(
                KEY,
                JSON.stringify(db)
            );

            location.reload();
        },

        info() {
            return {
                page: pageKey,
                intensity:
                    state.intensity,
                mutations:
                    Object.keys(
                        state.mutations
                    ).length
            };
        }
    };

    console.log(
        "%cPERSISTENT GLITCH ACTIVE",
        "color:#ff1744;font-weight:bold;font-size:16px"
    );

})();
