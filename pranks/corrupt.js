(() => {
    "use strict";

    const KEY = "__corruption_state_v4__";

    // Don't run twice on the same page.
    if (window.__CORRUPTION_RUNNING__) {
        console.log("Corruption is already running.");
        return;
    }

    window.__CORRUPTION_RUNNING__ = true;

    // =========================================================
    // Persistent state
    // =========================================================

    let state = {
        intensity: 0,
        lastTime: Date.now()
    };

    try {
        const saved = localStorage.getItem(KEY);

        if (saved) {
            const parsed = JSON.parse(saved);

            if (parsed) {
                state.intensity =
                    Number(parsed.intensity) || 0;

                state.lastTime =
                    Number(parsed.lastTime) ||
                    Date.now();
            }
        }
    } catch {}

    // Increase corruption while the page was closed.
    const elapsed =
        Math.max(
            0,
            Date.now() - state.lastTime
        );

    state.intensity +=
        elapsed / 180000; // ~3 minutes per level

    state.intensity =
        Math.min(3, state.intensity);

    function save() {
        state.lastTime = Date.now();

        try {
            localStorage.setItem(
                KEY,
                JSON.stringify(state)
            );
        } catch {}
    }

    save();

    // =========================================================
    // Configuration
    // =========================================================

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
        "p",
        "span",
        "a",
        "button",
        "li",
        "label",
        "strong",
        "em",
        "td",
        "th",
        "img",
        "input"
    ];

    const glitchChars =
        "█▓▒░╳╬┼│─<>/\\\\$#@%!?";

    // =========================================================
    // Helpers
    // =========================================================

    const random = (min, max) =>
        min + Math.random() * (max - min);

    const pick = arr =>
        arr[
            Math.floor(
                Math.random() * arr.length
            )
        ];

    function valid(el) {
        if (!el || el.nodeType !== 1)
            return false;

        if (ignored.has(el.tagName))
            return false;

        if (
            el.hasAttribute(
                "data-corruption-artifact"
            )
        ) {
            return false;
        }

        if (
            el.hasAttribute(
                "data-corruption-ignore"
            )
        ) {
            return false;
        }

        const rect =
            el.getBoundingClientRect();

        return (
            rect.width > 3 &&
            rect.height > 3
        );
    }

    function elements() {
        return Array.from(
            document.querySelectorAll(
                selectors.join(",")
            )
        ).filter(valid);
    }

    // =========================================================
    // TEXT DAMAGE
    // =========================================================

    function damageText(el) {
        const walker =
            document.createTreeWalker(
                el,
                NodeFilter.SHOW_TEXT
            );

        const nodes = [];

        while (walker.nextNode()) {
            if (
                walker.currentNode.nodeValue &&
                walker.currentNode.nodeValue.trim()
            ) {
                nodes.push(
                    walker.currentNode
                );
            }
        }

        if (!nodes.length)
            return;

        const node = pick(nodes);

        const chars =
            node.nodeValue.split("");

        // Corruption gets progressively more obvious.
        const probability =
            0.01 +
            state.intensity * 0.055;

        for (
            let i = 0;
            i < chars.length;
            i++
        ) {
            if (
                chars[i] === " "
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
    }

    // =========================================================
    // REAL LAYOUT DAMAGE
    // =========================================================

    function damagePosition(el) {
        const x =
            random(
                -1,
                1
            ) *
            state.intensity *
            7;

        const y =
            random(
                -1,
                1
            ) *
            state.intensity *
            3;

        const skew =
            random(
                -1,
                1
            ) *
            state.intensity *
            1.5;

        el.style.transform =
            `translate(${x}px,${y}px) skewX(${skew}deg)`;
    }

    // =========================================================
    // RGB DISPLAY ERROR
    // =========================================================

    function damageColor(el) {
        const amount =
            random(
                1,
                2 +
                state.intensity * 5
            );

        el.style.textShadow =
            `${amount}px 0 rgba(255,0,0,.4),
             ${-amount}px 0 rgba(0,120,255,.4)`;
    }

    // =========================================================
    // FLICKER
    // =========================================================

    function flicker(el) {
        el.style.opacity =
            random(
                0.45,
                1
            );

        if (
            Math.random() <
            state.intensity * 0.08
        ) {
            el.style.visibility =
                "hidden";

            setTimeout(() => {
                if (el.isConnected) {
                    el.style.visibility =
                        "";
                }
            }, random(30, 150));
        }
    }

    // =========================================================
    // COLOR CORRUPTION
    // =========================================================

    function colorDamage(el) {
        el.style.color =
            pick([
                "#ff1744",
                "#00e5ff",
                "#ff00aa",
                "#7cff00",
                "#ffffff"
            ]);
    }

    // =========================================================
    // BROKEN CLIPPING
    // =========================================================

    function clipping(el) {
        const top =
            random(
                0,
                state.intensity * 15
            );

        const bottom =
            random(
                0,
                state.intensity * 15
            );

        el.style.clipPath =
            `inset(${top}% 0 ${bottom}% 0)`;
    }

    // =========================================================
    // IMAGE CORRUPTION
    // =========================================================

    function imageDamage(el) {
        if (
            el.tagName !== "IMG"
        ) {
            return;
        }

        el.style.filter =
            pick([
                "contrast(2)",
                "saturate(4)",
                "hue-rotate(90deg)",
                "brightness(1.7)",
                "contrast(3) saturate(.3)",
                "invert(.65)"
            ]);
    }

    // =========================================================
    // DIGITAL TEARING
    // =========================================================

    function tear(el) {
        const rect =
            el.getBoundingClientRect();

        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return;
        }

        const clone =
            el.cloneNode(true);

        clone.removeAttribute("id");

        clone.setAttribute(
            "data-corruption-artifact",
            ""
        );

        Object.assign(
            clone.style,
            {
                position: "fixed",

                left:
                    `${rect.left +
                    random(-20, 20)}px`,

                top:
                    `${rect.top +
                    random(-4, 4)}px`,

                width:
                    `${rect.width}px`,

                height:
                    `${rect.height}px`,

                pointerEvents:
                    "none",

                opacity:
                    random(
                        0.03,
                        0.13
                    ),

                filter:
                    Math.random() < 0.5
                        ? "hue-rotate(90deg)"
                        : "hue-rotate(-90deg)",

                zIndex:
                    "2147483646"
            }
        );

        document.body.appendChild(
            clone
        );

        setTimeout(
            () => {
                if (clone.isConnected)
                    clone.remove();
            },
            random(30, 130)
        );
    }

    // =========================================================
    // BUTTON / INPUT DAMAGE
    // =========================================================

    function uiDamage(el) {
        if (
            el.tagName !== "BUTTON" &&
            el.tagName !== "INPUT"
        ) {
            return;
        }

        if (
            Math.random() < 0.5
        ) {
            el.style.borderColor =
                "#ff1744";
        }

        if (
            Math.random() < 0.3
        ) {
            el.style.background =
                "#111";
        }

        if (
            Math.random() < 0.2
        ) {
            el.style.cursor =
                "not-allowed";
        }
    }

    // =========================================================
    // ONE CORRUPTION EVENT
    // =========================================================

    function corrupt(el) {
        if (!valid(el))
            return;

        const roll =
            Math.random();

        if (roll < 0.28) {
            damageText(el);
        }
        else if (roll < 0.43) {
            damagePosition(el);
        }
        else if (roll < 0.55) {
            damageColor(el);
        }
        else if (roll < 0.67) {
            flicker(el);
        }
        else if (roll < 0.76) {
            clipping(el);
        }
        else if (roll < 0.84) {
            colorDamage(el);
        }
        else if (roll < 0.92) {
            tear(el);
        }
        else if (
            el.tagName === "IMG"
        ) {
            imageDamage(el);
        }
        else {
            uiDamage(el);
        }
    }

    // =========================================================
    // CONTINUOUS CORRUPTION
    // =========================================================

    function tick() {
        const list =
            elements();

        if (!list.length)
            return;

        /*
         * Intensity 0:
         *   basically nothing
         *
         * Intensity 1:
         *   occasional errors
         *
         * Intensity 2:
         *   obvious degradation
         *
         * Intensity 3:
         *   severe corruption
         */
        const amount =
            Math.max(
                1,
                Math.floor(
                    1 +
                    state.intensity *
                    state.intensity *
                    3
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
    }

    // Start immediately.
    tick();

    const interval =
        setInterval(
            tick,
            300
        );

    // =========================================================
    // Catch dynamically-created elements
    // =========================================================

    const observer =
        new MutationObserver(
            mutations => {
                if (
                    state.intensity <
                    0.4
                ) {
                    return;
                }

                for (
                    const mutation
                    of mutations
                ) {
                    for (
                        const node
                        of mutation.addedNodes
                    ) {
                        if (
                            node.nodeType !== 1
                        ) {
                            continue;
                        }

                        if (
                            Math.random() <
                            state.intensity *
                            0.15
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

    // =========================================================
    // Progressive degradation
    // =========================================================

    let previous =
        performance.now();

    function progression(now) {
        const delta =
            Math.min(
                now - previous,
                100
            );

        previous = now;

        state.intensity +=
            delta / 180000;

        state.intensity =
            Math.min(
                3,
                state.intensity
            );

        requestAnimationFrame(
            progression
        );
    }

    requestAnimationFrame(
        progression
    );

    // Save every second.
    const saver =
        setInterval(
            save,
            1000
        );

    // =========================================================
    // Controls
    // =========================================================

    window.domGlitch = {
        get intensity() {
            return state.intensity;
        },

        setIntensity(value) {
            state.intensity =
                Math.max(
                    0,
                    Math.min(
                        3,
                        Number(value) || 0
                    )
                );

            save();

            console.log(
                "Corruption:",
                state.intensity
            );
        },

        resetProgress() {
            clearInterval(interval);
            clearInterval(saver);

            localStorage.removeItem(
                KEY
            );

            location.reload();
        }
    };

    console.log(
        "%cCORRUPTION ACTIVE",
        "color:#ff1744;font-weight:bold;font-size:16px"
    );

    console.log(
        "Intensity:",
        state.intensity.toFixed(2)
    );

    console.log(
        "Test with: domGlitch.setIntensity(3)"
    );
})();
