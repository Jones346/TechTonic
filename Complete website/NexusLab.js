document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    const header = document.getElementById('header');

    menuToggle.addEventListener('click', function() {
        header.classList.toggle('menu-open'); // This class will control everything
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
    });

    // --- On-Load Fade-in Animation (for homepage content) ---
    const loadFadeInElements = document.querySelectorAll('.fade-in-load');
    // Use a short timeout to ensure the transition is applied after the initial render
    setTimeout(() => {
        loadFadeInElements.forEach(el => {
            el.classList.add('visible');
        });
    }, 100);

    // --- Fade-in on Scroll Animation ---
    const fadeInElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing the element once it's visible
            }
        });
    }, observerOptions);

    fadeInElements.forEach(el => observer.observe(el));

    // --- Animated Counters ---
    const statsSection = document.getElementById('stats-section');
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateCounter = (el) => {
        const target = +el.getAttribute('data-target');
        let count = 0;
        const duration = 2000; // 2 seconds
        const stepTime = Math.abs(Math.floor(duration / target));

        const timer = setInterval(() => {
            count++;
            el.innerText = count;
            if (count === target) {
                clearInterval(timer);
            }
        }, stepTime);
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach(animateCounter);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // --- Back to Top Button ---
    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Show button after scrolling 300px
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Contact Form Validation ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');
        const messageField = document.getElementById('message');

        const displayError = (field, message) => {
            const errorElement = document.getElementById(`${field.id}-error`);
            if (message) {
                field.classList.add('input-error');
                errorElement.textContent = message;
            } else {
                field.classList.remove('input-error');
                errorElement.textContent = '';
            }
        };

        const validateField = (field) => {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';

            if (value === '') {
                errorMessage = 'This field is required.';
                isValid = false;
            } else {
                switch (field.id) {
                    case 'name':
                        if (value.length < 3) errorMessage = 'Name must be at least 3 characters.';
                        break;
                    case 'email':
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) errorMessage = 'Please enter a valid email address.';
                        break;
                    case 'phone':
                        const phoneRegex = /^\d{10,15}$/;
                        if (!phoneRegex.test(value)) errorMessage = 'Please enter a valid phone number (10-15 digits).';
                        break;
                    case 'message':
                        if (value.length < 10) errorMessage = 'Message must be at least 10 characters.';
                        break;
                }
            }
            
            displayError(field, errorMessage);
            return errorMessage === '';
        };

        const fields = [nameField, emailField, phoneField, messageField];

        fields.forEach(field => {
            if (field) {
                field.addEventListener('blur', () => validateField(field));
            }
        });

        contactForm.addEventListener('submit', function(e) {
            let isFormValid = true;
            fields.forEach(field => {
                if (field && !validateField(field)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                e.preventDefault(); // Prevent form submission if validation fails
            }
        });
    }
});