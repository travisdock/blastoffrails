document.addEventListener('DOMContentLoaded', function() {
    // Pricing Configuration
    const tierPricing = {
        1: {
            price: 1875,
            name: 'Tier 1',
            tickets: 1,
            socialPromos: 1
        },
        2: {
            price: 3375,
            name: 'Tier 2',
            tickets: 3,
            socialPromos: 2
        },
        3: {
            price: 6125,
            name: 'Tier 3',
            tickets: 6,
            socialPromos: 3
        }
    };

    const addonPricing = {
        exhibition: { price: 1500, name: 'Exhibition Space' },
        lightning: { price: 1500, name: 'Lightning Talk' },
        'dedicated-email': { price: 1000, name: 'Dedicated Email to Attendees' },
        'email-mention': { price: 400, name: 'Mention in Regular Emails' },
        'extra-tickets': { price: 200, name: 'Additional Tickets' },
        'extra-social': { price: 800, name: 'Additional Social Media Promotions' }
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
        const extraTickets = parseInt(extraTicketsInput.value) || 0;
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
        const extraSocial = parseInt(extraSocialInput.value) || 0;
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