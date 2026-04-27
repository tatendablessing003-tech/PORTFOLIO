// Particle Network Background simulating electrical nerve impulses
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 100; // Number of "neurons"
let connectionDistance = 150;

// Dynamic resized canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5; // very slow drift
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5 + 0.5;
        // Nodes have a cyan base tint
        this.baseColor = 'rgba(0, 240, 255, 0.4)';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.baseColor;
        ctx.fill();
    }
}

// Spark class to simulate electrical nerve impulse traveling along connections
class Spark {
    constructor(startX, startY, endX, endY, distance) {
        this.x = startX;
        this.y = startY;
        this.endX = endX;
        this.endY = endY;
        this.progress = 0;
        this.speed = (Math.random() * 0.02) + 0.01; // Fast travel
        this.distance = distance;
        // Color can be cyan, purple, or green
        const colors = ['rgba(0, 240, 255, 1)', 'rgba(157, 0, 255, 1)', 'rgba(0, 255, 136, 1)'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.progress += this.speed;
        if (this.progress > 1) return true; // Dead
        
        this.x = this.x + (this.endX - this.x) * this.speed;
        this.y = this.y + (this.endY - this.y) * this.speed;
        return false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
    }
}

let sparks = [];

function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Clear the canvas with the deep dark color (slightly transparent for trails)
    ctx.fillStyle = 'rgba(2, 1, 8, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                // Line base
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                
                // Opacity based on distance
                const opacity = 1 - (distance / connectionDistance);
                ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.15})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Randomly generate a spark traveling along the path (nerve impulse)
                if (Math.random() < 0.0005) {
                    sparks.push(new Spark(particles[i].x, particles[i].y, particles[j].x, particles[j].y, distance));
                }
            }
        }
    }


    for (let i = sparks.length - 1; i >= 0; i--) {
        const dead = sparks[i].update();
        if (dead) {
            sparks.splice(i, 1);
        } else {
            sparks[i].draw();
        }
    }
}

init();
animate();

// Intersection Observer for scroll animations
const observersOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const fadeObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        }
    });
}, observersOptions);

const fadeElements = document.querySelectorAll('.fade-in');
fadeElements.forEach(el => fadeObserver.observe(el));

// Contact Form Prevention
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.querySelector('.submit-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Transmission Sent <i class="fas fa-check"></i>';
        btn.style.backgroundColor = 'var(--neon-green)';
        btn.style.color = '#000';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = '';
            btn.style.color = '';
            contactForm.reset();
        }, 3000);
    });
}
