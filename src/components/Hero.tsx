import React from 'react';
import QuickCreateWidget from './QuickCreateWidget';
import './Hero.css';

const Hero: React.FC = () => {
    return (
        <section className="hero">
            <div className="container hero-content">
                <h1 className="hero-title">
                    Welcome to <br />
                    <span className="gradient-text">Sarembok Systems</span>
                </h1>
                <p className="hero-subtitle">
                    The premier hub for advanced AI models, creative tools, and automation workflows.
                    Curated for creators, developers, and visionaries.
                </p>
                <div className="hero-actions">
                    <a href="#models" className="btn btn-primary">Explore Models</a>
                    <a href="#workflows" className="btn btn-secondary">Automate Now</a>
                </div>

                <QuickCreateWidget />
            </div>

            <div className="hero-glow"></div>
        </section>
    );
};

export default Hero;
