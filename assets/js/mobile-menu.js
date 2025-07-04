// Mobile Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            // Toggle active class on both button and nav links
            mobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Update aria-expanded attribute for accessibility
            const isExpanded = navLinks.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
        });
        
        // Close mobile menu when clicking on a nav link
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', false);
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && !navLinks.contains(event.target)) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', false);
            }
        });
        
        // Close mobile menu on window resize if it's open
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', false);
            }
        });
    }
});