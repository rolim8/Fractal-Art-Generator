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
    electric: {
        colors: [
            [0, [0, 0, 50]],
            [0.15, [0, 255, 255]],
            [0.3, [0, 100, 255]],
            [0.5, [255, 0, 255]],
            [0.7, [255, 255, 0]],
            [0.85, [255, 100, 0]],
            [1, [255, 255, 255]]
        ]
    },
    fire: {
        colors: [
            [0, [0, 0, 0]],
            [0.1, [255, 0, 0]],
            [0.3, [255, 100, 0]],
            [0.5, [255, 200, 0]],
            [0.7, [255, 255, 100]],
            [0.9, [255, 255, 255]],
            [1, [255, 255, 255]]
        ]
    },
    toxic: {
        colors: [
            [0, [0, 0, 0]],
            [0.2, [0, 255, 0]],
            [0.4, [100, 255, 0]],
            [0.6, [255, 255, 0]],
            [0.8, [255, 100, 0]],
            [0.9, [255, 0, 255]],
            [1, [255, 255, 255]]
        ]
    },
    prism: {
        colors: [
            [0, [0, 0, 0]],
            [0.16, [255, 0, 128]],
            [0.33, [128, 0, 255]],
            [0.5, [0, 128, 255]],
            [0.66, [0, 255, 128]],
            [0.83, [255, 128, 0]],
            [1, [255, 255, 255]]
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
    
    // Add more dynamic variation based on random seed
    const time = Date.now() * 0.001;
    const seed = Math.sin(time + iterations) * 0.5 + 0.5;
    
    // Enhanced color interpolation with more vivid results
    const baseT = Math.pow(iterations / maxIterations, 0.6 + Math.sin(time) * 0.2);
    const t = Math.max(0, Math.min(1, baseT + seed * 0.1 - 0.05));
    
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
    
    // Enhanced color mixing with saturation boost
    const mix = (c1, c2, factor) => {
        const val = c1 + (c2 - c1) * factor;
        return Math.floor(Math.pow(val / 255, 0.8) * 255);
    };
    
    let r = mix(color1[0], color2[0], t2);
    let g = mix(color1[1], color2[1], t2);
    let b = mix(color1[2], color2[2], t2);
    
    // Boost saturation and brightness
    const maxColor = Math.max(r, g, b);
    if (maxColor > 0) {
        const boost = 1.2 + Math.sin(time * 2) * 0.3;
        r = Math.min(255, Math.floor(r * boost));
        g = Math.min(255, Math.floor(g * boost));
        b = Math.min(255, Math.floor(b * boost));
    }
    
    // Add slight hue variation
    const hueShift = Math.sin(time + iterations * 0.01) * 10;
    r = Math.max(0, Math.min(255, r + hueShift));
    g = Math.max(0, Math.min(255, g + hueShift * 0.7));
    b = Math.max(0, Math.min(255, b + hueShift * 0.3));
    
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

function lyapunovFractal(c, maxIterations) {
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

function newtonFractal(z, c, maxIterations) {
    let n = 0;
    let zTemp = { re: z.re, im: z.im };
    
    while (n < maxIterations) {
        const zRe = zTemp.re;
        const zIm = zTemp.im;
        const zRe2 = zRe * zRe;
        const zIm2 = zIm * zIm;
        const zMag = zRe2 + zIm2;
        
        if (zMag < 0.000001) break;
        
        const newRe = (2 * zRe2 + zIm2) / (3 * zMag);
        const newIm = (2 * zIm * zRe) / (3 * zMag);
        
        zTemp.re = newRe;
        zTemp.im = newIm;
        
        if (Math.abs(zTemp.re - zRe) < 0.001 && Math.abs(zTemp.im - zIm) < 0.001) {
            break;
        }
        
        n++;
    }
    
    return n;
}

function cellularAutomata(x, y, maxIterations) {
    const gridSize = 12; // smaller pattern
    const rules = [
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 0, 1, 1, 0, 0, 1, 1],
        [1, 1, 0, 0, 1, 1, 0, 0]
    ];
    
    const ruleIndex = Math.floor(Math.abs(x + y) * 0.05) % rules.length;
    const rule = rules[ruleIndex];
    
    const pos = (Math.floor(x * 0.2) + Math.floor(y * 0.2)) % 8;
    return rule[pos] * maxIterations;
}

function spirographFractal(x, y, maxIterations) {
    const R = 3;
    const r = 1;
    const d = 2;
    
    const theta = Math.atan2(y, x);
    const x1 = (R - r) * Math.cos(theta) + d * Math.cos(((R - r) / r) * theta);
    const y1 = (R - r) * Math.sin(theta) - d * Math.sin(((R - r) / r) * theta);
    
    const distance = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
    return Math.floor((1 - Math.min(1, distance / 5)) * maxIterations);
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
                    case 'magneticPendulum':
                        iterations = magneticPendulum(z, c, maxIterations);
                        break;
                    case 'lyapunov':
                        iterations = lyapunovFractal(c, maxIterations);
                        break;
                    case 'newton':
                        iterations = newtonFractal(z, c, maxIterations);
                        break;
                    case 'cellular':
                        iterations = cellularAutomata(x, y, maxIterations);
                        break;
                    case 'spirograph':
                        iterations = spirographFractal(x, y, maxIterations);
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