// === LIQUID NITROGEN SMOKE BACKGROUND ===
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
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + Math.random() * 60;
        this.r       = Math.random() * 119 + 47;
        this.growRate = Math.random() * 0.20 + 0.06;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = -(Math.random() * 0.50 + 0.12);
        this.wFreq = Math.random() * 0.012 + 0.004;
        this.wAmp  = Math.random() * 1.4 + 0.5;
        this.wOff  = Math.random() * Math.PI * 2;
        this.life    = 0;
        this.maxLife = Math.random() * 550 + 260;
        this.maxAlpha = Math.random() * 0.18 + 0.08;
        this.cold = true;
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

function drawFloorMist() {
    const bandH = H * 0.42;
    const g1 = ctx.createLinearGradient(0, H - bandH, 0, H);
    g1.addColorStop(0,    'rgba(0,0,0,0)');
    g1.addColorStop(0.50, 'rgba(155, 185, 235, 0.06)');
    g1.addColorStop(1,    'rgba(175, 208, 252, 0.16)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, H - bandH, W, bandH);

    const stripH = H * 0.10;
    const g2 = ctx.createLinearGradient(0, H - stripH, 0, H);
    g2.addColorStop(0, 'rgba(0,0,0,0)');
    g2.addColorStop(1, 'rgba(190, 215, 255, 0.22)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, H - stripH, W, stripH);
}

function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    drawFloorMist();
    smokeParticles.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();


// === MENU ===
const menu = document.querySelector(".menu");
const openMenuBtn = document.querySelector(".open__menu");
const closeMenuBtn = document.querySelector(".close__menu");

function toggleMenu() { menu.classList.toggle("menu--opened"); }
openMenuBtn.addEventListener("click", toggleMenu);
closeMenuBtn.addEventListener("click", toggleMenu);

const nombreyapellido = document.querySelector(".nombre__apellido");
function opacidadTitulo() { nombreyapellido.classList.toggle("titulo--opaco"); }
openMenuBtn.addEventListener("click", opacidadTitulo);
closeMenuBtn.addEventListener("click", opacidadTitulo);


// === ACTIVE NAV LINK ===
const menuLinks = document.querySelectorAll('.menu a[href^="#"]');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            const link = document.querySelector(`.menu a[href="#${id}"]`);
            document.querySelector(".menu a.selected")?.classList.remove("selected");
            if (link) link.classList.add("selected");
        }
    });
}, { rootMargin: "-40% 0px -60% 0px" });

menuLinks.forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.remove("menu--opened");
        if (nombreyapellido.classList.contains("titulo--opaco")) opacidadTitulo();
    });
    const target = document.querySelector(link.getAttribute("href"));
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


// === VISITOR COUNTER ===
// To exclude your own visits, run this ONCE in your browser console:
//   localStorage.setItem('sv_owner', '1')
// To undo: localStorage.removeItem('sv_owner')
(function () {
    const el       = document.getElementById('visit-count');
    if (!el) return;

    const isOwner  = localStorage.getItem('sv_owner') === '1';
    const NS       = 'sebasv';
    const KEY      = 'portfolio-hits';
    // counterapi.dev — free, no account needed, resets to 0 on first call
    const base     = `https://api.counterapi.dev/v1/${NS}/${KEY}`;
    const url      = isOwner ? base : `${base}/up`;

    fetch(url)
        .then(r => r.json())
        .then(data => {
            const n = data.count ?? data.value ?? '—';
            el.textContent = typeof n === 'number' ? n.toLocaleString() : n;
        })
        .catch(() => { el.textContent = '—'; });
})();


// === TYPEWRITER EFFECT ===
const carreraEl = document.querySelector('.carrera em') || document.querySelector('.carrera');
if (carreraEl) {
    const original = carreraEl.textContent;
    carreraEl.textContent = '';
    let i = 0;
    const type = () => {
        if (i < original.length) { carreraEl.textContent += original[i++]; setTimeout(type, 55); }
    };
    setTimeout(type, 900);
}
