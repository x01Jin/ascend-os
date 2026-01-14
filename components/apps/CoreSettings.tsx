import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../../types';
import { SaveMode, exportSave, validateSave } from '../../services/storage';
import { Terminal, RefreshCw, Lock, Unlock, Database, Eye, EyeOff, Save, Trash2, HardDrive, Download, Upload } from 'lucide-react';
import ConfirmationDialog from '../ConfirmationDialog';

interface CoreSettingsProps {
    gameState: GameState;
    saveMode: SaveMode;
    onUpdateSeed: (newSeed: number) => void;
    onToggleDevMode: () => void;
    onToggleAscendRoot: () => void;
    onResetSession: () => void;
    onFactoryReset: () => void;
    onSwitchToNormal: () => void;
    onImportSave: (state: GameState) => void;
}

const CoreSettings: React.FC<CoreSettingsProps> = ({
    gameState,
    saveMode,
    onUpdateSeed,
    onToggleDevMode,
    onToggleAscendRoot,
    onResetSession,
    onFactoryReset,
    onSwitchToNormal,
    onImportSave
}) => {
    const [seedInput, setSeedInput] = useState(gameState.runSeed.toString());
    const [bgChars, setBgChars] = useState<{ id: number, x: number, y: number, text: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Confirmation Dialog State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => void;
        isDanger: boolean;
        confirmLabel?: string;
    }>({ isOpen: false, title: '', message: '', action: () => { }, isDanger: false });

    // Sync seed input if external state changes
    useEffect(() => {
        setSeedInput(gameState.runSeed.toString());
    }, [gameState.runSeed]);

    // Background Glitch Effect
    useEffect(() => {
        const interval = setInterval(() => {
            const id = Date.now();
            const text = Math.random().toString(16).substring(2, 6).toUpperCase();
            const x = Math.random() * 100;
            const y = Math.random() * 100;

            setBgChars(prev => [...prev.slice(-15), { id, x, y, text }]);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const openConfirm = (title: string, message: string, action: () => void, isDanger = false, confirmLabel = "Confirm") => {
        setConfirmState({ isOpen: true, title, message, action, isDanger, confirmLabel });
    };

    const handleApplySeed = () => {
        const num = parseInt(seedInput);
        if (!isNaN(num)) {
            openConfirm(
                "RECONSTRUCT UNIVERSE",
                `Injecting Seed: ${num}\n\nWARNING: This will wipe all current progress (Factory Reset) and restart the system with the new seed.\n\nThis action cannot be undone.`,
                () => onUpdateSeed(num),
                true,
                "Reconstruct"
            );
        }
    };

    const handleResetSessionClick = () => {
        openConfirm(
            "RESET SESSION",
            "This will wipe the current save slot state and reboot the system.\n\nAre you sure?",
            onResetSession,
            true,
            "Wipe Session"
        );
    };

    const handleFactoryResetClick = () => {
        openConfirm(
            "FACTORY RESET",
            "WARNING: This will delete ALL save data (Normal & Dev), custom wallpapers, and preferences.\n\nThe application will return to its initial installation state.",
            onFactoryReset,
            true,
            "DELETE EVERYTHING"
        );
    };

    const handleExport = () => {
        const json = exportSave(gameState);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ascend_save_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            const parsed = validateSave(result);

            if (parsed) {
                const mode = parsed.isDevModeEnabled ? "DEV" : "NORMAL";
                openConfirm(
                    "IMPORT SAVE DATA",
                    `Valid save file detected.\nMode: ${mode}\nIteration: ${parsed.currentIteration}\nData: ${(parsed.dataKB / 1024).toFixed(1)} MB\n\nImporting will OVERWRITE your current session and trigger a system reboot.`,
                    () => onImportSave(parsed),
                    true,
                    "Import & Reboot"
                );
            } else {
                openConfirm(
                    "IMPORT FAILED",
                    "The selected file is invalid or corrupted.",
                    () => { },
                    false,
                    "Close"
                );
            }
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="h-full bg-black text-red-500 font-mono relative overflow-hidden select-none flex flex-col">
            <style>{`
                @keyframes glitch-skew {
                    0% { transform: skew(0deg); }
                    20% { transform: skew(-2deg); }
                    40% { transform: skew(2deg); }
                    60% { transform: skew(-1deg); }
                    80% { transform: skew(1deg); }
                    100% { transform: skew(0deg); }
                }
                @keyframes crt-flicker {
                    0% { opacity: 0.9; }
                    5% { opacity: 0.8; }
                    10% { opacity: 0.9; }
                    100% { opacity: 0.95; }
                }
                .glitch-container {
                    animation: crt-flicker 0.1s infinite;
                }
                .glitch-box:hover {
                    animation: glitch-skew 0.3s infinite;
                    box-shadow: -2px 0 red, 2px 0 blue;
                }
            `}</style>

            {/* Background Chaos */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                {bgChars.map(char => (
                    <div
                        key={char.id}
                        className="absolute text-xs text-red-800 font-bold opacity-0 animate-pulse"
                        style={{ left: `${char.x}%`, top: `${char.y}%`, animation: 'ping 1s forwards' }}
                    >
                        {char.text}
                    </div>
                ))}
            </div>

            <div className="relative z-10 flex flex-col h-full p-6 space-y-6 glitch-container overflow-y-auto">
                {/* Header */}
                <div className="border-b-2 border-red-900 pb-2 flex justify-between items-end shrink-0">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest text-red-500 drop-shadow-[2px_2px_0_rgba(255,0,0,0.3)]">
                            CORE_SETTINGS
                        </h1>
                        <p className="text-xs text-red-800 bg-black inline-block px-1">ADMIN_PRIVILEGES_OVERRIDE</p>
                    </div>
                    <Terminal size={24} className="text-red-600 animate-pulse" />
                </div>

                {/* 1. Dev Mode Section */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold bg-red-900/20 px-2 py-1 inline-block border-l-4 border-red-600">
                        DEV_OVERRIDES
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Infinite Data */}
                        <div
                            onClick={onToggleDevMode}
                            className={`
                                glitch-box border border-red-900 p-3 cursor-pointer transition-all
                                ${gameState.isDevModeEnabled ? 'bg-red-900/20 shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'bg-black hover:bg-red-950'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <Database size={18} />
                                {gameState.isDevModeEnabled ? <Unlock size={14} /> : <Lock size={14} />}
                            </div>
                            <div className="text-sm font-bold">INFINITE DATA</div>
                            <div className="text-[10px] text-red-700 mt-1">
                                {gameState.isDevModeEnabled ? "STATUS: ACTIVE" : "STATUS: DISABLED"}
                            </div>
                        </div>

                        {/* Ascend Root */}
                        <div
                            onClick={onToggleAscendRoot}
                            className={`
                                glitch-box border border-red-900 p-3 cursor-pointer transition-all
                                ${gameState.isAscendRootEnabled ? 'bg-red-900/20 shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'bg-black hover:bg-red-950'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                {gameState.isAscendRootEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                <RefreshCw size={14} />
                            </div>
                            <div className="text-sm font-bold">ROOT ASCENSION</div>
                            <div className="text-[10px] text-red-700 mt-1">
                                {gameState.isAscendRootEnabled ? "TARGET: ROOT" : "TARGET: DEEP"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Save Management Section */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold bg-red-900/20 px-2 py-1 inline-block border-l-4 border-red-600">
                        SAVE_MANAGEMENT
                    </h2>

                    <div className="bg-gray-900/50 border border-red-900/50 p-3 rounded space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono mb-2">
                            <span className="text-gray-400">CURRENT SLOT:</span>
                            <span className={`font-bold px-2 py-0.5 rounded ${saveMode === 'DEV' ? 'bg-red-900 text-white animate-pulse' : 'bg-blue-900 text-white'}`}>
                                {saveMode === 'DEV' ? 'DEV_STATE_V1' : 'NORMAL_STATE_V2'}
                            </span>
                        </div>

                        {saveMode === 'DEV' && (
                            <button
                                onClick={onSwitchToNormal}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-900/30 border border-blue-700 hover:bg-blue-800 text-blue-200 text-xs font-bold transition-all"
                            >
                                <Save size={14} />
                                SWITCH TO NORMAL SAVE
                            </button>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleResetSessionClick}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-900/20 border border-red-800 hover:bg-red-900/50 text-red-400 text-xs font-bold transition-all"
                            >
                                <RefreshCw size={14} />
                                RESET SESSION
                            </button>
                            <button
                                onClick={handleFactoryResetClick}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-950 border border-red-900 hover:bg-red-900 text-red-200 text-xs font-bold transition-all"
                            >
                                <Trash2 size={14} />
                                FACTORY RESET
                            </button>
                        </div>
                    </div>

                    {/* Import / Export */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 hover:bg-gray-800 text-gray-300 text-xs font-bold transition-all"
                        >
                            <Download size={14} />
                            EXPORT JSON
                        </button>
                        <button
                            onClick={handleImportClick}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 hover:bg-gray-800 text-gray-300 text-xs font-bold transition-all"
                        >
                            <Upload size={14} />
                            IMPORT JSON
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            className="hidden"
                        />
                    </div>
                </div>

                {/* 3. Universe Seed (Last) */}
                <div className="space-y-4 pb-4">
                    <h2 className="text-sm font-bold bg-red-900/20 px-2 py-1 inline-block border-l-4 border-red-600">
                        UNIVERSE_SEED
                    </h2>

                    <div className="flex items-center gap-2 border border-red-900 p-2 bg-black">
                        <span className="text-red-700 font-bold px-2">#</span>
                        <input
                            type="text"
                            value={seedInput}
                            onChange={(e) => setSeedInput(e.target.value)}
                            className="bg-transparent border-none outline-none text-red-400 font-mono w-full placeholder-red-900 text-sm"
                        />
                    </div>

                    <button
                        onClick={handleApplySeed}
                        className="w-full px-4 py-3 bg-red-900 hover:bg-red-700 text-black font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                    >
                        <HardDrive size={16} />
                        RECONSTRUCT UNIVERSE
                    </button>

                    <p className="text-[10px] text-red-800 text-center uppercase">
                        WARNING: INJECTING NEW SEED WILL WIPE CURRENT PROGRESS AND START FRESH.
                    </p>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={() => {
                    confirmState.action();
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                }}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                isDanger={confirmState.isDanger}
                confirmLabel={confirmState.confirmLabel}
            />
        </div>
    );
};

export default CoreSettings;