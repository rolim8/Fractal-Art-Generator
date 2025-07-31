const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');
const fractalType = document.getElementById('fractalType');
const colorScheme = document.getElementById('colorScheme');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const loading = document.getElementById('loading');

let currentFractal = null;
let kaleidoscopeMode = false;

const colorSchemes = {
    neon: {
        colors: [
            [0, [0, 0, 0]],
            [0.16, [255, 0, 255]],
            [0.33, [0, 255, 255]],
            [0.5, [255, 255, 0]],
            [0.66, [0, 255, 0]],
            [0.83, [255, 0, 0]],
            [1, [255, 255, 255]]
        ]
    },
    ocean: {
        colors: [
            [0, [0, 0, 20]],
            [0.2, [0, 20, 80]],
            [0.4, [0, 40, 120]],
            [0.6, [20, 80, 160]],
            [0.8, [60, 120, 200]],
            [0.9, [100, 160, 240]],
            [1, [255, 255, 255]]
        ]
    },
    sunset: {
        colors: [
            [0, [20, 0, 40]],
            [0.2, [80, 20, 80]],
            [0.4, [160, 40, 80]],
            [0.6, [220, 80, 60]],
            [0.8, [255, 120, 40]],
            [0.9, [255, 160, 20]],
            [1, [255, 200, 100]]
        ]
    },
    galaxy: {
        colors: [
            [0, [10, 0, 30]],
            [0.2, [40, 0, 80]],
            [0.4, [80, 20, 120]],
            [0.6, [120, 40, 160]],
            [0.8, [160, 80, 200]],
            [0.9, [200, 120, 240]],
            [1, [255, 180, 255]]
        ]
    },
    fractalFlame: {
        colors: [
            [0, [0, 0, 0]],
            [0.1, [30, 0, 50]],
            [0.3, [100, 20, 100]],
            [0.5, [200, 50, 80]],
            [0.7, [255, 100, 50]],
            [0.9, [255, 200, 100]],
            [1, [255, 255, 255]]
        ]
    },
    organic: {
        colors: [
            [0, [0, 20, 0]],
            [0.2, [20, 60, 20]],
            [0.4, [60, 120, 40]],
            [0.6, [120, 180, 80]],
            [0.8, [180, 220, 120]],
            [0.9, [220, 255, 160]],
            [1, [255, 255, 200]]
        ]
    }
};

function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    const maxWidth = container.clientWidth - 40;
    const maxHeight = container.clientHeight - 40;
    
    const size = Math.min(maxWidth, maxHeight, 800);
    canvas.width = size;
    canvas.height = size;
}

function getColor(iterations, maxIterations, scheme) {
    if (iterations === maxIterations) return [0, 0, 0];
    
    const t = Math.pow(iterations / maxIterations, 0.8);
    
    // Ensure scheme exists, fallback to 'neon' if not
    const selectedScheme = colorSchemes[scheme] || colorSchemes['neon'];
    const colors = selectedScheme.colors;
    
    let color1 = colors[0][1];
    let color2 = colors[colors.length - 1][1];
    let t2 = 0;
    
    for (let i = 0; i < colors.length - 1; i++) {
        if (t >= colors[i][0] && t <= colors[i + 1][0]) {
            color1 = colors[i][1];
            color2 = colors[i + 1][1];
            t2 = (t - colors[i][0]) / (colors[i + 1][0] - colors[i][0]);
            break;
        }
    }
    
    const r = Math.floor(color1[0] + (color2[0] - color1[0]) * t2);
    const g = Math.floor(color1[1] + (color2[1] - color1[1]) * t2);
    const b = Math.floor(color1[2] + (color2[2] - color1[2]) * t2);
    
    return [r, g, b];
}

function mandelbrot(c, maxIterations) {
    let z = { re: 0, im: 0 };
    let n = 0;
    
    while (n < maxIterations && (z.re * z.re + z.im * z.im) <= 4) {
        const newRe = z.re * z.re - z.im * z.im + c.re;
        const newIm = 2 * z.re * z.im + c.im;
        z.re = newRe;
        z.im = newIm;
        n++;
    }
    
    return n;
}

function julia(z, c, maxIterations) {
    let n = 0;
    let zTemp = { re: z.re, im: z.im };
    
    while (n < maxIterations && (zTemp.re * zTemp.re + zTemp.im * zTemp.im) <= 4) {
        const newRe = zTemp.re * zTemp.re - zTemp.im * zTemp.im + c.re;
        const newIm = 2 * zTemp.re * zTemp.im + c.im;
        zTemp.re = newRe;
        zTemp.im = newIm;
        n++;
    }
    
    return n;
}

function burningShip(c, maxIterations) {
    let z = { re: 0, im: 0 };
    let n = 0;
    
    while (n < maxIterations && (z.re * z.re + z.im * z.im) <= 4) {
        const newRe = z.re * z.re - z.im * z.im + c.re;
        const newIm = 2 * Math.abs(z.re * z.im) + c.im;
        z.re = Math.abs(newRe);
        z.im = Math.abs(newIm);
        n++;
    }
    
    return n;
}

function multibrot(c, maxIterations, power = 3) {
    let z = { re: 0, im: 0 };
    let n = 0;
    
    while (n < maxIterations && (z.re * z.re + z.im * z.im) <= 4) {
        const r = Math.sqrt(z.re * z.re + z.im * z.im);
        const theta = Math.atan2(z.im, z.re);
        const newRe = Math.pow(r, power) * Math.cos(power * theta) + c.re;
        const newIm = Math.pow(r, power) * Math.sin(power * theta) + c.im;
        z.re = newRe;
        z.im = newIm;
        n++;
    }
    
    return n;
}

function phoenix(z, c, maxIterations) {
    let zPrev = { re: 0, im: 0 };
    let zCurr = { re: z.re, im: z.im };
    let n = 0;
    
    while (n < maxIterations && (zCurr.re * zCurr.re + zCurr.im * zCurr.im) <= 4) {
        const newRe = zCurr.re * zCurr.re - zCurr.im * zCurr.im + c.re + 0.566 * zPrev.re;
        const newIm = 2 * zCurr.re * zCurr.im + c.im + 0.566 * zPrev.im;
        
        zPrev = { re: zCurr.re, im: zCurr.im };
        zCurr = { re: newRe, im: newIm };
        n++;
    }
    
    return n;
}

function lyapunov(c, maxIterations) {
    let sum = 0;
    let x = 0.5;
    
    for (let n = 0; n < maxIterations; n++) {
        const sequence = n % 2 === 0 ? c.re : c.im;
        x = sequence * x * (1 - x);
        
        if (x > 0 && x < 1) {
            sum += Math.log(Math.abs(sequence * (1 - 2 * x)));
        }
    }
    
    return Math.abs(sum / maxIterations) * 100;
}

function magneticPendulum(z, c, maxIterations) {
    const magnets = [
        { x: 1, y: 0 },
        { x: -0.5, y: 0.866 },
        { x: -0.5, y: -0.866 }
    ];
    
    let x = z.re;
    let y = z.im;
    let n = 0;
    
    while (n < maxIterations) {
        let forceX = 0;
        let forceY = 0;
        
        for (const magnet of magnets) {
            const dx = magnet.x - x;
            const dy = magnet.y - y;
            const dist = dx * dx + dy * dy;
            forceX += dx / (dist * dist);
            forceY += dy / (dist * dist);
        }
        
        const newX = x + forceX * 0.5;
        const newY = y + forceY * 0.5;
        
        if (Math.abs(newX - x) < 0.001 && Math.abs(newY - y) < 0.001) break;
        
        x = newX;
        y = newY;
        n++;
    }
    
    return n;
}

function fractalFlame(x, y, maxIterations) {
    const transformations = [
        (x, y) => [0.85 * x + 0.04 * y, -0.04 * x + 0.85 * y + 1.6],
        (x, y) => [0.2 * x - 0.26 * y, 0.23 * x + 0.22 * y + 1.6],
        (x, y) => [-0.15 * x + 0.28 * y, 0.26 * x + 0.24 * y + 0.44],
        (x, y) => [0, 0.16 * y]
    ];
    
    let px = 0;
    let py = 0;
    let iterations = 0;
    
    for (let i = 0; i < maxIterations; i++) {
        const rand = Math.random();
        let transform;
        
        if (rand < 0.85) transform = transformations[0];
        else if (rand < 0.92) transform = transformations[1];
        else if (rand < 0.99) transform = transformations[2];
        else transform = transformations[3];
        
        const [newX, newY] = transform(px, py);
        px = newX;
        py = newY;
        
        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (dist < 0.01) {
            iterations = i;
            break;
        }
    }
    
    return iterations;
}

function landscapeFractal(x, y, maxIterations) {
    const scale = 0.01;
    const height = Math.sin(x * scale) * Math.cos(y * scale) + 
                  0.5 * Math.sin(x * scale * 2) * Math.cos(y * scale * 3) +
                  0.25 * Math.sin(x * scale * 4) * Math.cos(y * scale * 5);
    
    return Math.floor((height + 1.75) * maxIterations / 3.5);
}

function organicFractal(x, y, maxIterations) {
    const r = Math.sqrt(x * x + y * y) * 0.01;
    const angle = Math.atan2(y, x);
    
    const branches = 5;
    const growth = Math.sin(branches * angle + r * 0.1) * Math.exp(-r * 0.01);
    
    return Math.floor((growth + 1) * maxIterations / 2);
}

function drawFractal(type, scheme) {
    loading.style.display = 'block';
    
    setTimeout(() => {
        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        const maxIterations = 200;
        
        // Generate random parameters for variety within each type
        const zoom = Math.random() * 4 + 0.3;
        const offsetX = (Math.random() - 0.5) * 4;
        const offsetY = (Math.random() - 0.5) * 4;
        
        // Additional random parameters for fractal variations
        const power = Math.random() * 4 + 2; // For multibrot variations
        const juliaRe = Math.random() * 2 - 1;
        const juliaIm = Math.random() * 2 - 1;
        const juliaC = { re: juliaRe, im: juliaIm };
        
        // Burning ship variations
        const burnScale = Math.random() * 2 + 0.5;
        const burnOffset = Math.random() * 0.5 - 0.25;
        
        for (let px = 0; px < width; px++) {
            for (let py = 0; py < height; py++) {
                let x, y;
                
                if (kaleidoscopeMode) {
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const relX = px - centerX;
                    const relY = py - centerY;
                    const angle = Math.atan2(relY, relX);
                    const radius = Math.sqrt(relX * relX + relY * relY);
                    
                    const segments = 6;
                    const segmentAngle = (Math.floor(angle * segments / (2 * Math.PI))) * (2 * Math.PI) / segments;
                    const rotatedX = radius * Math.cos(segmentAngle);
                    const rotatedY = radius * Math.sin(segmentAngle);
                    
                    x = (rotatedX) / (width / 4) / zoom + offsetX;
                    y = (rotatedY) / (height / 4) / zoom + offsetY;
                } else {
                    x = (px - width / 2) / (width / 4) / zoom;
                    y = (py - height / 2) / (height / 4) / zoom;
                }
                
                let iterations;
                const c = { re: x + offsetX, im: y + offsetY };
                const z = { re: x, im: y };
                
                switch (type) {
                    case 'mandelbrot':
                        iterations = mandelbrot(c, maxIterations);
                        break;
                    case 'julia':
                        iterations = julia(z, juliaC, maxIterations);
                        break;
                    case 'burningShip':
                        iterations = burningShip(c, maxIterations);
                        break;
                    case 'multibrot':
                        iterations = multibrot(c, maxIterations, power);
                        break;
                    case 'phoenix':
                        iterations = phoenix(z, juliaC, maxIterations);
                        break;
                    default:
                        iterations = mandelbrot(c, maxIterations);
                        break;
                }
                
                const color = getColor(iterations, maxIterations, scheme);
                const index = (py * width + px) * 4;
                
                data[index] = color[0];
                data[index + 1] = color[1];
                data[index + 2] = color[2];
                data[index + 3] = 255;
            }
        }
        
        if (kaleidoscopeMode) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(imageData, 0, 0);
            
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.translate(width / 2, height / 2);
            
            const segments = 6;
            for (let i = 0; i < segments; i++) {
                ctx.save();
                ctx.rotate((i * 2 * Math.PI) / segments);
                ctx.scale(1, 1);
                ctx.drawImage(tempCanvas, -width / 2, -height / 2);
                ctx.restore();
            }
            
            ctx.restore();
        } else {
            ctx.putImageData(imageData, 0, 0);
        }
        
        loading.style.display = 'none';
        currentFractal = { type, scheme };
    }, 100);
}

function generateNew() {
    const type = fractalType.value;
    const scheme = colorScheme.value;
    drawFractal(type, scheme);
}

function downloadImage() {
    if (!currentFractal) return;
    
    const link = document.createElement('a');
    link.download = `fractal-${currentFractal.type}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

function toggleKaleidoscope() {
    kaleidoscopeMode = !kaleidoscopeMode;
    if (currentFractal) {
        drawFractal(currentFractal.type, currentFractal.scheme);
    }
}

window.addEventListener('resize', () => {
    resizeCanvas();
    if (currentFractal) {
        drawFractal(currentFractal.type, currentFractal.scheme);
    }
});

canvas.addEventListener('click', generateNew);
generateBtn.addEventListener('click', generateNew);
downloadBtn.addEventListener('click', downloadImage);

fractalType.addEventListener('change', generateNew);
colorScheme.addEventListener('change', generateNew);

// Add this after the existing event listeners
const kaleidoscopeToggle = document.getElementById('kaleidoscopeToggle');
kaleidoscopeToggle.addEventListener('change', toggleKaleidoscope);

resizeCanvas();
generateNew();