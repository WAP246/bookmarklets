(() => {
    const STORAGE_KEY = 'persistent_glitch_state';

    // -----------------------------
    // Persistent state
    // -----------------------------
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    let intensity = Number.isFinite(saved.intensity)
        ? saved.intensity
        : 0;

    let frozen = !!saved.frozen;
    let lastSave = 0;

    // Progression survives reloads.
    // ~1 intensity point every 2 minutes.
    const startTime = saved.startTime || Date.now();
    const elapsed = Date.now() - startTime;

    intensity = Math.min(
        3,
        Math.max(intensity, elapsed / 120000)
    );

    function saveState(force = false) {
        const now = Date.now();

        if (!force && now - lastSave < 1000) return;

        lastSave = now;

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                intensity,
                frozen,
                startTime
            })
        );
    }

    // -----------------------------
    // Canvas
    // -----------------------------
    const canvas = document.createElement('canvas');

    Object.assign(canvas.style, {
        position: 'fixed',
        inset: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '2147483647',
        mixBlendMode: 'screen'
    });

    document.documentElement.appendChild(canvas);

    const ctx = canvas.getContext('2d', {
        alpha: true,
        desynchronized: true
    });

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resizeCanvas() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    // -----------------------------
    // Utility functions
    // -----------------------------
    const rand = (min, max) =>
        min + Math.random() * (max - min);

    const chance = probability =>
        Math.random() < probability;

    function rgba(r, g, b, a) {
        return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
    }

    // -----------------------------
    // Scanlines
    // -----------------------------
    function drawScanlines() {
        const alpha = 0.025 + intensity * 0.015;

        ctx.fillStyle = `rgba(0,0,0,${alpha})`;

        const spacing = intensity > 2 ? 2 : 3;

        for (let y = 0; y < height; y += spacing) {
            ctx.fillRect(0, y, width, 1);
        }
    }

    // -----------------------------
    // Fine analog noise
    // -----------------------------
    function drawNoise() {
        const amount =
            150 +
            intensity * 500;

        for (let i = 0; i < amount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;

            const brightness = rand(80, 255);
            const alpha = rand(
                0.015,
                0.04 + intensity * 0.025
            );

            ctx.fillStyle = rgba(
                brightness,
                brightness,
                brightness,
                alpha
            );

            ctx.fillRect(
                x,
                y,
                rand(0.5, 2),
                rand(0.5, 2)
            );
        }
    }

    // -----------------------------
    // Chromatic aberration
    // -----------------------------
    function drawColorFringing() {
        if (intensity < 0.35) return;

        const amount =
            1 + intensity * 4;

        for (let i = 0; i < amount; i++) {
            const y = Math.random() * height;
            const h = rand(1, 4 + intensity * 8);

            const offset = rand(
                2,
                4 + intensity * 15
            );

            const alpha =
                0.025 + intensity * 0.02;

            ctx.fillStyle = rgba(255, 0, 40, alpha);
            ctx.fillRect(
                -offset,
                y,
                width,
                h
            );

            ctx.fillStyle = rgba(0, 80, 255, alpha);
            ctx.fillRect(
                offset,
                y,
                width,
                h
            );
        }
    }

    // -----------------------------
    // Horizontal signal tearing
    // -----------------------------
    function drawTearing() {
        if (intensity < 0.4) return;

        const probability =
            0.015 + intensity * 0.025;

        if (!chance(probability)) return;

        const strips = Math.floor(
            rand(1, 2 + intensity * 4)
        );

        for (let i = 0; i < strips; i++) {
            const y = rand(0, height);
            const h = rand(
                1,
                3 + intensity * 18
            );

            const offset = rand(
                -20,
                20 + intensity * 80
            );

            // Dark separation line
            ctx.fillStyle = `rgba(0,0,0,${
                0.08 + intensity * 0.04
            })`;

            ctx.fillRect(
                0,
                y,
                width,
                h
            );

            // Colored signal edge
            if (chance(0.7)) {
                ctx.fillStyle = rgba(
                    255,
                    30,
                    30,
                    0.05 + intensity * 0.025
                );

                ctx.fillRect(
                    offset,
                    y,
                    width,
                    Math.max(1, h / 2)
                );
            }
        }
    }

    // -----------------------------
    // Digital corruption blocks
    // -----------------------------
    function drawBlocks() {
        const count = Math.floor(
            intensity * intensity * 4
        );

        for (let i = 0; i < count; i++) {
            const w = rand(
                5,
                30 + intensity * 100
            );

            const h = rand(
                1,
                4 + intensity * 20
            );

            const x = rand(-w, width);
            const y = rand(0, height);

            const colors = [
                [255, 20, 40],
                [20, 180, 255],
                [255, 255, 255],
                [40, 40, 40]
            ];

            const color =
                colors[
                    Math.floor(
                        Math.random() * colors.length
                    )
                ];

            ctx.fillStyle = rgba(
                color[0],
                color[1],
                color[2],
                rand(
                    0.03,
                    0.12 + intensity * 0.04
                )
            );

            ctx.fillRect(x, y, w, h);
        }
    }

    // -----------------------------
    // Occasional white flash
    // -----------------------------
    function drawFlash() {
        const probability =
            0.002 + intensity * 0.004;

        if (!chance(probability)) return;

        ctx.fillStyle = rgba(
            255,
            255,
            255,
            rand(0.02, 0.12)
        );

        ctx.fillRect(0, 0, width, height);
    }

    // -----------------------------
    // Severe static
    // -----------------------------
    function drawStatic() {
        if (intensity < 2.3) return;

        const strength =
            (intensity - 2.3) / 0.7;

        const count = Math.floor(
            3000 + strength * 10000
        );

        for (let i = 0; i < count; i++) {
            const v = Math.random() * 255;

            ctx.fillStyle = rgba(
                v,
                v,
                v,
                rand(0.03, 0.14)
            );

            const size = chance(0.8) ? 1 : 2;

            ctx.fillRect(
                Math.random() * width,
                Math.random() * height,
                size,
                size
            );
        }
    }

    // -----------------------------
    // Progressive failure
    // -----------------------------
    function updateIntensity(delta) {
        if (frozen) return;

        // Slow natural degradation.
        intensity += delta * 0.00001;

        intensity = Math.min(
            intensity,
            3
        );

        if (intensity >= 3) {
            intensity = 3;
            frozen = true;
            saveState(true);
        }
    }

    // -----------------------------
    // Main loop
    // -----------------------------
    let previous = performance.now();

    function glitchFrame(now) {
        const delta = Math.min(
            now - previous,
            100
        );

        previous = now;

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        if (!frozen) {
            updateIntensity(delta);

            // Subtle base interference
            drawNoise();

            // Increasingly obvious artifacts
            drawScanlines();
            drawColorFringing();
            drawTearing();
            drawBlocks();
            drawFlash();

            if (intensity > 1.5) {
                drawStatic();
            }
        } else {
            // Permanent final corrupted state.
            drawScanlines();
            drawStatic();
            drawTearing();
        }

        saveState();

        requestAnimationFrame(glitchFrame);
    }

    requestAnimationFrame(glitchFrame);

    // -----------------------------
    // Optional reset API
    // -----------------------------
    window.resetGlitch = () => {
        localStorage.removeItem(STORAGE_KEY);

        intensity = 0;
        frozen = false;

        location.reload();
    };

    // Optional debug API
    window.glitchState = () => ({
        intensity,
        frozen,
        startTime,
        elapsed: Date.now() - startTime
    });
})();
