// Simple script for handling interactions and fallbacks

document.addEventListener('DOMContentLoaded', function () {
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover effect to QR codes
    const qrPlaceholders = document.querySelectorAll('.qr-placeholder');
    qrPlaceholders.forEach(placeholder => {
        placeholder.addEventListener('mouseenter', function () {
            const store = this.dataset.store;
            this.style.borderColor = 'var(--primary-color)';
        });

        placeholder.addEventListener('mouseleave', function () {
            this.style.borderColor = '#e9ecef';
        });
    });

    // Add animation on scroll for mobile
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe features on mobile
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.feature').forEach(feature => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateY(20px)';
            feature.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(feature);
        });
    }

    // Track button clicks (optional analytics)
    const clubsButton = document.querySelector('.clubs-button');
    if (clubsButton) {
        clubsButton.addEventListener('click', function () {
            console.log('Espace Clubs button clicked');
            // Add analytics tracking here if needed
        });
    }

    const githubLink = document.querySelector('.github-link');
    if (githubLink) {
        githubLink.addEventListener('click', function () {
            console.log('GitHub link clicked');
            // Add analytics tracking here if needed
        });
    }

    // Log page load
    console.log('Studysen landing page loaded successfully');
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        // Re-calculate layout if needed
        console.log('Window resized to:', window.innerWidth, 'x', window.innerHeight);
    }, 250);
});
