// Booth Selection
document.querySelectorAll('.select-booth').forEach(button => {
    button.addEventListener('click', function () {
        const boothType = this.dataset.booth;
        const radioButton = document.querySelector(`input[name="boothType"][value="${boothType}"]`);
        if (radioButton) {
            radioButton.checked = true;
        }
        // Scroll to registration form
        document.querySelector('#register').scrollIntoView({ behavior: 'smooth' });
    });
});

// Form Submission
document.getElementById('vendorForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form data
    const formData = {
        businessName: document.getElementById('businessName').value,
        businessType: document.getElementById('businessType').value,
        description: document.getElementById('description').value,
        contactName: document.getElementById('contactName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        website: document.getElementById('website').value,
        boothType: document.querySelector('input[name="boothType"]:checked').value,
        specialRequests: document.getElementById('specialRequests').value,
        terms: document.getElementById('terms').checked,
        insurance: document.getElementById('insurance').checked,
        timestamp: new Date().toISOString()
    };

    // Calculate price
    const prices = {
        'standard': 350,
        'premium': 550,
        'food-truck': 750
    };
    const price = prices[formData.boothType];

    // Show loading state
    const submitButton = this.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;

    try {
        // In production, send to your backend
        // For demo, we'll simulate payment redirect
        console.log('Vendor Registration:', formData);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Store data in localStorage for demo
        localStorage.setItem('vendorRegistration', JSON.stringify(formData));

        // Redirect to payment (in production, use Stripe/PayPal/Square)
        alert(`Registration submitted!\n\nBooth: ${formData.boothType}\nTotal: $${price}\n\nYou would now be redirected to secure payment.\n\nFor demo purposes, your registration has been saved.`);

        // Reset form
        this.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('Registration error:', error);
        alert('There was an error processing your registration. Please try again.');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all benefit cards, pricing cards, and FAQ items
document.querySelectorAll('.benefit-card, .pricing-card, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Form validation enhancement
document.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
    field.addEventListener('invalid', function () {
        this.classList.add('error');
    });

    field.addEventListener('input', function () {
        this.classList.remove('error');
    });
});
