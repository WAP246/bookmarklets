// Main blackout layer
const blackout = document.createElement('div');
blackout.style.position = 'fixed';
blackout.style.top = 0;
blackout.style.left = 0;
blackout.style.width = '100%';
blackout.style.height = '100%';
blackout.style.pointerEvents = 'none';
blackout.style.background = 'black';
blackout.style.opacity = '0';
blackout.style.transition = 'opacity 2s ease';
blackout.style.zIndex = 99999999;
document.body.appendChild(blackout);

// Glitch layer
const glitch = document.createElement('div');
glitch.style.position = 'fixed';
glitch.style.top = 0;
glitch.style.left = 0;
glitch.style.width = '100%';
glitch.style.height = '100%';
glitch.style.pointerEvents = 'none';
glitch.style.zIndex = 99999998;
document.body.appendChild(glitch);

let intensity = 0;

function glitchFrame() {
    intensity += 0.002; // progressively worse
    const chance = Math.min(0.05 + intensity, 0.5);
    const barCount = Math.floor(3 + intensity * 50);

    // Trigger glitch
    if (Math.random() < chance) {
        const bars = [];
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.style.position = 'absolute';
            bar.style.left = 0;
            bar.style.width = '100%';
            bar.style.height = (5 + Math.random() * 80) + 'px';
            bar.style.top = Math.random() * innerHeight + 'px';
            bar.style.background = `rgba(
                ${Math.random() * 255},
                ${Math.random() * 255},
                ${Math.random() * 255},
                ${0.1 + Math.random() * 0.9}
            )`;
            bar.style.transform = `translateX(${(Math.random() - 0.5) * 200}px)`;
            bars.push(bar);
            glitch.appendChild(bar);
        }

        setTimeout(() => bars.forEach(b => b.remove()), 100 + intensity * 500);
    }

    // Darkening over time
    blackout.style.opacity = Math.min(intensity * 0.4, 1);

    // Stop once fully black
    if (intensity < 2.5) {
        requestAnimationFrame(glitchFrame);
    } else {
        blackout.style.opacity = 1;
    }
}

glitchFrame();
