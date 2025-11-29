import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import './JuneteenthEditor.css';

const JuneteenthEditor: React.FC = () => {
    const { addToHistory } = useProject();

    // Editable content state
    const [content, setContent] = useState({
        title: 'Juneteenth Atlanta',
        subtitle: 'Parade & Music Festival',
        date: 'JUNE 19, 2025 • ATLANTA, GA',
        attendees: '50,000+',
        booths: '200+',
        duration: '12hrs',
        ctaText: 'Secure Your Booth Today',
        urgency: '⚡ Limited spaces available - Register before they\'re gone!',

        // Benefits
        benefits: [
            { icon: '👥', title: 'Massive Exposure', desc: 'Connect with 50,000+ attendees celebrating freedom, culture, and community' },
            { icon: '💰', title: 'Revenue Opportunity', desc: 'Prime selling hours during Atlanta\'s largest Juneteenth celebration' },
            { icon: '🎵', title: 'Cultural Impact', desc: 'Be part of a meaningful celebration of African American freedom and heritage' },
            { icon: '🤝', title: 'Community Connection', desc: 'Network with local businesses, artisans, and entrepreneurs' },
            { icon: '📱', title: 'Social Media Buzz', desc: 'Get featured on our platforms with 100K+ combined followers' },
            { icon: '🎁', title: 'Vendor Perks', desc: 'Free parking, setup assistance, and promotional support' }
        ],

        // Pricing
        pricing: [
            { name: 'Standard Booth', price: '$350', space: '10x10 space', features: ['10x10 ft booth space', '1 table & 2 chairs', 'Electricity access', 'Social media promotion', '2 vendor passes'] },
            { name: 'Premium Booth', price: '$550', space: '10x20 space', featured: true, features: ['10x20 ft booth space', '2 tables & 4 chairs', 'Premium electricity', 'Featured social media', '4 vendor passes', 'Prime location'] },
            { name: 'Food Truck', price: '$750', space: '20x30 space', features: ['20x30 ft truck space', 'Generator hookup', 'Water access', 'Premium promotion', '6 vendor passes', 'High-traffic zone'] }
        ]
    });

    // Add to history on mount
    useEffect(() => {
        addToHistory({
            name: 'Juneteenth Vendor Registration',
            type: 'landing-page',
            url: '/juneteenth-vendor-registration/index.html',
            description: 'Vendor registration page for Atlanta Juneteenth festival'
        });
    }, [addToHistory]);

    const handleContentChange = (field: string, value: any) => {
        setContent(prev => ({ ...prev, [field]: value }));
    };

    const handleBenefitChange = (index: number, field: string, value: string) => {
        const newBenefits = [...content.benefits];
        newBenefits[index] = { ...newBenefits[index], [field]: value };
        setContent(prev => ({ ...prev, benefits: newBenefits }));
    };

    const handlePricingChange = (index: number, field: string, value: any) => {
        const newPricing = [...content.pricing];
        newPricing[index] = { ...newPricing[index], [field]: value };
        setContent(prev => ({ ...prev, pricing: newPricing }));
    };

    const exportHTML = () => {
        // Generate updated HTML with new content
        const html = generateHTML(content);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'juneteenth-vendor-registration.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="juneteenth-editor">
            <div className="editor-header">
                <h1>Juneteenth Vendor Page Editor</h1>
                <button onClick={exportHTML} className="btn-export">
                    💾 Export HTML
                </button>
            </div>

            <div className="editor-layout">
                {/* Editor Panel */}
                <div className="editor-panel">
                    <h2>Edit Content</h2>

                    {/* Hero Section */}
                    <div className="edit-section">
                        <h3>Hero Section</h3>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={content.title}
                                onChange={(e) => handleContentChange('title', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Subtitle</label>
                            <input
                                type="text"
                                value={content.subtitle}
                                onChange={(e) => handleContentChange('subtitle', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date & Location</label>
                            <input
                                type="text"
                                value={content.date}
                                onChange={(e) => handleContentChange('date', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>CTA Button Text</label>
                            <input
                                type="text"
                                value={content.ctaText}
                                onChange={(e) => handleContentChange('ctaText', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Urgency Message</label>
                            <input
                                type="text"
                                value={content.urgency}
                                onChange={(e) => handleContentChange('urgency', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="edit-section">
                        <h3>Benefits</h3>
                        {content.benefits.map((benefit, index) => (
                            <div key={index} className="benefit-edit">
                                <input
                                    type="text"
                                    value={benefit.title}
                                    onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                                    placeholder="Title"
                                />
                                <textarea
                                    value={benefit.desc}
                                    onChange={(e) => handleBenefitChange(index, 'desc', e.target.value)}
                                    placeholder="Description"
                                    rows={2}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Pricing */}
                    <div className="edit-section">
                        <h3>Pricing Tiers</h3>
                        {content.pricing.map((tier, index) => (
                            <div key={index} className="pricing-edit">
                                <input
                                    type="text"
                                    value={tier.name}
                                    onChange={(e) => handlePricingChange(index, 'name', e.target.value)}
                                    placeholder="Tier Name"
                                />
                                <input
                                    type="text"
                                    value={tier.price}
                                    onChange={(e) => handlePricingChange(index, 'price', e.target.value)}
                                    placeholder="Price"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Preview */}
                <div className="preview-panel">
                    <h2>Live Preview</h2>
                    <div className="preview-content">
                        <div className="preview-hero">
                            <div className="preview-badge">{content.date}</div>
                            <h1>{content.title}<br /><span className="highlight">{content.subtitle}</span></h1>
                            <div className="preview-stats">
                                <div><strong>{content.attendees}</strong><br />Expected Attendees</div>
                                <div><strong>{content.booths}</strong><br />Vendor Booths</div>
                                <div><strong>{content.duration}</strong><br />of Celebration</div>
                            </div>
                            <button className="preview-cta">{content.ctaText}</button>
                            <p className="preview-urgency">{content.urgency}</p>
                        </div>

                        <div className="preview-benefits">
                            <h2>Why Vendor?</h2>
                            <div className="preview-grid">
                                {content.benefits.map((benefit, index) => (
                                    <div key={index} className="preview-card">
                                        <div className="preview-icon">{benefit.icon}</div>
                                        <h3>{benefit.title}</h3>
                                        <p>{benefit.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="preview-pricing">
                            <h2>Choose Your Booth</h2>
                            <div className="preview-pricing-grid">
                                {content.pricing.map((tier, index) => (
                                    <div key={index} className={`preview-pricing-card ${tier.featured ? 'featured' : ''}`}>
                                        {tier.featured && <div className="badge">MOST POPULAR</div>}
                                        <h3>{tier.name}</h3>
                                        <div className="price">{tier.price}</div>
                                        <p>{tier.space}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to generate HTML
function generateHTML(content: any): string {
    // This would generate the full HTML with updated content
    // For now, return a template
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title} ${content.subtitle}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Updated content would go here -->
    <h1>${content.title}</h1>
    <script src="script.js"></script>
</body>
</html>`;
}

export default JuneteenthEditor;
