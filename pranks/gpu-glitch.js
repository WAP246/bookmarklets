// === ULTIMATE CINEMATIC GLITCH APOCALYPSE ===
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = 99999998;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Blackout overlay
const blackout = document.createElement('div');
Object.assign(blackout.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: 'black',
    opacity: '0',
    transition: 'opacity 0.3s linear',
    zIndex: 99999999
});
document.body.appendChild(blackout);

let intensity = 0;
const rand = (min, max) => Math.random() * (max - min) + min;

// === GLITCH EFFECT LOOP ===
function glitchFrame() {
    intensity += 0.005; // escalate chaos

    // Random canvas shake
    const shakeX = rand(-20, 20) * Math.min(intensity, 2);
    const shakeY = rand(-20, 20) * Math.min(intensity, 2);
    ctx.setTransform(1, 0, 0, 1, shakeX, shakeY);

    // Random screen collapse (jump effect)
    if (Math.random() < 0.02 * intensity) {
        const jumpX = rand(-50,50);
        const jumpY = rand(-50,50);
        ctx.translate(jumpX, jumpY);
    }

    ctx.clearRect(-shakeX, -shakeY, window.innerWidth, window.innerHeight);

    // Horizontal tearing bars
    const barCount = Math.floor(10 + intensity * 120);
    for (let i = 0; i < barCount; i++) {
        if (Math.random() < 0.5) {
            const y = rand(0, window.innerHeight);
            const height = rand(5, 100);
            const offsetX = rand(-400, 400);

            // RGB smear
            const r = `rgba(${Math.floor(rand(200,255))},0,0,${rand(0.05,0.5)})`;
            const g = `rgba(0,${Math.floor(rand(200,255))},0,${rand(0.05,0.5)})`;
            const b = `rgba(0,0,${Math.floor(rand(200,255))},${rand(0.05,0.5)})`;
            ctx.fillStyle = r; ctx.fillRect(offsetX, y, window.innerWidth, height);
            ctx.fillStyle = g; ctx.fillRect(offsetX + rand(-10,10), y, window.innerWidth, height);
            ctx.fillStyle = b; ctx.fillRect(offsetX + rand(-20,20), y, window.innerWidth, height);
        }
    }

    // Flickering static noise
    const noiseCount = Math.floor(rand(200,2000) * intensity);
    for (let i = 0; i < noiseCount; i++) {
        ctx.fillStyle = `rgba(${Math.floor(rand(0,255))},${Math.floor(rand(0,255))},${Math.floor(rand(0,255))},${rand(0.01,0.25)})`;
        ctx.fillRect(rand(0, window.innerWidth), rand(0, window.innerHeight), 1, 1);
    }

    // Scanlines
    ctx.fillStyle = `rgba(0,0,0,0.04)`;
    const lineHeight = 2;
    for (let y = 0; y < window.innerHeight; y += lineHeight*2) {
        ctx.fillRect(0, y, window.innerWidth, lineHeight);
    }

    // RGB channel smear (full screen displacement)
    if (Math.random() < 0.3 + intensity * 0.2) {
        const imgData = ctx.getImageData(0, 0, window.innerWidth, window.innerHeight);
        const shift = Math.floor(rand(-25, 25));
        for (let y = 0; y < window.innerHeight; y += 2) {
            for (let x = 0; x < window.innerWidth; x++) {
                const idx = (y * window.innerWidth + x) * 4;
                const newX = Math.min(window.innerWidth-1, Math.max(0, x + shift));
                const newIdx = (y * window.innerWidth + newX) * 4;
                imgData.data[newIdx] = imgData.data[idx];
                imgData.data[newIdx+1] = imgData.data[idx+1];
                imgData.data[newIdx+2] = imgData.data[idx+2];
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    // Progressive blackout
    blackout.style.opacity = Math.min(intensity * 0.7, 1);

    // Loop
    if (intensity < 5) {
        requestAnimationFrame(glitchFrame);
    } else {
        blackout.style.opacity = 1;
    }
}

// Start the cinematic apocalypse
glitchFrame();
