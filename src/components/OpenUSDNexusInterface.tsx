import React, { useState } from 'react';
import './OpenUSDNexusInterface.css';

interface Asset {
    id: string;
    name: string;
    category: 'Prop' | 'Environment' | 'Character';
    polyCount: string;
    format: string;
    thumbnail: string;
}

const mockAssets: Asset[] = [
    { id: '1', name: 'Cyberpunk Kiosk', category: 'Prop', polyCount: '12k', format: '.usdz', thumbnail: '🏪' },
    { id: '2', name: 'Neon City Block', category: 'Environment', polyCount: '1.2m', format: '.usd', thumbnail: '🏙️' },
    { id: '3', name: 'Droid Mechanic', category: 'Character', polyCount: '45k', format: '.usda', thumbnail: '🤖' },
    { id: '4', name: 'Holographic Tree', category: 'Prop', polyCount: '8k', format: '.usdz', thumbnail: '🌳' },
    { id: '5', name: 'Mars Outpost', category: 'Environment', polyCount: '850k', format: '.usd', thumbnail: '🚀' },
    { id: '6', name: 'Hover Bike', category: 'Prop', polyCount: '25k', format: '.usdz', thumbnail: '🏍️' },
];

const OpenUSDNexusInterface: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    const filteredAssets = mockAssets.filter(asset =>
        (filter === 'All' || asset.category === filter) &&
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = (assetName: string) => {
        alert(`Initiating USD download for: ${assetName}`);
    };

    return (
        <div className="usd-nexus glass-panel">
            <div className="nexus-header">
                <div className="header-title">
                    <h2>OpenUSD Nexus</h2>
                    <span className="version-badge">v24.03</span>
                </div>
                <div className="nexus-controls">
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="All">All Categories</option>
                        <option value="Prop">Props</option>
                        <option value="Environment">Environments</option>
                        <option value="Character">Characters</option>
                    </select>
                </div>
            </div>

            <div className="assets-grid">
                {filteredAssets.map(asset => (
                    <div key={asset.id} className="asset-card">
                        <div className="asset-thumbnail">{asset.thumbnail}</div>
                        <div className="asset-info">
                            <h3>{asset.name}</h3>
                            <div className="asset-meta">
                                <span>{asset.category}</span>
                                <span>{asset.polyCount} polys</span>
                                <span>{asset.format}</span>
                            </div>
                        </div>
                        <button className="download-btn" onClick={() => handleDownload(asset.name)}>
                            ⬇ USD
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OpenUSDNexusInterface;
