import React from 'react';
import { Link } from 'react-router-dom';
import GlobalPromptEnhancer from './GlobalPromptEnhancer';
import ConstellationBackground from './ConstellationBackground';
import { HistoryProvider } from '../context/HistoryContext';
import HistorySidebar from './HistorySidebar';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <HistoryProvider>
            <div className="layout">
                <ConstellationBackground />
                <header className="header glass-panel">
                    <div className="container header-content">
                        <div className="logo gradient-text">Sarembok Systems</div>
                        <nav className="nav">
                            <Link to="/">Models</Link>
                            <Link to="/">Apps</Link>
                            <Link to="/playground">Playground</Link>
                        </nav>
                    </div>
                </header>

                <main className="main">
                    {children}
                </main>

                <footer className="footer">
                    <div className="container">
                        <p className="footer-text">© 2025 Sarembok Systems. The Future is Now.</p>
                    </div>
                </footer>

                <GlobalPromptEnhancer />
                <HistorySidebar />
            </div>
        </HistoryProvider>
    );
};

export default Layout;
