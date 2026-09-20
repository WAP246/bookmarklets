(() => {
    const STORAGE_KEY = "__persistent_dom_glitch__";

    // =========================================================
    // Persistent progression
    // =========================================================

    let state = {
        intensity: 0,
        lastUpdate: Date.now()
    };

    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        if (saved) {
            state.intensity =
                Number(saved.intensity) || 0;

            state.lastUpdate =
                Number(saved.lastUpdate) ||
                Date.now();
        }
    } catch {}

    // Increase based on time spent away from the page.
    const elapsed =
        Math.max(
            0,
            Date.now() - state.lastUpdate
        );

    state.intensity +=
        elapsed / 120000;

    state.intensity =
        Math.min(
            3,
            state.intensity
        );

    function saveState() {
        state.lastUpdate = Date.now();

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );
    }

    saveState();

    // =========================================================
    // Configuration
    // =========================================================

    const IGNORE = new Set([
        "SCRIPT",
        "STYLE",
        "META",
        "LINK",
        "TITLE",
        "HEAD",
        "HTML",
        "BODY",
        "CANVAS",
        "SVG",
        "PATH"
    ]);

    const SELECTORS = [
        "p",
        "span",
        "div",
        "h1",
        "h2",
        "h3",
        "h4",
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

    const GLITCH_CHARS =
        "█▓▒░╳╬┼│─<>/\\\\$#@%!?";

    // =========================================================
    // Helpers
    // =========================================================

    const random = (min, max) =>
        min + Math.random() * (max - min);

    const pick = array =>
        array[
            Math.floor(
                Math.random() * array.length
            )
        ];

    function isValid(el) {
        if (!el) return false;

        if (IGNORE.has(el.tagName))
            return false;

        if (
            el.hasAttribute(
                "data-glitch-ignore"
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

    function candidates() {
        return Array.from(
            document.querySelectorAll(
                SELECTORS.join(",")
            )
        ).filter(isValid);
    }

    // =========================================================
    // Text corruption
    // =========================================================

    function corruptText(el) {
        const walker =
            document.createTreeWalker(
                el,
                NodeFilter.SHOW_TEXT
            );

        const nodes = [];

        while (walker.nextNode()) {
            if (
                walker.currentNode.nodeValue.trim()
            ) {
                nodes.push(
                    walker.currentNode
                );
            }
        }

        if (!nodes.length) return;

        const node = pick(nodes);

        const text =
            node.nodeValue.split("");

        const corruption =
            Math.max(
                1,
                Math.floor(
                    text.length *
                    (
                        0.01 +
                        state.intensity * 0.07
                    )
                )
            );

        for (
            let i = 0;
            i < corruption;
            i++
        ) {
            const index =
                Math.floor(
                    Math.random() *
                    text.length
                );

            if (
                text[index] === " " ||
                text[index] === "\n"
            ) {
                continue;
            }

            const mode =
                Math.random();

            if (mode < 0.7) {
                text[index] =
                    pick(
                        GLITCH_CHARS
                    );
            } else {
                text[index] = "";
            }
        }

        node.nodeValue =
            text.join("");
    }

    // =========================================================
    // Physical displacement
    // =========================================================

    function distort(el) {
        const x =
            random(
                -1,
                1
            ) *
            state.intensity *
            10;

        const y =
            random(
                -1,
                1
            ) *
            state.intensity *
            4;

        const skew =
            random(
                -1,
                1
            ) *
            state.intensity *
            2;

        el.style.transform =
            `translate(${x}px,${y}px) skewX(${skew}deg)`;
    }

    // =========================================================
    // RGB separation
    // =========================================================

    function rgbShift(el) {
        const amount =
            random(
                1,
                3 + state.intensity * 5
            );

        el.style.textShadow =
            `${amount}px 0 rgba(255,0,0,.45),
             ${-amount}px 0 rgba(0,100,255,.45)`;
    }

    // =========================================================
    // Flicker
    // =========================================================

    function flicker(el) {
        el.style.opacity =
            random(
                0.25,
                1
            );

        // Occasionally leave it nearly invisible.
        if (
            Math.random() <
            0.1 * state.intensity
        ) {
            el.style.opacity =
                random(
                    0.05,
                    0.3
                );
        }
    }

    // =========================================================
    // Color corruption
    // =========================================================

    function colorCorruption(el) {
        const colors = [
            "#ff003c",
            "#00e5ff",
            "#ff00aa",
            "#ffffff",
            "#66ff00"
        ];

        el.style.color =
            pick(colors);
    }

    // =========================================================
    // Broken clipping
    // =========================================================

    function clip(el) {
        const top =
            random(
                0,
                state.intensity * 20
            );

        const bottom =
            random(
                0,
                state.intensity * 20
            );

        const left =
            random(
                0,
                state.intensity * 5
            );

        const right =
            random(
                0,
                state.intensity * 5
            );

        el.style.clipPath =
            `inset(${top}% ${right}% ${bottom}% ${left}%)`;
    }

    // =========================================================
    // Horizontal displacement
    // =========================================================

    function tear(el) {
        const rect =
            el.getBoundingClientRect();

        const clone =
            el.cloneNode(true);

        clone.setAttribute(
            "data-glitch-fragment",
            ""
        );

        Object.assign(
            clone.style,
            {
                position: "fixed",
                left:
                    `${rect.left +
                    random(
                        -20,
                        20
                    )}px`,
                top:
                    `${rect.top +
                    random(
                        -3,
                        3
                    )}px`,
                width:
                    `${rect.width}px`,
                height:
                    `${rect.height}px`,
                pointerEvents:
                    "none",
                opacity:
                    random(
                        0.03,
                        0.15
                    ),
                filter:
                    Math.random() <
                    0.5
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
            () => clone.remove(),
            random(30, 150)
        );
    }

    // =========================================================
    // Image corruption
    // =========================================================

    function corruptImage(el) {
        if (
            el.tagName !== "IMG"
        ) {
            return;
        }

        const filters = [
            "contrast(2)",
            "saturate(4)",
            "hue-rotate(90deg)",
            "brightness(1.8)",
            "invert(.8)",
            "contrast(3) saturate(.3)"
        ];

        el.style.filter =
            pick(filters);
    }

    // =========================================================
    // Inputs / buttons
    // =========================================================

    function corruptUI(el) {
        if (
            el.tagName !== "BUTTON" &&
            el.tagName !== "INPUT"
        ) {
            return;
        }

        if (
            Math.random() <
            0.5
        ) {
            el.style.borderColor =
                "#ff003c";
        }

        if (
            Math.random() <
            0.3
        ) {
            el.style.background =
                "#111";
        }

        if (
            Math.random() <
            0.2
        ) {
            el.style.cursor =
                "not-allowed";
        }
    }

    // =========================================================
    // Pick one corruption
    // =========================================================

    function mutate(el) {
        if (!isValid(el))
            return;

        const roll =
            Math.random();

        if (roll < 0.25) {
            corruptText(el);
        }
        else if (roll < 0.40) {
            distort(el);
        }
        else if (roll < 0.53) {
            rgbShift(el);
        }
        else if (roll < 0.65) {
            flicker(el);
        }
        else if (roll < 0.75) {
            clip(el);
        }
        else if (roll < 0.84) {
            colorCorruption(el);
        }
        else if (roll < 0.92) {
            tear(el);
        }
        else if (el.tagName === "IMG") {
            corruptImage(el);
        }
        else {
            corruptUI(el);
        }
    }

    // =========================================================
    // Mutation observer
    //
    // This is important: if the page itself creates new
    // elements later, they can become corrupted too.
    // =========================================================

    const observer =
        new MutationObserver(
            mutations => {
                if (
                    state.intensity < 0.5
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
                            state.intensity * 0.15
                        ) {
                            mutate(node);
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
    // Main corruption loop
    // =========================================================

    function corruptionTick() {
        const list =
            candidates();

        if (!list.length)
            return;

        // Starts subtle and becomes increasingly aggressive.
        const count =
            Math.max(
                1,
                Math.floor(
                    1 +
                    state.intensity *
                    state.intensity *
                    4
                )
            );

        for (
            let i = 0;
            i < count;
            i++
        ) {
            mutate(
                pick(list)
            );
        }
    }

    setInterval(
        corruptionTick,
        300
    );

    // =========================================================
    // Progression
    // =========================================================

    let last =
        performance.now();

    function progression(now) {
        const delta =
            Math.min(
                now - last,
                100
            );

        last = now;

        // Roughly one intensity level every 2 minutes.
        state.intensity +=
            delta / 120000;

        state.intensity =
            Math.min(
                3,
                state.intensity
            );

        if (
            Math.random() < 0.01
        ) {
            saveState();
        }

        requestAnimationFrame(
            progression
        );
    }

    requestAnimationFrame(
        progression
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

            saveState();
        },

        resetProgress() {
            localStorage.removeItem(
                STORAGE_KEY
            );

            location.reload();
        }
    };

    console.log(
        "%cDOM GLITCH",
        "color:#ff003c;font-weight:bold",
        `Intensity: ${state.intensity.toFixed(2)}`
    );
})();
