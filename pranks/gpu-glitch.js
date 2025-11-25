// Main blackout layer
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

// Glitch layer
const glitch = document.createElement('div');
Object.assign(glitch.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 99999998
});
document.body.appendChild(glitch);

let intensity = 0;

function glitchFrame() {
    intensity += 0.002; // progressively worse
    const chance = Math.min(0.05 + intensity, 0.5);
    const barCount = Math.floor(3 + intensity * 50);

    if (Math.random() < chance) {
        const bars = [];
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            Object.assign(bar.style, {
                position: 'absolute',
                left: '0',
                width: '100%',
                height: (5 + Math.random() * 80) + 'px',
                top: Math.random() * window.innerHeight + 'px',
                background: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${0.1 + Math.random() * 0.9})`,
                transform: `translateX(${(Math.random() - 0.5) * 200}px)`
            });
            bars.push(bar);
            glitch.appendChild(bar);
        }

        setTimeout(() => bars.forEach(b => b.remove()), 100 + intensity * 500);
    }

    blackout.style.opacity = Math.min(intensity * 0.4, 1);

    if (intensity < 2.5) {
        requestAnimationFrame(glitchFrame);
    } else {
        blackout.style.opacity = 1;
    }
}

// Start the glitch loop
glitchFrame();
