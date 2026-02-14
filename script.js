/* ============================================
   ROMANTIC CINEMATIC WEBSITE
   Features: SHA-256 Encryption, Cinematic Intro,
   Starry Night Canvas, Proposal Mode, QR Code
   ============================================ */

/* ==================================================
   CONFIG — All customizable values
   ================================================== */
const CONFIG = {
    /*
     * 🔐 SHA-256 PASSWORD HASH
     *
     * The password is NEVER stored in plain text.
     * Only its SHA-256 hash is stored below.
     *
     * Current password: "Aumey"
     *
     * HOW TO CHANGE THE PASSWORD:
     * 1. Open browser console (F12 → Console)
     * 2. Run: hashPassword('yournewpassword').then(h => console.log(h))
     * 3. Copy the hash output
     * 4. Replace the value below with the new hash
     */
    passwordHash: '7aab8a245f583c7f619a724ebc10b8279fd6da04703b2e514fdc75914acc263b',

    // 🎶 Music settings
    musicFile: 'assets/music.mp3',
    musicVolume: 0.3,

    // 💬 Valentine's typing message
    typingMessage: `My dearest love,

From the moment you came into my life, everything changed. The colors became brighter, the music became sweeter, and every ordinary moment turned into something extraordinary.

You are my first thought in the morning and my last dream at night. Your smile is my sunshine, your laughter is my favorite melody, and your love is the greatest gift I've ever received.

On this Valentine's Day, I want you to know — you are not just loved. You are adored, cherished, and treasured beyond what words could ever express.

Happy Valentine's Day, my forever love. 💕`,

    typingSpeed: 35,

    // 🔑 Password hints
    maxAttempts: 3,
    hintMessage: '💕 Hint: My special name for you?',

    // 💍 Proposal response messages
    proposalYes: 'You just made me the happiest person alive. I love you, forever and always. 💖',
    proposalAlways: 'Always and forever — that\'s our promise. My heart is yours, eternally. 💞',

    // 🌐 QR Code URL (change this to your deployed site URL)
    siteUrl: 'https://yourusername.github.io/romantic-site/',

    // 🎬 Cinematic intro duration (ms)
    introDuration: 5000,
};

/* ==================================================
   SHA-256 HASHING (Web Crypto API)
   ================================================== */

/**
 * Hash a string with SHA-256.
 * Usage (in console): hashPassword('mypassword').then(h => console.log(h))
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against stored hash.
 */
async function verifyPassword(input, storedHash) {
    const inputHash = await hashPassword(input);
    return inputHash === storedHash;
}

/* ==================================================
   STATE
   ================================================== */
let wrongAttempts = 0;
let isTyping = false;
let typingTimeout = null;
let musicPlaying = false;
let proposalAnswered = false;

/* ==================================================
   DOM HELPERS
   ================================================== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const cinematicIntro = $('#cinematic-intro');
const passwordScreen = $('#password-screen');
const passwordInput = $('#password-input');
const enterBtn = $('#enter-btn');
const hintMsg = $('#hint-msg');
const mainContent = $('#main-content');
const musicBtn = $('#music-btn');
const musicIcon = $('#music-icon');
const musicLabel = $('#music-label');
const bgMusic = $('#bg-music');
const typingText = $('#typing-text');
const confettiContainer = $('#confetti-container');
const starryCanvas = $('#starry-canvas');
const floatingHeartsContainer = $('#floating-hearts');

/* ==================================================
   1. CINEMATIC INTRO SEQUENCE
   ================================================== */

function startCinematicIntro() {
    const lines = $$('.intro-line');
    const loader = $('.intro-loader');
    const fill = $('#loader-fill');

    // Stagger reveal lines
    lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('show'), 800 + i * 1000);
    });

    // Show loader after lines
    setTimeout(() => {
        loader.classList.add('show');
        animateLoader(fill);
    }, 800 + lines.length * 1000);
}

function animateLoader(fill) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            // Fade out intro, show password
            setTimeout(() => {
                cinematicIntro.classList.add('fade-out');
                passwordScreen.classList.add('show');
                passwordInput.focus();
            }, 600);
        }
        fill.style.width = progress + '%';
    }, 250);
}

// Start intro on page load
startCinematicIntro();

/* ==================================================
   2. ENCRYPTED PASSWORD SYSTEM
   ================================================== */

async function checkPassword() {
    const entered = passwordInput.value.trim();
    if (!entered) return;

    const isValid = await verifyPassword(entered, CONFIG.passwordHash);

    if (isValid) {
        unlockSite();
    } else {
        wrongAttempts++;
        passwordInput.classList.add('shake');
        passwordInput.style.borderColor = 'rgba(232, 67, 147, 0.6)';

        setTimeout(() => {
            passwordInput.classList.remove('shake');
            passwordInput.style.borderColor = '';
        }, 600);

        passwordInput.value = '';

        if (wrongAttempts >= CONFIG.maxAttempts) {
            hintMsg.textContent = CONFIG.hintMessage;
            hintMsg.classList.add('visible');
        }
    }
}

function unlockSite() {
    passwordScreen.classList.add('hide');
    mainContent.classList.remove('hidden');

    setTimeout(() => musicBtn.classList.add('visible'), 600);
    setTimeout(() => launchConfetti(), 400);

    startFloatingHearts();
    initScrollObserver();
    initTypingTrigger();
}

passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPassword();
});

enterBtn.addEventListener('click', checkPassword);

/* ==================================================
   3. STARRY NIGHT CANVAS BACKGROUND
   ================================================== */

function initStarryNight() {
    const ctx = starryCanvas.getContext('2d');
    let stars = [];
    let shootingStars = [];
    let mouseX = 0, mouseY = 0;

    function resize() {
        starryCanvas.width = window.innerWidth;
        starryCanvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    // Track mouse for parallax
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Star class
    class Star {
        constructor() { this.reset(); }

        reset() {
            this.x = Math.random() * starryCanvas.width;
            this.y = Math.random() * starryCanvas.height;
            this.baseX = this.x;
            this.baseY = this.y;
            this.size = Math.random() * 1.8 + 0.2;
            this.twinkleSpeed = Math.random() * 0.02 + 0.005;
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.opacity = Math.random() * 0.6 + 0.1;
            this.parallaxFactor = Math.random() * 0.5 + 0.1;

            // Color variety: white, gold, pale blue, pink
            const r = Math.random();
            if (r > 0.7) this.color = [212, 168, 67];       // gold
            else if (r > 0.5) this.color = [180, 200, 255];  // pale blue
            else if (r > 0.35) this.color = [255, 200, 220]; // soft pink
            else this.color = [255, 255, 255];                // white
        }

        update(time) {
            // Twinkling
            this.currentOpacity = this.opacity + Math.sin(time * this.twinkleSpeed + this.twinklePhase) * 0.3;
            this.currentOpacity = Math.max(0.02, Math.min(0.9, this.currentOpacity));

            // Parallax drift
            this.x = this.baseX + mouseX * this.parallaxFactor * 10;
            this.y = this.baseY + mouseY * this.parallaxFactor * 10;
        }

        draw() {
            const [r, g, b] = this.color;

            // Core star
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.currentOpacity})`;
            ctx.fill();

            // Soft glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.currentOpacity * 0.08})`;
            ctx.fill();
        }
    }

    // Shooting Star class
    class ShootingStar {
        constructor() { this.reset(); }

        reset() {
            this.x = Math.random() * starryCanvas.width * 0.8;
            this.y = Math.random() * starryCanvas.height * 0.4;
            this.length = Math.random() * 80 + 40;
            this.speed = Math.random() * 6 + 4;
            this.angle = (Math.random() * 30 + 15) * Math.PI / 180;
            this.opacity = 0;
            this.phase = 'fadein'; // fadein, travel, fadeout
            this.progress = 0;
        }

        update() {
            const dx = Math.cos(this.angle) * this.speed;
            const dy = Math.sin(this.angle) * this.speed;

            this.x += dx;
            this.y += dy;
            this.progress += this.speed;

            if (this.phase === 'fadein') {
                this.opacity = Math.min(1, this.opacity + 0.05);
                if (this.opacity >= 1) this.phase = 'travel';
            }

            if (this.progress > 200) {
                this.phase = 'fadeout';
                this.opacity -= 0.04;
            }

            if (this.opacity <= 0) {
                this.active = false;
            }
        }

        draw() {
            if (this.opacity <= 0) return;

            const tailX = this.x - Math.cos(this.angle) * this.length;
            const tailY = this.y - Math.sin(this.angle) * this.length;

            const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
            grad.addColorStop(1, `rgba(255, 255, 255, 0)`);

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Head glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`;
            ctx.fill();
        }
    }

    // Create stars
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 80 : 180;
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }

    // Occasionally spawn shooting stars
    setInterval(() => {
        if (shootingStars.filter(s => s.active).length < 2) {
            const s = new ShootingStar();
            s.active = true;
            shootingStars.push(s);
        }
    }, 4000 + Math.random() * 3000);

    // Night sky gradient
    function drawNightSky() {
        const grad = ctx.createLinearGradient(0, 0, 0, starryCanvas.height);
        grad.addColorStop(0, '#050d1a');
        grad.addColorStop(0.4, '#0a1628');
        grad.addColorStop(0.7, '#0f1f38');
        grad.addColorStop(1, '#0a1225');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, starryCanvas.width, starryCanvas.height);
    }

    let time = 0;
    function animate() {
        time++;
        drawNightSky();

        stars.forEach(s => { s.update(time); s.draw(); });

        shootingStars = shootingStars.filter(s => s.active);
        shootingStars.forEach(s => { s.update(); s.draw(); });

        requestAnimationFrame(animate);
    }

    animate();
}

initStarryNight();

/* ==================================================
   4. BACKGROUND MUSIC
   ================================================== */

function toggleMusic() {
    if (musicPlaying) {
        fadeOutAudio(bgMusic, 500);
        musicBtn.classList.remove('playing');
        musicLabel.textContent = 'Play';
        musicPlaying = false;
    } else {
        bgMusic.volume = 0;
        bgMusic.play().then(() => {
            fadeInAudio(bgMusic, CONFIG.musicVolume, 1000);
            musicBtn.classList.add('playing');
            musicLabel.textContent = 'Pause';
            musicPlaying = true;
        }).catch(() => {
            console.log('Music playback requires user interaction.');
        });
    }
}

function fadeInAudio(audio, target, duration) {
    const step = target / (duration / 50);
    const interval = setInterval(() => {
        if (audio.volume + step >= target) {
            audio.volume = target;
            clearInterval(interval);
        } else {
            audio.volume += step;
        }
    }, 50);
}

function fadeOutAudio(audio, duration) {
    const step = audio.volume / (duration / 50);
    const interval = setInterval(() => {
        if (audio.volume - step <= 0) {
            audio.volume = 0;
            audio.pause();
            clearInterval(interval);
        } else {
            audio.volume -= step;
        }
    }, 50);
}

musicBtn.addEventListener('click', toggleMusic);

/* ==================================================
   5. CONFETTI
   ================================================== */

function launchConfetti() {
    const colors = ['#e84393', '#fd79a8', '#d4a843', '#f0d27a', '#a01641', '#f5f0e8'];

    for (let i = 0; i < 80; i++) {
        setTimeout(() => {
            const piece = document.createElement('div');
            piece.classList.add('confetti-piece');

            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 8 + 5;

            piece.style.left = Math.random() * 100 + '%';
            piece.style.width = size + 'px';
            piece.style.height = size * (Math.random() + 0.5) + 'px';
            piece.style.backgroundColor = color;
            piece.style.animationDuration = (Math.random() * 2.5 + 2) + 's';

            if (Math.random() > 0.6) {
                piece.style.borderRadius = '50%';
            }

            confettiContainer.appendChild(piece);
            setTimeout(() => piece.remove(), 5000);
        }, i * 25);
    }
}

/* ==================================================
   6. FLOATING HEARTS
   ================================================== */

function startFloatingHearts() {
    const hearts = ['❤', '♥', '❤', '♡', '❤'];

    setInterval(() => {
        const heart = document.createElement('span');
        heart.classList.add('floating-heart');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 14 + 8) + 'px';
        heart.style.animationDuration = (Math.random() * 8 + 8) + 's';

        floatingHeartsContainer.appendChild(heart);
        setTimeout(() => heart.remove(), 16000);
    }, 2000);
}

function addPasswordScreenHearts() {
    const container = document.getElementById('password-hearts');
    const hearts = ['❤', '♥'];

    setInterval(() => {
        if (passwordScreen.classList.contains('hide')) return;

        const heart = document.createElement('span');
        heart.classList.add('floating-heart');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 10 + 6) + 'px';
        heart.style.animationDuration = (Math.random() * 6 + 6) + 's';
        heart.style.opacity = '0';

        container.appendChild(heart);
        setTimeout(() => heart.remove(), 12000);
    }, 2500);
}

addPasswordScreenHearts();

/* ==================================================
   7. SCROLL REVEAL
   ================================================== */

function initScrollObserver() {
    const sections = $$('.fade-in-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                const dramatic = entry.target.querySelector('.dramatic-text');
                if (dramatic) {
                    setTimeout(() => dramatic.classList.add('visible'), 2500);
                }
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    sections.forEach(s => observer.observe(s));
}

/* ==================================================
   8. TYPING EFFECT
   ================================================== */

function initTypingTrigger() {
    const valentine = $('#valentine');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isTyping) {
                isTyping = true;
                startTypingEffect(CONFIG.typingMessage, typingText, CONFIG.typingSpeed);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25 });

    observer.observe(valentine);
}

function startTypingEffect(text, element, speed) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            if (text[i] === '\n') {
                element.innerHTML += '<br>';
            } else {
                element.innerHTML += text[i];
            }
            i++;
            typingTimeout = setTimeout(type, speed);
        }
    }

    type();
}

/* ==================================================
   9. 3D TILT CARDS
   ================================================== */

function initTiltCards() {
    const cards = $$('.tilt-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;

            const rotateX = ((y - cy) / cy) * -5;
            const rotateY = ((x - cx) / cx) * 5;

            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

const tiltObserver = new MutationObserver(() => {
    if (!mainContent.classList.contains('hidden')) {
        initTiltCards();
        tiltObserver.disconnect();
    }
});

tiltObserver.observe(mainContent, { attributes: true, attributeFilter: ['class'] });

/* ==================================================
   10. PARALLAX
   ================================================== */

function initParallax() {
    const parallaxBg = document.querySelector('.parallax-bg');
    if (!parallaxBg) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        parallaxBg.style.transform = `translateY(${scrolled * 0.2}px)`;
    }, { passive: true });
}

initParallax();

/* ==================================================
   11. BIRTHDAY COUNTDOWN + CELEBRATION 🎂
   ================================================== */

function initBirthdayCountdown() {
    const countdownEl = document.getElementById('birthday-countdown');
    const actualEl = document.getElementById('birthday-actual');
    const poemAdvance = document.getElementById('poem-advance');
    const poemActual = document.getElementById('poem-actual');
    const celebrationOverlay = document.getElementById('celebration-overlay');
    const birthdaySection = document.getElementById('birthday');

    const cdHours = document.getElementById('cd-hours');
    const cdMinutes = document.getElementById('cd-minutes');
    const cdSeconds = document.getElementById('cd-seconds');

    if (!countdownEl || !cdHours) return;

    // Target: Feb 15 midnight IST (UTC+5:30 → Feb 14 18:30 UTC)
    const now = new Date();
    const year = now.getFullYear();
    // Build target date in IST: Feb 15, 00:00:00 IST
    const targetIST = new Date(Date.UTC(year, 1, 14, 18, 30, 0)); // Feb = month index 1

    // If already past Feb 15 midnight IST this year, birthday is NOW
    if (now >= targetIST) {
        activateCelebration();
        return;
    }

    function updateCountdown() {
        const nowMs = Date.now();
        const diff = targetIST.getTime() - nowMs;

        if (diff <= 0) {
            clearInterval(timerInterval);
            activateCelebration();
            return;
        }

        const totalSec = Math.floor(diff / 1000);
        const hours = Math.floor(totalSec / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;

        const hStr = String(hours).padStart(2, '0');
        const mStr = String(minutes).padStart(2, '0');
        const sStr = String(seconds).padStart(2, '0');

        // Flip animation on change
        if (cdHours.textContent !== hStr) {
            cdHours.textContent = hStr;
            cdHours.classList.add('flip');
            setTimeout(() => cdHours.classList.remove('flip'), 300);
        }
        if (cdMinutes.textContent !== mStr) {
            cdMinutes.textContent = mStr;
            cdMinutes.classList.add('flip');
            setTimeout(() => cdMinutes.classList.remove('flip'), 300);
        }
        if (cdSeconds.textContent !== sStr) {
            cdSeconds.textContent = sStr;
            cdSeconds.classList.add('flip');
            setTimeout(() => cdSeconds.classList.remove('flip'), 300);
        }
    }

    updateCountdown();
    const timerInterval = setInterval(updateCountdown, 1000);

    function activateCelebration() {
        // Hide countdown, show actual wishes
        countdownEl.style.display = 'none';
        actualEl.classList.add('active');

        // Swap poems
        if (poemAdvance) poemAdvance.style.display = 'none';
        if (poemActual) poemActual.style.display = 'block';

        // Enable celebration overlay
        if (celebrationOverlay) celebrationOverlay.classList.add('active');

        // Cake glow
        const cake = birthdaySection?.querySelector('.birthday-cake');
        if (cake) cake.classList.add('cake-glow-active');

        // Launch celebration effects
        launchBalloons();
        launchCrackers();
        launchConfetti();
    }
}

/* ----- Balloon Generator ----- */
function launchBalloons() {
    const container = document.getElementById('balloons-container');
    if (!container) return;

    const colors = [
        'rgba(232, 67, 147, 0.7)',   // deep pink
        'rgba(212, 168, 67, 0.7)',    // gold
        'rgba(255, 182, 193, 0.7)',   // blush
        'rgba(200, 140, 60, 0.6)',    // warm amber
        'rgba(180, 60, 120, 0.6)',    // rose
    ];

    function spawnWave() {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const balloon = document.createElement('div');
                balloon.classList.add('balloon');
                balloon.style.left = `${10 + Math.random() * 80}%`;
                balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
                balloon.style.animationDuration = `${6 + Math.random() * 4}s`;
                balloon.style.width = `${24 + Math.random() * 16}px`;
                balloon.style.height = `${32 + Math.random() * 20}px`;
                container.appendChild(balloon);
                balloon.addEventListener('animationend', () => balloon.remove());
            }, i * 400);
        }
    }

    spawnWave();
    setTimeout(spawnWave, 3000);
    setTimeout(spawnWave, 7000);
    // Continuous gentle flow
    setInterval(() => {
        const balloon = document.createElement('div');
        balloon.classList.add('balloon');
        balloon.style.left = `${10 + Math.random() * 80}%`;
        balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.animationDuration = `${8 + Math.random() * 4}s`;
        container.appendChild(balloon);
        balloon.addEventListener('animationend', () => balloon.remove());
    }, 3000);
}

/* ----- Cracker Particle Bursts ----- */
function launchCrackers() {
    const container = document.getElementById('crackers-container');
    if (!container) return;

    const colors = ['#d4a843', '#e84393', '#f5c6d0', '#fff', '#c9944a'];

    function burst(x, y) {
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.classList.add('cracker-burst');
            const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.5;
            const dist = 40 + Math.random() * 60;
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
            p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
            container.appendChild(p);
            p.addEventListener('animationend', () => p.remove());
        }
    }

    // Random bursts
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const rect = container.getBoundingClientRect();
            burst(
                Math.random() * rect.width,
                Math.random() * rect.height * 0.6
            );
        }, i * 800);
    }
}

initBirthdayCountdown();

/* ==================================================
   12. MEMORY TIMELINE — RELIVE MODE 📸
   ================================================== */

const reliveBtn = document.getElementById('relive-btn');
if (reliveBtn) {
    reliveBtn.addEventListener('click', () => {
        const cards = document.querySelectorAll('.timeline-item');
        if (!cards.length) return;

        const narrations = [
            'A stolen glance at the market — this is where the butterflies began ✨',
            'Hiding your smile in the hallway — school days and secret glances 📚',
            'Walking and texting, waiting for your reply — the start of something beautiful 📱',
            'That smile by the window… cherry blossoms had nothing on you 🌸',
            'Sitting close, hearts racing — realizing this was forever 💑',
            'The first chapter we wrote together — hearts glowing between us 💛',
            'A shy smile on a train journey — I saw it anyway 🚂💫',
            'Flowers in your hair, wind in the air — simply breathtaking 🌺',
            'Under the blossoms, side by side — no words could say more 🌷',
            'Golden hour by the sea — I watched you, my heart overflowing 🌅',
            'Where sky meets sea, barefoot and together — forever begins here 💖',
        ];

        let i = 0;
        reliveBtn.style.pointerEvents = 'none';
        reliveBtn.style.opacity = '0.5';

        function showNext() {
            if (i >= cards.length) {
                // Remove narration
                const existing = document.querySelector('.relive-narration');
                if (existing) existing.remove();
                reliveBtn.style.pointerEvents = '';
                reliveBtn.style.opacity = '';
                return;
            }

            const card = cards[i];
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Show narration overlay
            let overlay = document.querySelector('.relive-narration');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.classList.add('relive-narration');
                document.body.appendChild(overlay);
            }
            overlay.innerHTML = `<p>${narrations[i] || '...'}</p>`;

            i++;
            setTimeout(showNext, 3500);
        }

        showNext();
    });
}

/* ==================================================
   13. PROPOSAL MODE 💍
   ================================================== */

const proposalTrigger = $('#proposal-trigger');
const proposalReveal = $('#proposal-reveal');
const btnYes = $('#btn-yes');
const btnAlways = $('#btn-always');
const proposalResponse = $('#proposal-response');

proposalTrigger.addEventListener('click', () => {
    proposalTrigger.style.display = 'none';
    proposalReveal.classList.remove('hidden');

    // Force reflow then add show
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            proposalReveal.classList.add('show');
        });
    });
});

function handleProposalAnswer(message) {
    if (proposalAnswered) return;
    proposalAnswered = true;

    // Glow effect
    const glow = document.createElement('div');
    glow.classList.add('proposal-glow');
    document.body.appendChild(glow);
    setTimeout(() => glow.remove(), 3500);

    // Confetti
    launchConfetti();

    // Response text
    proposalResponse.textContent = message;
    proposalResponse.classList.add('show');

    // Disable buttons
    btnYes.style.opacity = '0.5';
    btnYes.style.pointerEvents = 'none';
    btnAlways.style.opacity = '0.5';
    btnAlways.style.pointerEvents = 'none';
}

btnYes.addEventListener('click', () => handleProposalAnswer(CONFIG.proposalYes));
btnAlways.addEventListener('click', () => handleProposalAnswer(CONFIG.proposalAlways));

/* ==================================================
   12. QR CODE GENERATOR (Canvas-based)
   ================================================== */

function generateQRCode(text, canvas, size = 200) {
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    /*
     * Simple QR-like visual pattern.
     * For a real QR code, include a library like:
     * <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
     * Then use: QRCode.toCanvas(canvas, text, { width: size, margin: 2 })
     *
     * Below is a decorative grid that looks like a QR code.
     * Replace with the real library for scannable QR codes.
     */

    const moduleSize = 8;
    const modules = Math.floor(size / moduleSize);
    const padding = (size - modules * moduleSize) / 2;

    // Background
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, size, size);

    // Generate deterministic pattern from URL
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
        seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0;
    }

    function seededRandom() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    }

    // Draw modules
    ctx.fillStyle = '#0a1628';

    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            // Finder patterns (top-left, top-right, bottom-left corners)
            const isFinderArea =
                (row < 7 && col < 7) ||
                (row < 7 && col >= modules - 7) ||
                (row >= modules - 7 && col < 7);

            if (isFinderArea) {
                // Draw finder pattern
                const fr = row < 7 ? row : row - (modules - 7);
                const fc = col < 7 ? col : col - (modules - 7);

                if (fr === 0 || fr === 6 || fc === 0 || fc === 6 ||
                    (fr >= 2 && fr <= 4 && fc >= 2 && fc <= 4)) {
                    ctx.fillRect(
                        padding + col * moduleSize,
                        padding + row * moduleSize,
                        moduleSize, moduleSize
                    );
                }
            } else if (seededRandom() > 0.5) {
                ctx.fillRect(
                    padding + col * moduleSize,
                    padding + row * moduleSize,
                    moduleSize, moduleSize
                );
            }
        }
    }

    // Add heart in center
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e84393';
    ctx.fillText('❤', size / 2, size / 2);
}

const qrCanvas = $('#qr-canvas');
if (qrCanvas) {
    generateQRCode(CONFIG.siteUrl, qrCanvas, 200);
}

// Download QR
const downloadQR = $('#download-qr');
if (downloadQR) {
    downloadQR.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'our-secret-world-qr.png';
        link.href = qrCanvas.toDataURL('image/png');
        link.click();
    });
}

/* ==================================================
   READY
   ================================================== */
console.log(
    '%c❤ Made with love — Happy Valentine\'s Day & Happy Birthday ❤',
    'color: #d4a843; font-size: 14px; font-weight: 300; font-family: serif;'
);

// Expose hash helper for password changes
window.hashPassword = hashPassword;
