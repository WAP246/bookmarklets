// === REALISTIC SCREEN FAILURE ===
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
    transition: 'opacity 0.2s linear',
    zIndex: 99999999
});
document.body.appendChild(blackout);

let intensity = 0;
const rand = (min, max) => Math.random() * (max - min) + min;

function screenFailureFrame() {
    intensity += 0.004;

    // Slight canvas shake like loose screen connection
    const shakeX = rand(-5, 5) * Math.min(intensity, 2);
    const shakeY = rand(-5, 5) * Math.min(intensity, 2);
    ctx.setTransform(1, 0, 0, 1, shakeX, shakeY);
    ctx.clearRect(-shakeX, -shakeY, window.innerWidth, window.innerHeight);

    // --- Simulate corrupted horizontal lines ---
    const lineCount = Math.floor(10 + intensity * 60);
    for (let i = 0; i < lineCount; i++) {
        const y = rand(0, window.innerHeight);
        const height = rand(1, 6);
        const offsetX = rand(-window.innerWidth * 0.5, window.innerWidth * 0.5);

        // Corrupted color stripes
        const r = `rgba(${Math.floor(rand(100,255))},0,0,${rand(0.05,0.5)})`;
        const g = `rgba(0,${Math.floor(rand(100,255))},0,${rand(0.05,0.5)})`;
        const b = `rgba(0,0,${Math.floor(rand(100,255))},${rand(0.05,0.5)})`;

        ctx.fillStyle = r; ctx.fillRect(offsetX, y, window.innerWidth, height);
        ctx.fillStyle = g; ctx.fillRect(offsetX + rand(-5,5), y, window.innerWidth, height);
        ctx.fillStyle = b; ctx.fillRect(offsetX + rand(-10,10), y, window.innerWidth, height);
    }

    // --- Flickering dead pixels ---
    const deadCount = Math.floor(200 * intensity);
    for (let i = 0; i < deadCount; i++) {
        const size = Math.random() < 0.7 ? 1 : rand(2,4);
        ctx.fillStyle = Math.random() < 0.5 ? 'black' : 'white';
        ctx.fillRect(rand(0, window.innerWidth), rand(0, window.innerHeight), size, size);
    }

    // --- Screen roll / vertical smear ---
    if (Math.random() < 0.2 + intensity * 0.1) {
        const imgData = ctx.getImageData(0, 0, window.innerWidth, window.innerHeight);
        const roll = Math.floor(rand(-20, 20));
        for (let y = 0; y < window.innerHeight; y++) {
            for (let x = 0; x < window.innerWidth; x++) {
                const idx = (y * window.innerWidth + x) * 4;
                const newY = Math.min(window.innerHeight-1, Math.max(0, y + roll));
                const newIdx = (newY * window.innerWidth + x) * 4;
                imgData.data[newIdx] = imgData.data[idx];
                imgData.data[newIdx+1] = imgData.data[idx+1];
                imgData.data[newIdx+2] = imgData.data[idx+2];
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    // --- Progressive blackout patches ---
    blackout.style.opacity = Math.min(intensity * 0.7, 1);

    // --- Random freeze frames ---
    if (Math.random() < 0.01 * intensity) {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    if (intensity < 5) {
        requestAnimationFrame(screenFailureFrame);
    } else {
        blackout.style.opacity = 1;
    }
}

screenFailureFrame();
