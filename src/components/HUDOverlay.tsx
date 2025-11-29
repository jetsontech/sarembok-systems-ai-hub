import React from 'react';

interface HUDOverlayProps {
    onReactorClick?: () => void;
}

const HUDOverlay: React.FC<HUDOverlayProps> = () => {

    return (
        <div className="nexus-hud-overlay pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                {/* Top Left: System Status - REMOVED */}
                <div></div>

                {/* Top Right: Clock & Weather - REMOVED */}
                <div></div>
            </div>

            {/* Bottom Bar */}
            <div className="flex justify-between items-end">
                {/* Bottom Left: Arc Reactor - REMOVED */}
                <div></div>

                {/* Bottom Right: Location - REMOVED */}
                <div></div>
            </div>
        </div>
    );
};

export default HUDOverlay;
