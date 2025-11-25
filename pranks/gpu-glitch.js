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

let intensity = 0;
let frozen = false;

function glitchFrame() {
    if (!frozen) {
        intensity += 0.002; // progressively worse

        // Slight smear effect to blend previous frames
        ctx.fillStyle = 'rgba(0,0,0,0.03)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const glitchCount = Math.floor(5 + intensity * 60);

        for (let i = 0; i < glitchCount; i++) {
            const width = 20 + Math.random() * 200;
            const height = 5 + Math.random() * 100;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;

            const rShift = Math.random() * 50;
            const gShift = Math.random() * 50;
            const bShift = Math.random() * 50;
            const alpha = 0.1 + Math.random() * 0.5;

            ctx.fillStyle = `rgba(${Math.floor(255 * Math.random()) + rShift}, ${Math.floor(255 * Math.random()) + gShift}, ${Math.floor(255 * Math.random()) + bShift}, ${alpha})`;

            // Randomly choose horizontal, vertical, or block
            const type = Math.random();
            if (type < 0.4) {
                // Horizontal bar
                ctx.fillRect(x, y, width, height);
            } else if (type < 0.7) {
                // Vertical bar
                ctx.fillRect(x, y, height, width);
            } else {
                // Random block
                ctx.fillRect(x, y, width / 2, height / 2);
            }
        }

        // Flicker effect
        if (Math.random() < 0.1) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Freeze screen at high intensity
        if (intensity >= 2.5) {
            frozen = true;

            // Final static damage effect
            for (let y = 0; y < canvas.height; y += 2) {
                for (let x = 0; x < canvas.width; x += 2) {
                    const v = Math.random() * 255;
                    ctx.fillStyle = `rgba(${v},${v},${v},0.3)`;
                    ctx.fillRect(x, y, 2, 2);
                }
            }
        }
    }

    requestAnimationFrame(glitchFrame);
}

// Start glitch loop
glitchFrame();
