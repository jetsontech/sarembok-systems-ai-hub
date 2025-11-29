import React, { useState } from 'react';
import CampaignWizard from './CampaignWizard';
import ScriptBoard, { type Scene } from './ScriptBoard';
import AssetFactory, { type GeneratedAsset } from './AssetFactory';
import AudioFactory from './AudioFactory';
import TimelineEditor from './TimelineEditor';
import './AdVelocity.css';

export type WorkflowStep = 'wizard' | 'script' | 'assets' | 'audio' | 'editor';

export interface CampaignData {
    productName: string;
    productUrl: string;
    audience: string;
    mood: string;
    platform: 'tiktok' | 'youtube' | 'tv';
    // Agency-grade enhancements
    realPurchaser?: string;  // Old Spice technique: who ACTUALLY buys this?
    emotionalCore?: 'joy' | 'inspiration' | 'empowerment' | 'connection' | 'nostalgia';
    humanTruth?: string;  // Droga5: what human truth does this tap into?
    painPoint?: string;  // What problem keeps them up at night?
    visualStyle?: 'wk-bold' | 'droga5-artful' | 'old-spice-surreal' | 'default';
}

const AdVelocity: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<WorkflowStep>('wizard');
    const [campaignData, setCampaignData] = useState<CampaignData>({
        productName: '',
        productUrl: '',
        audience: '',
        mood: 'Energetic',
        platform: 'tiktok'
    });
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [assets, setAssets] = useState<GeneratedAsset[]>([]);

    const handleWizardComplete = (data: CampaignData) => {
        setCampaignData(data);
        setCurrentStep('script');
    };

    const handleScriptComplete = (generatedScenes: Scene[]) => {
        setScenes(generatedScenes);
        setCurrentStep('assets');
    };

    const handleAssetsComplete = (generatedAssets: GeneratedAsset[]) => {
        setAssets(generatedAssets);
        setCurrentStep('audio');
    };

    const handleAudioComplete = () => {
        // Audio assets stored, continue to editor
        setCurrentStep('editor');
    };

    return (
        <div className="ad-velocity-container glass-panel">
            <div className="velocity-header">
                <div className="velocity-logo">🚀 AdVelocity <span className="beta-tag">BETA</span></div>
                <div className="velocity-steps">
                    <div className={`step ${currentStep === 'wizard' ? 'active' : ''} ${['script', 'assets', 'audio', 'editor'].includes(currentStep) ? 'completed' : ''}`}>1. Campaign</div>
                    <div className={`step-line ${['script', 'assets', 'audio', 'editor'].includes(currentStep) ? 'completed' : ''}`}></div>
                    <div className={`step ${currentStep === 'script' ? 'active' : ''} ${['assets', 'audio', 'editor'].includes(currentStep) ? 'completed' : ''}`}>2. Script</div>
                    <div className={`step-line ${['assets', 'audio', 'editor'].includes(currentStep) ? 'completed' : ''}`}></div>
                    <div className={`step ${currentStep === 'assets' ? 'active' : ''} ${['audio', 'editor'].includes(currentStep) ? 'completed' : ''}`}>3. Assets</div>
                    <div className={`step-line ${['audio', 'editor'].includes(currentStep) ? 'completed' : ''}`}></div>
                    <div className={`step ${currentStep === 'audio' ? 'active' : ''} ${['editor'].includes(currentStep) ? 'completed' : ''}`}>4. Audio</div>
                    <div className={`step-line ${currentStep === 'editor' ? 'completed' : ''}`}></div>
                    <div className={`step ${currentStep === 'editor' ? 'active' : ''}`}>5. Studio</div>
                </div>
            </div>

            <div className="velocity-content">
                {currentStep === 'wizard' && (
                    <CampaignWizard
                        initialData={campaignData}
                        onComplete={handleWizardComplete}
                    />
                )}
                {currentStep === 'script' && (
                    <ScriptBoard
                        campaignData={campaignData}
                        onComplete={handleScriptComplete}
                        onBack={() => setCurrentStep('wizard')}
                    />
                )}
                {currentStep === 'assets' && (
                    <AssetFactory
                        scenes={scenes}
                        onComplete={handleAssetsComplete}
                    />
                )}
                {currentStep === 'audio' && (
                    <AudioFactory
                        scenes={scenes}
                        onComplete={handleAudioComplete}
                    />
                )}
                {currentStep === 'editor' && (
                    <TimelineEditor
                        assets={assets}
                    />
                )}
            </div>
        </div>
    );
};

export default AdVelocity;
