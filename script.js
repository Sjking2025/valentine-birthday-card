/* ============================================
   ROMANTIC VALENTINE + BIRTHDAY WEBSITE
   Interactive Features & Animations
   ============================================ */

/* --------------------------------------------------
   CONFIG — Edit these values to customize the site
   -------------------------------------------------- */
const CONFIG = {
    // 🔐 Change this to set your password
    password: 'iloveyou',

    // 🎶 Path to your music file (place in /assets folder)
    musicFile: 'assets/music.mp3',

    // 🔊 Music volume (0.0 to 1.0)
    musicVolume: 0.3,

    // 💬 Typing effect message for Valentine's section
    typingMessage: `My dearest love,

From the moment you came into my life, everything changed. The colors became brighter, the music became sweeter, and every ordinary moment turned into something extraordinary.

You are my first thought in the morning and my last dream at night. Your smile is my sunshine, your laughter is my favorite melody, and your love is the greatest gift I've ever received.

On this Valentine's Day, I want you to know — you are not just loved. You are adored, cherished, and treasured beyond what words could ever express.

Happy Valentine's Day, my forever love. 💕`,

    // ⏱ Typing speed in milliseconds
    typingSpeed: 35,

    // 🔑 Max wrong password attempts before showing hint
    maxAttempts: 3,

    // 💡 Hint message after max wrong attempts
    hintMessage: '💕 Hint: What do I always say to you?'
};

/* --------------------------------------------------
   STATE
   -------------------------------------------------- */
let wrongAttempts = 0;
let isTyping = false;
let typingTimeout = null;
let musicPlaying = false;

/* --------------------------------------------------
   DOM ELEMENTS
   -------------------------------------------------- */
const passwordScreen = document.getElementById('password-screen');
const passwordInput = document.getElementById('password-input');
const enterBtn = document.getElementById('enter-btn');
const hintMsg = document.getElementById('hint-msg');
const mainContent = document.getElementById('main-content');
const musicBtn = document.getElementById('music-btn');
const musicIcon = document.getElementById('music-icon');
const musicLabel = document.getElementById('music-label');
const bgMusic = document.getElementById('bg-music');
const typingText = document.getElementById('typing-text');
const confettiContainer = document.getElementById('confetti-container');
const sparkleCanvas = document.getElementById('sparkle-canvas');
const floatingHeartsContainer = document.getElementById('floating-hearts');

/* ==================================================
   1. PASSWORD PROTECTION
   ================================================== */

/**
 * Check if the entered password is correct
 */
function checkPassword() {
    const entered = passwordInput.value.trim();

    if (entered === CONFIG.password) {
        // Correct password — unlock the site
        unlockSite();
    } else {
        // Wrong password — shake and count
        wrongAttempts++;
        passwordInput.classList.add('shake');
        passwordInput.style.borderColor = '#ff1744';

        setTimeout(() => {
            passwordInput.classList.remove('shake');
            passwordInput.style.borderColor = '';
        }, 600);

        passwordInput.value = '';

        // Show hint after max attempts
        if (wrongAttempts >= CONFIG.maxAttempts) {
            hintMsg.textContent = CONFIG.hintMessage;
            hintMsg.classList.add('visible');
        }
    }
}

/**
 * Unlock the site with smooth transition
 */
function unlockSite() {
    passwordScreen.classList.add('hide');
    mainContent.classList.remove('hidden');

    // Show music button
    setTimeout(() => {
        musicBtn.classList.add('visible');
    }, 500);

    // Launch confetti burst
    setTimeout(() => {
        launchConfetti();
    }, 300);

    // Start floating hearts
    startFloatingHearts();

    // Initialize scroll animations
    initScrollObserver();

    // Start typing effect when valentine section appears
    initTypingTrigger();
}

// Enter key support
passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPassword();
});

// Button click
enterBtn.addEventListener('click', checkPassword);

// Auto-focus password input
passwordInput.focus();

/* ==================================================
   2. BACKGROUND MUSIC
   ================================================== */

/**
 * Toggle background music play/pause with fade-in
 */
function toggleMusic() {
    if (musicPlaying) {
        // Pause
        fadeOutAudio(bgMusic, 500);
        musicBtn.classList.remove('playing');
        musicLabel.textContent = 'Play';
        musicPlaying = false;
    } else {
        // Play with fade-in
        bgMusic.volume = 0;
        bgMusic.play().then(() => {
            fadeInAudio(bgMusic, CONFIG.musicVolume, 1000);
            musicBtn.classList.add('playing');
            musicLabel.textContent = 'Pause';
            musicPlaying = true;
        }).catch(() => {
            // Autoplay blocked — will try again on next click
            console.log('Music playback requires user interaction.');
        });
    }
}

/**
 * Fade in audio volume smoothly
 */
function fadeInAudio(audio, targetVolume, duration) {
    const step = targetVolume / (duration / 50);
    const interval = setInterval(() => {
        if (audio.volume + step >= targetVolume) {
            audio.volume = targetVolume;
            clearInterval(interval);
        } else {
            audio.volume += step;
        }
    }, 50);
}

/**
 * Fade out audio volume smoothly
 */
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
   3. CONFETTI BURST
   ================================================== */

/**
 * Launch a burst of confetti pieces
 */
function launchConfetti() {
    const colors = ['#ff4d6d', '#ffdde1', '#f4c025', '#ffe066', '#ff8fa3', '#fff', '#c9184a'];
    const shapes = ['circle', 'square', 'heart'];

    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const piece = document.createElement('div');
            piece.classList.add('confetti-piece');

            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const size = Math.random() * 8 + 6;

            piece.style.left = Math.random() * 100 + '%';
            piece.style.backgroundColor = color;
            piece.style.width = size + 'px';
            piece.style.height = size + 'px';
            piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
            piece.style.animationDelay = '0s';

            if (shape === 'circle') {
                piece.style.borderRadius = '50%';
            } else if (shape === 'heart') {
                piece.style.backgroundColor = 'transparent';
                piece.textContent = '❤';
                piece.style.fontSize = size + 'px';
                piece.style.color = color;
            }

            confettiContainer.appendChild(piece);

            // Remove after animation
            setTimeout(() => piece.remove(), 4000);
        }, i * 30);
    }
}

/* ==================================================
   4. FLOATING HEARTS
   ================================================== */

/**
 * Continuously generate floating heart elements
 */
function startFloatingHearts() {
    const hearts = ['❤️', '💕', '💗', '💖', '🤍', '💝'];

    setInterval(() => {
        const heart = document.createElement('span');
        heart.classList.add('floating-heart');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 18 + 10) + 'px';
        heart.style.animationDuration = (Math.random() * 6 + 6) + 's';

        floatingHeartsContainer.appendChild(heart);

        // Remove after animation completes
        setTimeout(() => heart.remove(), 12000);
    }, 1500);
}

/* Also add floating hearts on password screen */
function addPasswordScreenHearts() {
    const container = document.getElementById('password-hearts');
    const hearts = ['❤️', '💗', '💕'];

    setInterval(() => {
        if (passwordScreen.classList.contains('hide')) return;

        const heart = document.createElement('span');
        heart.classList.add('floating-heart');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 14 + 8) + 'px';
        heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
        heart.style.opacity = '0';

        container.appendChild(heart);
        setTimeout(() => heart.remove(), 10000);
    }, 2000);
}

addPasswordScreenHearts();

/* ==================================================
   5. SPARKLE PARTICLE BACKGROUND
   ================================================== */

/**
 * Canvas-based sparkle particle system
 */
function initSparkles() {
    const ctx = sparkleCanvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        sparkleCanvas.width = window.innerWidth;
        sparkleCanvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * sparkleCanvas.width;
            this.y = Math.random() * sparkleCanvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.opacityDir = Math.random() > 0.5 ? 1 : -1;
            this.color = Math.random() > 0.7
                ? 'rgba(244, 192, 37, '   // Gold
                : Math.random() > 0.5
                    ? 'rgba(255, 221, 225, '  // Pink
                    : 'rgba(255, 255, 255, '; // White
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity += this.opacityDir * 0.005;

            if (this.opacity >= 0.7) this.opacityDir = -1;
            if (this.opacity <= 0.05) this.opacityDir = 1;

            // Wrap around screen
            if (this.x < 0) this.x = sparkleCanvas.width;
            if (this.x > sparkleCanvas.width) this.x = 0;
            if (this.y < 0) this.y = sparkleCanvas.height;
            if (this.y > sparkleCanvas.height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();

            // Glow effect
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color + (this.opacity * 0.15) + ')';
            ctx.fill();
        }
    }

    // Create particles — fewer on mobile for performance
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 40 : 80;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animationId = requestAnimationFrame(animate);
    }

    animate();
}

initSparkles();

/* ==================================================
   6. SCROLL FADE-IN (IntersectionObserver)
   ================================================== */

function initScrollObserver() {
    const sections = document.querySelectorAll('.fade-in-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Trigger dramatic text fade in promise section
                const dramatic = entry.target.querySelector('.dramatic-text');
                if (dramatic) {
                    setTimeout(() => dramatic.classList.add('visible'), 2000);
                }
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(s => observer.observe(s));
}

/* ==================================================
   7. TYPING EFFECT
   ================================================== */

function initTypingTrigger() {
    const valentineSection = document.getElementById('valentine');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isTyping) {
                isTyping = true;
                startTypingEffect(CONFIG.typingMessage, typingText, CONFIG.typingSpeed);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(valentineSection);
}

/**
 * Character-by-character typing effect
 */
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
   8. 3D HOVER TILT EFFECT
   ================================================== */

function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// Initialize tilt cards after content is shown
const tiltObserver = new MutationObserver(() => {
    if (!mainContent.classList.contains('hidden')) {
        initTiltCards();
        tiltObserver.disconnect();
    }
});

tiltObserver.observe(mainContent, { attributes: true, attributeFilter: ['class'] });

/* ==================================================
   9. PARALLAX BACKGROUND
   ================================================== */

function initParallax() {
    const parallaxBg = document.querySelector('.parallax-bg');
    if (!parallaxBg) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        parallaxBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }, { passive: true });

    // Mouse-based subtle parallax
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        parallaxBg.style.transform = `translate(${x}px, ${y}px)`;
    });
}

initParallax();

/* ==================================================
   10. GLOWING BORDER ON CARDS (Bonus)
   ================================================== */

// Added via CSS box-shadow on .glass-card hover — no extra JS needed.

/* ==================================================
   INITIALIZATION COMPLETE
   ================================================== */
console.log('%c💖 Made with love — Happy Valentine\'s Day & Happy Birthday! 💖',
    'color: #ff4d6d; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px rgba(255,77,109,0.5);');
