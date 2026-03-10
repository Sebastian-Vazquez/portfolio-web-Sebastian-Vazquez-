// === SMOKE / LIQUID NITROGEN BACKGROUND ===
const canvas = document.createElement('canvas');
canvas.id = 'particle-canvas';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initSmoke();
});

const SMOKE_COUNT = window.innerWidth < 768 ? 24 : 42;

class SmokeParticle {
    constructor(init = false) { this.spawn(init); }

    spawn(init = false) {
        // Spawn clustered at bottom; init spreads across full height
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + Math.random() * 60;

        // Large, soft puffs
        this.r       = Math.random() * 140 + 55;
        this.growRate = Math.random() * 0.20 + 0.06;

        // Slow upward drift with gentle horizontal sway
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = -(Math.random() * 0.50 + 0.12);

        // Organic wobble
        this.wFreq = Math.random() * 0.012 + 0.004;
        this.wAmp  = Math.random() * 1.4 + 0.5;
        this.wOff  = Math.random() * Math.PI * 2;

        // Life
        this.life    = 0;
        this.maxLife = Math.random() * 550 + 260;

        // Opacity — intentionally very low for subtlety
        this.maxAlpha = Math.random() * 0.055 + 0.018;

        // 85% cold blue-white, 15% warm orange ember
        this.cold = Math.random() > 0.15;
    }

    update() {
        this.life++;
        this.wOff += this.wFreq;
        this.x += this.vx + Math.sin(this.wOff) * this.wAmp;
        this.y += this.vy;
        this.r  += this.growRate;
        if (this.life > this.maxLife || this.y < -this.r * 2.5) this.spawn(false);
    }

    draw() {
        const progress = this.life / this.maxLife;
        const fadeIn   = Math.min(1, this.life / 70);
        const fadeOut  = progress > 0.55 ? Math.max(0, 1 - (progress - 0.55) / 0.45) : 1;
        const a = this.maxAlpha * fadeIn * fadeOut;
        if (a <= 0.001) return;

        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        if (this.cold) {
            g.addColorStop(0,    `rgba(215, 232, 255, ${a})`);
            g.addColorStop(0.38, `rgba(170, 205, 245, ${a * 0.52})`);
            g.addColorStop(0.72, `rgba(130, 168, 220, ${a * 0.18})`);
        } else {
            g.addColorStop(0,    `rgba(249, 115, 22,  ${a * 0.62})`);
            g.addColorStop(0.38, `rgba(220, 95,  30,  ${a * 0.28})`);
            g.addColorStop(0.72, `rgba(170, 70,  15,  ${a * 0.08})`);
        }
        g.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }
}

let smokeParticles = [];

function initSmoke() {
    smokeParticles = [];
    for (let i = 0; i < SMOKE_COUNT; i++) smokeParticles.push(new SmokeParticle(true));
}
initSmoke();

// Dense floor mist that pools at the bottom — the "liquid nitrogen" layer
function drawFloorMist() {
    // Wide soft band
    const bandH = H * 0.42;
    const g1 = ctx.createLinearGradient(0, H - bandH, 0, H);
    g1.addColorStop(0,    'rgba(0,0,0,0)');
    g1.addColorStop(0.50, 'rgba(155, 185, 235, 0.022)');
    g1.addColorStop(1,    'rgba(175, 208, 252, 0.058)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, H - bandH, W, bandH);

    // Tight bright strip right at the floor
    const stripH = H * 0.10;
    const g2 = ctx.createLinearGradient(0, H - stripH, 0, H);
    g2.addColorStop(0, 'rgba(0,0,0,0)');
    g2.addColorStop(1, 'rgba(190, 215, 255, 0.08)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, H - stripH, W, stripH);
}

// Deep ambient vignette — keeps content readable
function drawAmbient() {
    const g = ctx.createRadialGradient(W * 0.5, H * 0.65, 0, W * 0.5, H * 0.65, W * 0.7);
    g.addColorStop(0, 'rgba(12, 20, 45, 0.10)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
}

function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    drawAmbient();
    drawFloorMist();
    smokeParticles.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();


// === MENU ===
const menu = document.querySelector(".menu");
const openMenuBtn = document.querySelector(".open__menu");
const closeMenuBtn = document.querySelector(".close__menu");

function toggleMenu() {
    menu.classList.toggle("menu--opened");
}

openMenuBtn.addEventListener("click", toggleMenu);
closeMenuBtn.addEventListener("click", toggleMenu);

const nombreyapellido = document.querySelector(".nombre__apellido");

function opacidadTitulo() {
    nombreyapellido.classList.toggle("titulo--opaco");
}

openMenuBtn.addEventListener("click", opacidadTitulo);
closeMenuBtn.addEventListener("click", opacidadTitulo);


// === ACTIVE NAV LINK ===
const menuLinks = document.querySelectorAll('.menu a[href^="#"]');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            const menuLink = document.querySelector(`.menu a[href="#${id}"]`);
            document.querySelector(".menu a.selected")?.classList.remove("selected");
            if (menuLink) menuLink.classList.add("selected");
        }
    });
}, { rootMargin: "-40% 0px -60% 0px" });

menuLinks.forEach(menuLink => {
    menuLink.addEventListener("click", () => {
        menu.classList.remove("menu--opened");
        if (nombreyapellido.classList.contains("titulo--opaco")) opacidadTitulo();
    });
    const hash = menuLink.getAttribute("href");
    const target = document.querySelector(hash);
    if (target) navObserver.observe(target);
});


// === SCROLL REVEAL ===
const revealTargets = document.querySelectorAll(
    '.tl-item, .tarjetas__1, .tarjetas__2, .tarjetas__3, .perfil p, .contacto'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${(i % 4) * 0.07}s`;
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

revealTargets.forEach(el => revealObserver.observe(el));


// === NAVBAR GLOW ON SCROLL ===
window.addEventListener('scroll', () => {
    const header = document.querySelector('.topheader');
    if (window.scrollY > 80) {
        header.style.borderBottomColor = 'rgba(249, 115, 22, 0.25)';
        header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.7)';
    } else {
        header.style.borderBottomColor = 'rgba(255, 255, 255, 0.07)';
        header.style.boxShadow = 'none';
    }
}, { passive: true });


// === TYPEWRITER EFFECT ===
const carreraEl = document.querySelector('.carrera em') || document.querySelector('.carrera');
if (carreraEl) {
    const original = carreraEl.textContent;
    carreraEl.textContent = '';
    let i = 0;
    const type = () => {
        if (i < original.length) {
            carreraEl.textContent += original[i++];
            setTimeout(type, 55);
        }
    };
    setTimeout(type, 900);
}
