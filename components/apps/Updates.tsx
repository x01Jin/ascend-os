import React, { useState } from 'react';
import { Download, Zap, Eye, Clock, AlertTriangle } from 'lucide-react';
import { GameState } from '../../types';
import {
    UPGRADE_COST_BASE,
    BOOST_COST_BASE_PER_SEC,
    AUTOMARK_COST_PER_UNIT,
    CLICK_UPGRADE_INCREMENT
} from '../../constants';

interface UpdatesProps {
    gameState: GameState;
    onPurchaseUpgrade: () => void;
    onPurchaseBoost: (multiplier: number, seconds: number) => void;
    onPurchaseAutoMark: (amount: number) => void;
}

const Updates: React.FC<UpdatesProps> = ({ gameState, onPurchaseUpgrade, onPurchaseBoost, onPurchaseAutoMark }) => {
    const [boostSeconds, setBoostSeconds] = useState(10); // Not used in new UI directly, reused for logic
    const [selectedMultiplier, setSelectedMultiplier] = useState(2);
    const [autoMarkAmount, setAutoMarkAmount] = useState(5);

    const formatSize = (kb: number) => {
        if (kb >= 1024 * 1024) return `${(kb / (1024 * 1024)).toFixed(2)} GB`;
        if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
        return `${kb.toLocaleString()} KB`;
    };

    // Efficiency Upgrade Logic
    const currentEfficiencyCost = Math.floor(UPGRADE_COST_BASE * Math.pow(1.15, gameState.efficiencyLevel));
    const canAffordUpgrade = gameState.dataKB >= currentEfficiencyCost;

    // Boost Logic
    const getBoostCost = (mult: number, secs: number) => {
        // Cost scales with multiplier. x2 = base, x3 = 2*base, x4 = 4*base
        const scale = Math.pow(2, mult - 2);
        return secs * BOOST_COST_BASE_PER_SEC * scale;
    };

    const handleBuyBoost = (seconds: number) => {
        const cost = getBoostCost(selectedMultiplier, seconds);
        if (gameState.dataKB >= cost) {
            onPurchaseBoost(selectedMultiplier, seconds);
        }
    };

    // AutoMark Logic
    const autoMarkCost = autoMarkAmount * AUTOMARK_COST_PER_UNIT;
    const canAffordAutoMark = gameState.dataKB >= autoMarkCost;

    const getBankTime = (mult: number) => {
        const ms = gameState.boostBank[mult] || 0;
        return (ms / 1000).toFixed(1);
    };

    return (
        <div className="h-full flex flex-col bg-gray-950 text-gray-200 select-none">

            {/* Header / Currency Display */}
            <div className="bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center shadow-lg z-10">
                <div className="flex items-center gap-2">
                    <Download className="text-purple-400" />
                    <span className="font-bold text-lg tracking-wide">SYSTEM UPDATES</span>
                </div>
                <div className="font-mono text-sm bg-gray-800 px-3 py-1 rounded border border-gray-700 text-blue-300">
                    DATA AVAILABLE: {formatSize(gameState.dataKB)}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Efficiency Upgrade Card */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={100} />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <Zap size={20} className="text-yellow-400" />
                        Miner Efficiency
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Permanently increases data yield per mining operation.</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm font-mono">
                        <div className="bg-black/30 p-2 rounded">
                            <div className="text-gray-500 text-xs">CURRENT LEVEL</div>
                            <div className="text-white font-bold">{gameState.efficiencyLevel}</div>
                        </div>
                        <div className="bg-black/30 p-2 rounded">
                            <div className="text-gray-500 text-xs">EFFECT</div>
                            <div className="text-green-400 font-bold">+{CLICK_UPGRADE_INCREMENT} KB/op</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="font-mono text-yellow-500 font-bold">
                            {formatSize(currentEfficiencyCost)}
                        </div>
                        <button
                            onClick={onPurchaseUpgrade}
                            disabled={!canAffordUpgrade}
                            className={`
                            flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all
                            ${canAffordUpgrade
                                    ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-900/20'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}
                        `}
                        >
                            INSTALL UPDATE
                        </button>
                    </div>
                </div>

                {/* New Overclock Card */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={100} />
                    </div>

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                <Clock size={20} className="text-red-400" />
                                Overclock Banks
                            </h3>
                            <p className="text-xs text-gray-500">Purchase bottled time for specific overclock multipliers.</p>
                        </div>
                    </div>

                    {/* Multiplier Selector */}
                    <div className="flex gap-2 mb-4">
                        {[2, 3, 4].map(m => (
                            <button
                                key={m}
                                onClick={() => setSelectedMultiplier(m)}
                                className={`
                                flex-1 py-2 rounded border text-sm font-bold transition-all
                                ${selectedMultiplier === m
                                        ? 'bg-red-900/40 border-red-500 text-white shadow-inner'
                                        : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-750'}
                            `}
                            >
                                x{m} BANK
                                <div className="text-xs font-mono font-normal opacity-70">{getBankTime(m)}s</div>
                            </button>
                        ))}
                    </div>

                    {/* Purchase Buttons */}
                    <div className="mt-4 bg-black/20 p-3 rounded border border-gray-800 flex flex-col gap-2">
                        <div className="text-xs text-center text-gray-500 font-mono mb-1">ADD TIME TO x{selectedMultiplier} BANK</div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleBuyBoost(5)}
                                disabled={gameState.dataKB < getBoostCost(selectedMultiplier, 5)}
                                className="flex flex-col items-center justify-center p-2 rounded bg-gray-800 border border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-white font-bold">+5 SECONDS</span>
                                <span className="text-xs text-red-400">{formatSize(getBoostCost(selectedMultiplier, 5))}</span>
                            </button>
                            <button
                                onClick={() => handleBuyBoost(10)}
                                disabled={gameState.dataKB < getBoostCost(selectedMultiplier, 10)}
                                className="flex flex-col items-center justify-center p-2 rounded bg-gray-800 border border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-white font-bold">+10 SECONDS</span>
                                <span className="text-xs text-red-400">{formatSize(getBoostCost(selectedMultiplier, 10))}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Consumable: Auto-Mark */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Eye size={100} />
                    </div>

                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                <Eye size={20} className="text-cyan-400" />
                                Auto-Marker
                            </h3>
                            <p className="text-xs text-gray-500">Automatically marks folders as visited when you enter them.</p>
                        </div>
                        <div className="bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 px-3 py-1 rounded text-xs font-mono">
                            OWNED: {gameState.autoMarkCount}
                        </div>
                    </div>

                    <div className="mt-4 bg-black/20 p-3 rounded border border-gray-800">
                        <label className="text-xs text-gray-400 font-mono mb-2 block flex justify-between">
                            <span>BUNDLE SIZE</span>
                            <span>{autoMarkAmount} UNITS</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAutoMarkAmount(Math.max(1, autoMarkAmount - 1))}
                                className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded hover:bg-gray-700 border border-gray-600"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={autoMarkAmount}
                                onChange={(e) => setAutoMarkAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="flex-1 bg-gray-900 border border-gray-700 rounded h-8 px-2 text-center text-sm font-mono focus:border-cyan-500 outline-none"
                            />
                            <button
                                onClick={() => setAutoMarkAmount(autoMarkAmount + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded hover:bg-gray-700 border border-gray-600"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="font-mono text-blue-400">
                            {formatSize(autoMarkCost)}
                        </div>
                        <button
                            onClick={() => onPurchaseAutoMark(autoMarkAmount)}
                            disabled={!canAffordAutoMark}
                            className={`
                            flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all
                            ${canAffordAutoMark
                                    ? 'bg-cyan-700 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-900/20'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}
                        `}
                        >
                            BUY BUNDLE
                        </button>
                    </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded bg-orange-900/10 border border-orange-500/20">
                    <AlertTriangle size={16} className="text-orange-500 mt-0.5" />
                    <p className="text-xs text-orange-200/80">
                        Warning: Efficiency Levels and Upgrade Inventory persist through Ascension.
                        Overclock time banks are volatile and may reset on system failure.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Updates;
