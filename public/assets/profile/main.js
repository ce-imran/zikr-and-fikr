// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // --- HEADER SCROLL EFFECT ---
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const headerNav = document.querySelector('.header-nav');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            headerNav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // --- HERO ANIMATION ---
    const heroTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
            pin: true,
            pinSpacing: false
        }
    });

    if (document.querySelector("#ahmad-bg-img")) {
        heroTl.to("#ahmad-bg-img", {
            scale: 1.2,
            y: -100,
            opacity: 0.3,
            ease: "none"
        });
    }

    if (document.querySelector("#hero-title")) {
        heroTl.to("#hero-title", {
            y: -150,
            opacity: 0,
            ease: "none"
        }, 0);
    }

    if (document.querySelector(".hero-overlay")) {
        heroTl.to(".hero-overlay", {
            backgroundColor: "rgba(5, 26, 18, 0.95)",
            ease: "none"
        }, 0);
    }

    // --- ABOUT SECTION ANIMATIONS ---
    if (document.querySelector("#about-image")) {
        gsap.from("#about-image", {
            scrollTrigger: {
                trigger: "#about",
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            x: -100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
    }

    if (document.querySelector("#about-content")) {
        gsap.from("#about-content", {
            scrollTrigger: {
                trigger: "#about",
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            x: 100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
    }

    // --- ARTICLE ANIMATIONS ---
    if (document.querySelector("#main-article")) {
        gsap.from("#main-article", {
            scrollTrigger: {
                trigger: "#articles",
                start: "top 70%",
                toggleActions: "play none none reverse"
            },
            y: 100,
            opacity: 0,
            duration: 1.5,
            ease: "power4.out"
        });
    }

    // --- FATWA MODAL UPGRADE ---
    const modal = document.getElementById("fatwa-modal");
    const fatwaBtns = document.querySelectorAll("#ask-fatwa-btn, #floating-fatwa-btn");
    const closeModal = document.querySelector(".close-modal");
    const fatwaForm = document.getElementById("fatwa-form");
    const formContainer = document.getElementById("modal-form-container");
    const statusContainer = document.getElementById("modal-status-container");
    const submitBtn = document.getElementById("fatwa-submit");
    const spinner = document.getElementById("submit-spinner");
    const notification = document.getElementById("ui-notification");

    const showNotification = (urdu, title, msg) => {
        notification.className = "ui-notification error active";
        notification.innerHTML = `
            <div class="notification-content">
                <p class="urdu-notif">${urdu}</p>
                <p class="notif-title">${title}</p>
                <p class="notif-msg">${msg}</p>
            </div>
        `;
        setTimeout(() => notification.classList.remove('active'), 5000);
    };

    const showStatusScreen = (success, urdu, title, msg) => {
        formContainer.style.display = "none";
        statusContainer.style.display = "block";
        statusContainer.className = `status-container ${success ? 'status-success' : 'status-error'}`;

        statusContainer.innerHTML = `
            <div class="status-icon">
                <i class="fas ${success ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
            </div>
            <span class="urdu-status">${urdu}</span>
            <h4 class="status-title">${title}</h4>
            <p class="status-msg">${msg}</p>
            <button class="btn-submit-gold" style="margin-top: 30px;" onclick="location.reload()">Close</button>
        `;
    };

    fatwaBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            modal.style.display = "block";
            document.body.style.overflow = "hidden";
        };
    });

    if (closeModal) {
        closeModal.onclick = () => {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        };
    }

    window.onclick = (e) => {
        if (e.target == modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    };

    if (fatwaForm) {
        fatwaForm.onsubmit = async (e) => {
            e.preventDefault();

            const name = document.getElementById("fatwa-name").value.trim();
            const email = document.getElementById("fatwa-email").value.trim();
            const whatsapp = document.getElementById("fatwa-whatsapp").value.trim();
            const question = document.getElementById("fatwa-question").value.trim();

            // Validation
            if (!name || !question) {
                showNotification('معذرت', 'Required Fields', 'Please fill in your name and question.');
                return;
            }

            if (!email && !whatsapp) {
                showNotification('معذرت (Apologies)', 'Contact Missing', 'Please provide either an Email or a WhatsApp number.');
                return;
            }

            // UI Loading State
            submitBtn.disabled = true;
            spinner.style.display = "block";
            submitBtn.querySelector('.btn-text').style.opacity = "0.5";

            try {
                const response = await fetch('https://ceimran.pythonanywhere.com/api/fatwa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, whatsapp, question })
                });

                if (response.ok) {
                    showStatusScreen(
                        true,
                        'جَزَاكَ ٱللَّٰهُ خَيْرًا',
                        'Submitted Successfully',
                        'Your question has been submitted. We will reply to you soon via Email or WhatsApp.'
                    );
                } else {
                    throw new Error('API Error');
                }
            } catch (err) {
                showStatusScreen(
                    false,
                    'معذرت (Apologies)',
                    'Submission Failed',
                    'Something went wrong. Please check your connection and try again.'
                );
            } finally {
                submitBtn.disabled = false;
                spinner.style.display = "none";
                submitBtn.querySelector('.btn-text').style.opacity = "1";
            }
        };
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // If it's just "#", prevent jump and ignore
            if (href === '#') {
                e.preventDefault();
                return;
            }

            if (href.startsWith('#')) {
                e.preventDefault();
                try {
                    const target = document.querySelector(href);
                    if (target) {
                        window.scrollTo({
                            top: target.offsetTop,
                            behavior: 'smooth'
                        });
                    }
                } catch (err) {
                    console.warn('Invalid selector:', href);
                }
            }
        });
    });

    // Active Navigation Highlight
    const highlightActiveNav = () => {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.header-nav a, .footer-links a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Clean paths for comparison
            const cleanHref = href.split('#')[0];
            const cleanPath = currentPath === '/' ? '/' : currentPath.replace(/\/index\.html$/, '/');

            if (cleanHref === cleanPath || (cleanPath === '/' && cleanHref === '/index.html')) {
                link.classList.add('active');
            }
        });
    };

    highlightActiveNav();
});
