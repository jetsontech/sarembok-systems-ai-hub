import React from 'react';
import './Section.css';

interface SectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, children }) => {
    return (
        <section id={id} className="section">
            <div className="container">
                <h2 className="section-title">
                    <span className="gradient-text">{title}</span>
                </h2>
                <div className="grid">
                    {children}
                </div>
            </div>
        </section>
    );
};

export default Section;
