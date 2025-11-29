import React, { useState } from 'react';
import type { CampaignData } from './AdVelocity';
import './CampaignWizard.css';

interface CampaignWizardProps {
    initialData: CampaignData;
    onComplete: (data: CampaignData) => void;
}

const CampaignWizard: React.FC<CampaignWizardProps> = ({ initialData, onComplete }) => {
    const [formData, setFormData] = useState<CampaignData>(initialData);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleChange = (field: keyof CampaignData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.productName || !formData.audience) {
            alert('Please fill in the Product Name and Target Audience.');
            return;
        }
        onComplete(formData);
    };

    return (
        <div className="campaign-wizard">
            <div className="wizard-header">
                <h2>Start Your Campaign</h2>
                <p>Tell us about your product and goals. AI will handle the rest.</p>
            </div>

            <div className="wizard-form">
                <div className="form-group">
                    <label>Product / Brand Name</label>
                    <input
                        type="text"
                        value={formData.productName}
                        onChange={(e) => handleChange('productName', e.target.value)}
                        placeholder="e.g. Quantum Energy Drink"
                    />
                </div>

                <div className="form-group">
                    <label>Product URL (Optional)</label>
                    <input
                        type="url"
                        value={formData.productUrl}
                        onChange={(e) => handleChange('productUrl', e.target.value)}
                        placeholder="https://..."
                    />
                    <small>We'll scan this for visual style and assets.</small>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Target Audience</label>
                        <input
                            type="text"
                            value={formData.audience}
                            onChange={(e) => handleChange('audience', e.target.value)}
                            placeholder="e.g. Gen Z Gamers"
                        />
                    </div>

                    <div className="form-group">
                        <label>Mood / Vibe</label>
                        <select
                            value={formData.mood}
                            onChange={(e) => handleChange('mood', e.target.value)}
                        >
                            <option value="Energetic">⚡ Energetic & Fast</option>
                            <option value="Cinematic">🎬 Cinematic & Epic</option>
                            <option value="Minimalist">✨ Minimalist & Clean</option>
                            <option value="Funny">😂 Humorous & Quirky</option>
                            <option value="Emotional">❤️ Emotional & Inspiring</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Platform Format</label>
                    <div className="platform-grid">
                        <div
                            className={`platform-card ${formData.platform === 'tiktok' ? 'selected' : ''}`}
                            onClick={() => handleChange('platform', 'tiktok')}
                        >
                            <div className="platform-icon">📱</div>
                            <div className="platform-name">TikTok / Reels</div>
                            <div className="platform-res">9:16 Vertical</div>
                        </div>
                        <div
                            className={`platform-card ${formData.platform === 'youtube' ? 'selected' : ''}`}
                            onClick={() => handleChange('platform', 'youtube')}
                        >
                            <div className="platform-icon">📺</div>
                            <div className="platform-name">YouTube</div>
                            <div className="platform-res">16:9 Landscape</div>
                        </div>
                        <div
                            className={`platform-card ${formData.platform === 'tv' ? 'selected' : ''}`}
                            onClick={() => handleChange('platform', 'tv')}
                        >
                            <div className="platform-icon">🎥</div>
                            <div className="platform-name">TV Commercial</div>
                            <div className="platform-res">4K Cinema</div>
                        </div>
                    </div>
                </div>

                {/* Agency-Grade Advanced Targeting */}
                <div className="advanced-section">
                    <button
                        type="button"
                        className="btn-advanced-toggle"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        {showAdvanced ? '▼' : '▶'} Advanced Targeting (W+K & Droga5 Techniques)
                    </button>

                    {showAdvanced && (
                        <div className="advanced-fields">
                            <div className="form-group">
                                <label>Who REALLY Buys This? 🎯</label>
                                <input
                                    type="text"
                                    value={formData.realPurchaser || ''}
                                    onChange={(e) => handleChange('realPurchaser' as any, e.target.value)}
                                    placeholder="e.g., Parents buying for teens, Women buying men's products"
                                />
                                <small>Old Spice Technique: Target the actual purchaser, not just the user</small>
                            </div>

                            <div className="form-group">
                                <label>Emotional Core 💖</label>
                                <select
                                    value={formData.emotionalCore || 'inspiration'}
                                    onChange={(e) => handleChange('emotionalCore' as any, e.target.value)}
                                >
                                    <option value="inspiration">✨ Inspiration (Nike "Just Do It")</option>
                                    <option value="empowerment">💪 Empowerment ("Dream Crazy")</option>
                                    <option value="joy">😊 Joy (Coca-Cola)</option>
                                    <option value="connection">🤝 Connection ("Share a Coke")</option>
                                    <option value="nostalgia">🕰️ Nostalgia (Classic brands)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Human Truth 🎭</label>
                                <textarea
                                    value={formData.humanTruth || ''}
                                    onChange={(e) => handleChange('humanTruth' as any, e.target.value)}
                                    placeholder="e.g., Everyone wants to feel capable, People crave authentic connection"
                                    rows={2}
                                />
                                <small>Droga5 Technique: What fundamental human truth does this tap into?</small>
                            </div>

                            <div className="form-group">
                                <label>Pain Point 😰</label>
                                <textarea
                                    value={formData.painPoint || ''}
                                    onChange={(e) => handleChange('painPoint' as any, e.target.value)}
                                    placeholder="e.g., Fear of missing out, Feeling left behind, Lack of confidence"
                                    rows={2}
                                />
                                <small>What problem keeps your audience up at night?</small>
                            </div>

                            <div className="form-group">
                                <label>Visual Style 🎨</label>
                                <div className="visual-style-grid">
                                    <div
                                        className={`style-card ${formData.visualStyle === 'wk-bold' ? 'selected' : ''}`}
                                        onClick={() => handleChange('visualStyle' as any, 'wk-bold')}
                                    >
                                        <div className="style-preview wk-bold"></div>
                                        <div className="style-name">W+K Bold</div>
                                        <div className="style-desc">High-contrast, athletic, empowering</div>
                                    </div>
                                    <div
                                        className={`style-card ${formData.visualStyle === 'droga5-artful' ? 'selected' : ''}`}
                                        onClick={() => handleChange('visualStyle' as any, 'droga5-artful')}
                                    >
                                        <div className="style-preview droga5-artful"></div>
                                        <div className="style-name">Droga5 Artful</div>
                                        <div className="style-desc">Cinematic, oblique, authentic</div>
                                    </div>
                                    <div
                                        className={`style-card ${formData.visualStyle === 'old-spice-surreal' ? 'selected' : ''}`}
                                        onClick={() => handleChange('visualStyle' as any, 'old-spice-surreal')}
                                    >
                                        <div className="style-preview old-spice-surreal"></div>
                                        <div className="style-name">Old Spice Surreal</div>
                                        <div className="style-desc">Unexpected, humorous, bold</div>
                                    </div>
                                    <div
                                        className={`style-card ${!formData.visualStyle || formData.visualStyle === 'default' ? 'selected' : ''}`}
                                        onClick={() => handleChange('visualStyle' as any, 'default')}
                                    >
                                        <div className="style-preview default"></div>
                                        <div className="style-name">Standard</div>
                                        <div className="style-desc">Clean, professional</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="wizard-actions">
                    <button type="button" className="btn-next" onClick={handleSubmit}>
                        Generate Script & Storyboard →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignWizard;
