import React, { useState, useMemo } from 'react';
import Hero from '../components/Hero';
import Section from '../components/Section';
import ToolCard from '../components/ToolCard';
import SearchFilter from '../components/SearchFilter';
import { tools } from '../data/tools';

const Home: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredTools = useMemo(() => {
        return tools.filter(tool => {
            const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory]);

    const models = filteredTools.filter(t => t.category === 'model');
    const apps = filteredTools.filter(t => t.category === 'app');
    const workflows = filteredTools.filter(t => t.category === 'workflow');
    const production = filteredTools.filter(t => t.category === '3D & Production');

    return (
        <>
            <Hero />

            <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            <div className="content-wrapper">
                {models.length > 0 && (
                    <Section id="models" title="Latest Models">
                        {models.map(tool => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </Section>
                )}

                {apps.length > 0 && (
                    <Section id="apps" title="Applications">
                        {apps.map(tool => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </Section>
                )}

                {workflows.length > 0 && (
                    <Section id="workflows" title="Workflows & Automation">
                        {workflows.map(tool => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </Section>
                )}

                {production.length > 0 && (
                    <Section id="production" title="3D & Production">
                        {production.map(tool => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </Section>
                )}

                {filteredTools.length === 0 && (
                    <div className="container" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                        <p>No tools found matching your criteria.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;
