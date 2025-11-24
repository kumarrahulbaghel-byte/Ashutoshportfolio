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
                // Resume context if suspended (browser policy)
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

    // --- Particle Network Background ---
    class ParticleNetwork {
        constructor() {
            this.canvas = document.getElementById('particles-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.resize();
            this.initParticles();
            this.animate();

            window.addEventListener('resize', () => {
                this.resize();
                this.initParticles();
            });

            this.mouse = { x: null, y: null };
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            });
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        initParticles() {
            this.particles = [];
            const numberOfParticles = (this.canvas.width * this.canvas.height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                this.particles.push(new Particle(this.canvas));
            }
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.particles.forEach(particle => {
                particle.update();
                particle.draw(this.ctx);
                this.connectParticles(particle);
            });
            this.connectMouse();
            requestAnimationFrame(this.animate.bind(this));
        }

        connectParticles(particle) {
            this.particles.forEach(p => {
                const dx = particle.x - p.x;
                const dy = particle.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 243, 255, ${1 - distance / 100})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(p.x, p.y);
                    this.ctx.stroke();
                }
            });
        }

        connectMouse() {
            if (this.mouse.x === null) return;
            this.particles.forEach(p => {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 243, 255, ${1 - distance / 150})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.moveTo(this.mouse.x, this.mouse.y);
                    this.ctx.lineTo(p.x, p.y);
                    this.ctx.stroke();
                }
            });
        }
    }

    class Particle {
        constructor(canvas) {
            this.canvas = canvas;
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > this.canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > this.canvas.height || this.y < 0) this.speedY = -this.speedY;
        }

        draw(ctx) {
            ctx.fillStyle = '#00f3ff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // --- Custom Cursor ---
    const cursor = document.querySelector('.cursor');
    const character = document.querySelector('.character-cursor');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        // Smooth delay for character
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

    // --- Initialize ---
    new SoundManager();
    new ParticleNetwork();

    // --- Existing Functionality (Smooth Scroll, Year, Form) ---
    document.getElementById('year').textContent = new Date().getFullYear();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! I will get back to you soon.');
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
