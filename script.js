document.addEventListener('DOMContentLoaded', () => {
    // --- Sound Manager (Web Audio API) ---
    class SoundManager {
        constructor() {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.isMuted = false;
            this.toggleBtn = document.getElementById('sound-toggle');
            this.initListeners();
        }

        initListeners() {
            this.toggleBtn.addEventListener('click', () => {
                this.isMuted = !this.isMuted;
                const icon = this.toggleBtn.querySelector('i');
                if (this.isMuted) {
                    icon.classList.remove('fa-volume-up');
                    icon.classList.add('fa-volume-mute');
                } else {
                    icon.classList.remove('fa-volume-mute');
                    icon.classList.add('fa-volume-up');
                }
                if (this.context.state === 'suspended') {
                    this.context.resume();
                }
            });

            document.querySelectorAll('[data-hover]').forEach(el => {
                el.addEventListener('mouseenter', () => this.playHoverSound());
                el.addEventListener('click', () => this.playClickSound());
            });
        }

        playHoverSound() {
            if (this.isMuted) return;
            if (this.context.state === 'suspended') this.context.resume();

            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, this.context.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.1);

            gain.gain.setValueAtTime(0.05, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.context.destination);

            osc.start();
            osc.stop(this.context.currentTime + 0.1);
        }

        playClickSound() {
            if (this.isMuted) return;
            if (this.context.state === 'suspended') this.context.resume();

            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, this.context.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.15);

            gain.gain.setValueAtTime(0.1, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(this.context.destination);

            osc.start();
            osc.stop(this.context.currentTime + 0.15);
        }
    }

    // --- Premium Cursor-Reactive Background ---
    class CursorBackground {
        constructor() {
            this.canvas = document.getElementById('particles-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            this.smoothMouse = { x: this.mouse.x, y: this.mouse.y };
            this.dots = [];
            this.resize();
            this.initDots();
            this.animate();

            window.addEventListener('resize', () => {
                this.resize();
                this.initDots();
            });

            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        initDots() {
            this.dots = [];
            const count = Math.floor((this.canvas.width * this.canvas.height) / 25000);
            for (let i = 0; i < count; i++) {
                this.dots.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    baseSize: Math.random() * 1.5 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.3 + 0.1
                });
            }
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Smooth mouse follow
            this.smoothMouse.x += (this.mouse.x - this.smoothMouse.x) * 0.08;
            this.smoothMouse.y += (this.mouse.y - this.smoothMouse.y) * 0.08;

            // Draw cursor glow
            const gradient = this.ctx.createRadialGradient(
                this.smoothMouse.x, this.smoothMouse.y, 0,
                this.smoothMouse.x, this.smoothMouse.y, 350
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
            gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.015)');
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw dots
            this.dots.forEach(dot => {
                dot.x += dot.speedX;
                dot.y += dot.speedY;

                if (dot.x > this.canvas.width) dot.x = 0;
                if (dot.x < 0) dot.x = this.canvas.width;
                if (dot.y > this.canvas.height) dot.y = 0;
                if (dot.y < 0) dot.y = this.canvas.height;

                // React to cursor proximity
                const dx = this.smoothMouse.x - dot.x;
                const dy = this.smoothMouse.y - dot.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 200;

                let size = dot.baseSize;
                let alpha = dot.opacity;

                if (dist < maxDist) {
                    const factor = 1 - dist / maxDist;
                    size += factor * 2;
                    alpha += factor * 0.4;
                }

                this.ctx.beginPath();
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
                this.ctx.fill();
            });

            requestAnimationFrame(this.animate.bind(this));
        }
    }

    // --- Custom Cursor ---
    const cursor = document.querySelector('.cursor');
    const character = document.querySelector('.character-cursor');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        setTimeout(() => {
            if (character) {
                character.style.left = e.clientX + 'px';
                character.style.top = e.clientY + 'px';
            }
        }, 80);
    });

    document.querySelectorAll('[data-hover]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            if (character) character.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            if (character) character.classList.remove('active');
        });
    });

    // --- Glitch Effect Trigger ---
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.classList.add('glitch');
        heroTitle.setAttribute('data-text', heroTitle.textContent);
    }

    // --- Hamburger Menu Toggle ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a nav link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = hamburger.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // --- Initialize ---
    new SoundManager();
    new CursorBackground();

    // --- Typing Effect ---
    class TypeWriter {
        constructor(element, phrases, typingSpeed = 80, deletingSpeed = 40, pauseTime = 2000) {
            this.element = element;
            this.phrases = phrases;
            this.typingSpeed = typingSpeed;
            this.deletingSpeed = deletingSpeed;
            this.pauseTime = pauseTime;
            this.phraseIndex = 0;
            this.charIndex = 0;
            this.isDeleting = false;
            this.type();
        }

        type() {
            const currentPhrase = this.phrases[this.phraseIndex];

            if (this.isDeleting) {
                this.charIndex--;
                this.element.textContent = currentPhrase.substring(0, this.charIndex);
            } else {
                this.charIndex++;
                this.element.textContent = currentPhrase.substring(0, this.charIndex);
            }

            let speed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

            if (!this.isDeleting && this.charIndex === currentPhrase.length) {
                speed = this.pauseTime;
                this.isDeleting = true;
            } else if (this.isDeleting && this.charIndex === 0) {
                this.isDeleting = false;
                this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
                speed = 400;
            }

            setTimeout(() => this.type(), speed);
        }
    }

    const typedElement = document.getElementById('typed-text');
    if (typedElement) {
        new TypeWriter(typedElement, [
            'MECM Administrator @ HCL Technologies',
            'Aspiring AI Engineer & Developer',
            'Data Science Student @ IIT Guwahati',
            'Applying for Software Development Roles',
        ], 70, 35, 2000);
    }

    // --- Year, Smooth Scroll, Form ---
    document.getElementById('year').textContent = new Date().getFullYear();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Contact form with animated success message
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Show success message
            if (formSuccess) {
                formSuccess.classList.add('show');

                // Hide after 4 seconds
                setTimeout(() => {
                    formSuccess.classList.remove('show');
                }, 4000);
            }

            contactForm.reset();
        });
    }

    // Scroll Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
});
