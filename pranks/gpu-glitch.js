// Create canvas
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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Blackout layer
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
    transition: 'opacity 2s ease',
    zIndex: 99999999
});
document.body.appendChild(blackout);

let intensity = 0;

function glitchFrame() {
    intensity += 0.002; // progressively worse

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chance = Math.min(0.05 + intensity, 0.5);
    const barCount = Math.floor(3 + intensity * 50);

    if (Math.random() < chance) {
        for (let i = 0; i < barCount; i++) {
            const height = 5 + Math.random() * 80;
            const y = Math.random() * canvas.height;
            const color = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${0.1 + Math.random() * 0.9})`;
            const offsetX = (Math.random() - 0.5) * 200;

            ctx.fillStyle = color;
            ctx.fillRect(offsetX, y, canvas.width, height);
        }
    }

    // Update blackout opacity
    blackout.style.opacity = Math.min(intensity * 0.4, 1);

    if (intensity < 2.5) {
        requestAnimationFrame(glitchFrame);
    } else {
        blackout.style.opacity = 1;
    }
}

// Start the glitch loop
glitchFrame();
