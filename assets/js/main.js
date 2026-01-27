// ========================================
// RANDOM BACKGROUND MODULE
// ========================================
(function() {
    // Check WebP support
    function supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    const ext = supportsWebP() ? 'webp' : 'jpg';
    const backgrounds = [
        `assets/images/backgrounds/background.${ext}`,
        `assets/images/backgrounds/background2.${ext}`,
        `assets/images/backgrounds/background3.${ext}`
    ];

    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        heroBackground.style.backgroundImage = `url('${randomBg}')`;
        heroBackground.style.backgroundSize = 'cover';
        heroBackground.style.backgroundPosition = 'center center';
        heroBackground.style.backgroundRepeat = 'no-repeat';
    }
})();

// ========================================
// ANALYTICS MODULE
// ========================================
(function() {
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' || 
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.hostname === '::1') {
    console.log('Travalytics: Skipping tracking on localhost');
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://travserve.net/analytics.js';
  script.setAttribute('data-tracking-id', '0543527a-695b-488a-8152-1341efef043f');
  script.setAttribute('data-endpoint', 'https://travserve.net');
  script.async = true;
  document.head.appendChild(script);
})();

// ========================================
// MOBILE MENU MODULE
// ========================================
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

// ========================================
// EMAIL SUBSCRIPTION MODULE
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const tsField = document.getElementById("ts");
    if (tsField) {
        tsField.value = Date.now();
    }

    const subscribeForm = document.getElementById("subscribe-form");
    if (subscribeForm) {
        subscribeForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const form = e.target;
            const email = form.email.value;
            const website = form.website.value;
            const ts = form.ts.value;

            const res = await fetch("https://mailerlite-api.travisdock.workers.dev/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, ts, website }),
            });

            const data = await res.json();
            const message = document.getElementById("subscribe-message");
            message.textContent = res.ok ? "✅ Thanks for subscribing!" : "❌ Error: " + data.error;
        });
    }
});

// ========================================
// SPONSOR CALCULATOR MODULE
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Skip if not on sponsor page
    if (!document.getElementById('sponsor-calculator')) return;

    // Pricing Configuration
    const tierPricing = {
        1: {
            price: 1250,
            name: 'Tier 1',
            tickets: 1,
            socialPromos: 1
        },
        2: {
            price: 2500,
            name: 'Tier 2',
            tickets: 3,
            socialPromos: 2
        },
        3: {
            price: 4000,
            name: 'Tier 3',
            tickets: 6,
            socialPromos: 3
        }
    };

    const addonPricing = {
        exhibition: { price: 1000, name: 'Exhibition Space' },
        lightning: { price: 1000, name: 'Lightning Talk' },
        'dedicated-email': { price: 600, name: 'Dedicated Email to Attendees' },
        'email-mention': { price: 400, name: 'Mention in Regular Emails' },
        'extra-tickets': { price: 200, name: 'Additional Tickets' },
        'extra-social': { price: 600, name: 'Additional Social Media Promotions' }
    };

    // DOM Elements
    const tierInputs = document.querySelectorAll('input[name="tier"]');
    const checkboxAddons = document.querySelectorAll('.addon-item input[type="checkbox"]');
    const extraTicketsInput = document.getElementById('extra-tickets');
    const extraSocialInput = document.getElementById('extra-social');
    const summaryTierName = document.getElementById('summary-tier-name');
    const summaryTierPrice = document.getElementById('summary-tier-price');
    const summaryAddons = document.getElementById('summary-addons');
    const totalPriceElement = document.getElementById('total-price');
    const emailLink = document.getElementById('sponsor-email-link');
    const copyButton = document.getElementById('copy-package-details');
    const copyFeedback = document.getElementById('copy-feedback');

    // Store package details for copying
    let currentPackageDetails = '';

    // Format currency
    function formatCurrency(amount) {
        return '$' + amount.toLocaleString('en-US');
    }

    // Calculate total price
    function calculateTotal() {
        let total = 0;
        let selectedTier = null;
        let addonsHTML = '';
        let emailBody = 'I am interested in the following sponsorship package:\n\n';

        // Get selected tier
        tierInputs.forEach(input => {
            if (input.checked) {
                selectedTier = tierPricing[input.value];
                total += selectedTier.price;
                summaryTierName.textContent = selectedTier.name;
                summaryTierPrice.textContent = formatCurrency(selectedTier.price);
                emailBody += `Base Package: ${selectedTier.name} - ${formatCurrency(selectedTier.price)}\n`;
                emailBody += `Included: ${selectedTier.tickets} ticket(s), ${selectedTier.socialPromos} social media promo(s)\n\n`;
            }
        });

        // Add checkbox addons
        emailBody += 'Add-ons:\n';
        checkboxAddons.forEach(checkbox => {
            if (checkbox.checked) {
                const addon = addonPricing[checkbox.name];
                total += addon.price;
                addonsHTML += `<div class="addon-line">
                    <span>${addon.name}</span>
                    <span>${formatCurrency(addon.price)}</span>
                </div>`;
                emailBody += `- ${addon.name}: ${formatCurrency(addon.price)}\n`;
            }
        });

        // Add extra tickets
        const extraTickets = parseInt(extraTicketsInput.value, 10) || 0;
        if (extraTickets > 0) {
            const ticketCost = extraTickets * addonPricing['extra-tickets'].price;
            total += ticketCost;
            addonsHTML += `<div class="addon-line">
                <span>${extraTickets} Additional Ticket${extraTickets > 1 ? 's' : ''}</span>
                <span>${formatCurrency(ticketCost)}</span>
            </div>`;
            emailBody += `- ${extraTickets} Additional Ticket(s): ${formatCurrency(ticketCost)}\n`;
        }

        // Add extra social media promotions
        const extraSocial = parseInt(extraSocialInput.value, 10) || 0;
        if (extraSocial > 0) {
            const socialCost = extraSocial * addonPricing['extra-social'].price;
            total += socialCost;
            addonsHTML += `<div class="addon-line">
                <span>${extraSocial} Additional Social Media Promo${extraSocial > 1 ? 's' : ''}</span>
                <span>${formatCurrency(socialCost)}</span>
            </div>`;
            emailBody += `- ${extraSocial} Additional Social Media Promotion(s): ${formatCurrency(socialCost)}\n`;
        }

        // Update summary
        summaryAddons.innerHTML = addonsHTML;
        totalPriceElement.textContent = formatCurrency(total);

        // Update email link
        emailBody += `\nTotal Investment: ${formatCurrency(total)}\n\nPlease let me know the next steps to proceed with this sponsorship package.`;
        const subject = `Sponsorship Package Inquiry - ${selectedTier.name} - ${formatCurrency(total)}`;
        emailLink.href = `mailto:travis@blastoffrails.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        
        // Store package details for copying
        currentPackageDetails = emailBody;
    }

    // Add event listeners
    tierInputs.forEach(input => {
        input.addEventListener('change', calculateTotal);
    });

    checkboxAddons.forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotal);
    });

    extraTicketsInput.addEventListener('input', calculateTotal);
    extraSocialInput.addEventListener('input', calculateTotal);

    // Initialize calculator on page load
    calculateTotal();

    // Tier card click handling for better UX
    const tierCards = document.querySelectorAll('.tier-card');
    tierCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // If clicking on the label or card, select the radio
            if (!e.target.matches('input[type="radio"]')) {
                const radio = this.querySelector('input[type="radio"]');
                radio.checked = true;
                calculateTotal();
            }
        });
    });

    // Copy package details functionality
    copyButton.addEventListener('click', async function() {
        // Function to show feedback
        const showFeedback = (message, isSuccess = true) => {
            copyFeedback.textContent = message;
            copyFeedback.className = `copy-feedback ${isSuccess ? 'success' : 'error'}`;
            
            setTimeout(() => {
                copyFeedback.textContent = '';
                copyFeedback.className = 'copy-feedback';
            }, 3000);
        };

        // Try modern Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(currentPackageDetails);
                showFeedback('Package details copied to clipboard!');
                return;
            } catch (err) {
                console.warn('Clipboard API failed, trying fallback:', err);
            }
        }
        
        // Fallback method using textarea
        const textArea = document.createElement('textarea');
        textArea.value = currentPackageDetails;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        
        // Save current selection if any
        const selected = document.getSelection().rangeCount > 0
            ? document.getSelection().getRangeAt(0)
            : false;
        
        // Select and copy
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices
        
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            console.error('Copy command failed:', err);
        }
        
        // Restore original selection
        if (selected) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(selected);
        }
        
        document.body.removeChild(textArea);
        
        if (success) {
            showFeedback('Package details copied to clipboard!');
        } else {
            showFeedback('Failed to copy. Please try selecting and copying manually.', false);
        }
    });
});