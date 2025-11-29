import React from 'react';
import './SearchFilter.css';

interface SearchFilterProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

const categories = [
    { id: 'all', label: 'All' },
    { id: 'model', label: 'Models' },
    { id: 'app', label: 'Apps' },
    { id: 'workflow', label: 'Workflows' },
    { id: '3D & Production', label: '3D & Production' }
];

const SearchFilter: React.FC<SearchFilterProps> = ({
    searchTerm,
    onSearchChange,
    activeCategory,
    onCategoryChange
}) => {
    return (
        <div className="search-filter container">
            <div className="search-bar glass-panel">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search AI tools, models, and workflows..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="category-pills">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => onCategoryChange(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchFilter;
