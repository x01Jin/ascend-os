import React, { useState, useEffect, useRef } from 'react';
import { Folder, FileText, Cpu, ArrowLeft, Home, HardDrive, Star, Radio, Database, Eye, EyeOff, Package, Upload } from 'lucide-react';
import { DirectoryNode, FileNode, FileType, FileExtension, FileSystemNode, NotificationType } from '../../types';
import { ContextMenuItem } from '../ContextMenu';
import { SCAN_COST } from '../../constants';

interface ExplorerProps {
    root: DirectoryNode;
    initialPath?: string[]; // array of IDs
    onOpenFile: (file: FileNode) => void;
    onContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
    onUpdateNode: (id: string, updates: Partial<FileNode | DirectoryNode>) => void;
    dataKB: number;
    onSpendData: (amount: number) => void;
    // Auto Mark Props
    isAutoMarkEnabled: boolean;
    autoMarkCount: number;
    onToggleAutoMark: () => void;
    onConsumeAutoMark: () => void;
    // Notifications
    onShowNotification: (title: string, message: string, type: NotificationType) => void;
}

// Helper to find a node by ID in the tree
const findNode = (node: DirectoryNode, id: string): FileSystemNode | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
        if (child.id === id) return child;
        if (child.type === FileType.FOLDER) {
            const found = findNode(child as DirectoryNode, id);
            if (found) return found;
        }
    }
    return null;
};

const Explorer: React.FC<ExplorerProps> = ({
    root,
    initialPath,
    onOpenFile,
    onContextMenu,
    onUpdateNode,
    dataKB,
    onSpendData,
    isAutoMarkEnabled,
    autoMarkCount,
    onToggleAutoMark,
    onConsumeAutoMark,
    onShowNotification
}) => {
    const [currentDir, setCurrentDir] = useState<DirectoryNode>(root);
    const [history, setHistory] = useState<DirectoryNode[]>([root]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Renaming State
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const renameInputRef = useRef<HTMLInputElement>(null);

    // Glitch State
    const [isGlitching, setIsGlitching] = useState(false);

    // Re-sync if root changes (e.g. ascension, marking files, or external updates)
    useEffect(() => {
        // Reconstruct the history stack using fresh nodes from the new root.
        const newHistory: DirectoryNode[] = [];
        let isPathValid = true;

        for (const historicNode of history) {
            const freshNode = findNode(root, historicNode.id);
            if (freshNode && freshNode.type === FileType.FOLDER) {
                newHistory.push(freshNode as DirectoryNode);
            } else {
                isPathValid = false;
                break;
            }
        }

        if (isPathValid && newHistory.length > 0) {
            setHistory(newHistory);
            setCurrentDir(newHistory[newHistory.length - 1]);
        } else {
            setCurrentDir(root);
            setHistory([root]);
        }
    }, [root]);

    // Focus rename input
    useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingId]);

    const handleNavigate = (node: DirectoryNode) => {
        setCurrentDir(node);
        setHistory([...history, node]);
        setSelectedId(null);
        setRenamingId(null);

        // Auto Mark Logic
        if (isAutoMarkEnabled && autoMarkCount > 0 && !node.isMarked) {
            onUpdateNode(node.id, { isMarked: true });
            onConsumeAutoMark();
        }
    };

    const handleUp = () => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop();
            setCurrentDir(newHistory[newHistory.length - 1]);
            setHistory(newHistory);
            setSelectedId(null);
            setRenamingId(null);
        }
    };

    const handleGoRoot = () => {
        setCurrentDir(root);
        setHistory([root]);
        setSelectedId(null);
        setRenamingId(null);
    };

    const handleOpenItem = (child: FileSystemNode) => {
        if (renamingId === child.id) return;

        if (child.type === FileType.FOLDER) {
            handleNavigate(child as DirectoryNode);
        } else {
            onOpenFile(child as FileNode);
        }
    };

    const handleItemContextMenu = (e: React.MouseEvent, child: FileSystemNode) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedId(child.id);

        const items: ContextMenuItem[] = [
            { label: 'Open', action: () => handleOpenItem(child) },
            { separator: true, label: '' },
            { label: 'Rename', action: () => startRenaming(child) },
            { label: child.isMarked ? 'Unmark' : 'Mark', action: () => onUpdateNode(child.id, { isMarked: !child.isMarked }) },
            { separator: true, label: '' },
            { label: 'Delete', disabled: true },
            { label: 'Properties', action: () => showProperties(child) }
        ];

        onContextMenu(e.clientX, e.clientY, items);
    };

    const handleScan = () => {
        if (dataKB < SCAN_COST) return;

        const target = currentDir.children.find(c => c.isWinningPath && !c.isScanned);
        const alreadyScanned = currentDir.children.some(c => c.isWinningPath && c.isScanned);

        if (alreadyScanned) {
            // Glitch Mechanic
            setIsGlitching(true);
            const penalty = Math.floor(Math.random() * 9000) + 1000; // 1-10 MB roughly
            onSpendData(penalty);

            setTimeout(() => setIsGlitching(false), 500);
            // REPLACED ALERT WITH NOTIFICATION
            onShowNotification(
                "SYSTEM WARNING",
                `SIGNAL ALREADY ISOLATED.\nREDUNDANT SCAN PENALTY: -${(penalty / 1024).toFixed(2)} MB`,
                NotificationType.ERROR
            );
            return;
        }

        if (target) {
            onSpendData(SCAN_COST);
            onUpdateNode(target.id, { isScanned: true });
        } else {
            alert("No signal trace detected. Dead end.");
        }
    };

    const startRenaming = (child: FileSystemNode) => {
        setRenamingId(child.id);
        setRenameValue(child.name);
    };

    const commitRename = () => {
        if (renamingId && renameValue.trim()) {
            onUpdateNode(renamingId, { name: renameValue.trim() });
        }
        setRenamingId(null);
    };

    const showProperties = (child: FileSystemNode) => {
        alert(`Name: ${child.name}\nType: ${child.type}\nID: ${child.id}\nProtected: Yes`);
    };

    const formatSize = (kb: number) => {
        if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
        return `${kb.toFixed(0)} KB`;
    };

    // Determine if scan is available
    const canScan = dataKB >= SCAN_COST;
    const isWinningPathHere = currentDir.children.some(c => c.isWinningPath);

    return (
        <div
            className="flex flex-col h-full text-gray-200 outline-none"
            tabIndex={0}
            onClick={() => { setSelectedId(null); setRenamingId(null); }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && selectedId && !renamingId) {
                    const selectedItem = currentDir.children.find(c => c.id === selectedId);
                    if (selectedItem) {
                        handleOpenItem(selectedItem);
                    }
                }
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b border-gray-800 bg-gray-900/50" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={handleUp}
                    disabled={history.length <= 1}
                    className={`p-1 rounded ${history.length <= 1 ? 'text-gray-600' : 'hover:bg-gray-700 text-gray-300'}`}
                >
                    <ArrowLeft size={16} />
                </button>
                <button
                    onClick={handleGoRoot}
                    className="p-1 rounded hover:bg-gray-700 text-gray-300"
                >
                    <Home size={16} />
                </button>

                {/* Breadcrumb / Address Bar */}
                <div className="flex-1 bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs font-mono text-gray-400 truncate flex items-center">
                    <HardDrive size={12} className="mr-2 text-green-500" />
                    root/{history.slice(1).map(h => h.name).join('/')}
                </div>

                {/* Data Indicator (Small) */}
                <div className="flex items-center gap-2 px-2 text-xs font-mono border-l border-gray-700">
                    <Database size={12} className="text-blue-500" />
                    <span className="text-gray-400 hidden sm:inline">{formatSize(dataKB)}</span>
                </div>

                {/* Auto Mark Toggle */}
                <button
                    onClick={onToggleAutoMark}
                    title={`Auto-Mark: ${isAutoMarkEnabled ? 'ON' : 'OFF'} (${autoMarkCount} left)`}
                    className={`
                flex items-center gap-1 px-2 py-1 rounded text-xs font-mono border transition-all
                ${isAutoMarkEnabled
                            ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20'
                            : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'}
            `}
                >
                    {isAutoMarkEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span className="hidden sm:inline">{autoMarkCount}</span>
                </button>

                {/* Scan Button */}
                <button
                    onClick={handleScan}
                    disabled={!canScan}
                    title={`Trace Signal: Cost ${formatSize(SCAN_COST)}`}
                    className={`
                flex items-center gap-2 px-2 py-1 rounded text-xs font-mono border transition-all relative overflow-hidden
                ${canScan
                            ? 'bg-green-900/20 border-green-500/50 text-green-400 hover:bg-green-500/20'
                            : 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'}
                ${isGlitching ? 'animate-ping bg-red-500 text-white' : ''}
            `}
                >
                    <Radio size={12} className={canScan ? "animate-pulse" : ""} />
                    <span>{isGlitching ? 'ERROR' : 'TRACE'}</span>
                </button>
            </div>

            {/* File Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {currentDir.children.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <p>Empty Directory</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 content-start">
                        {currentDir.children.map((child) => {
                            const isSelected = selectedId === child.id;
                            const isRenaming = renamingId === child.id;
                            const isScanned = child.isScanned;

                            return (
                                <div
                                    key={child.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedId(child.id);
                                        if (isRenaming) {
                                            // keep focus if clicking self while renaming
                                        } else {
                                            setRenamingId(null);
                                        }
                                    }}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenItem(child);
                                    }}
                                    onContextMenu={(e) => handleItemContextMenu(e, child)}
                                    className={`
                            group flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-all border relative
                            ${isSelected
                                            ? 'bg-blue-500/20 border-blue-500/50'
                                            : 'border-transparent hover:bg-white/5'}
                            ${isScanned ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-green-900/20' : ''}
                        `}
                                >
                                    {child.isMarked && (
                                        <div className="absolute top-1 right-1 text-yellow-400 drop-shadow-md">
                                            <Star size={12} fill="currentColor" />
                                        </div>
                                    )}

                                    <div className={`w-10 h-10 flex items-center justify-center transition-colors ${isSelected ? 'text-blue-300' : 'text-gray-400 group-hover:text-blue-400'}`}>
                                        {child.type === FileType.FOLDER ? (
                                            <Folder
                                                size={40}
                                                fill="currentColor"
                                                className={`
                                        ${isSelected ? "text-blue-500" : "text-gray-700 group-hover:text-blue-900/50"}
                                        ${isScanned ? "!text-green-500" : ""}
                                    `}
                                                stroke="currentColor"
                                            />
                                        ) : child.type === FileType.PACKAGE ? (
                                            <Package
                                                size={40}
                                                className={`${isSelected ? "text-orange-400" : "text-orange-600 group-hover:text-orange-500"} animate-bounce`}
                                            />
                                        ) : child.type === FileType.MODULE ? (
                                            <Upload
                                                size={40}
                                                className={`${isSelected ? "text-green-400" : "text-green-600 group-hover:text-green-500"} animate-pulse`}
                                            />
                                        ) : (child.type === FileType.FILE && child.extension === FileExtension.EXE) ? (
                                            <Cpu size={36} className={isScanned ? "text-green-400 animate-pulse" : "text-purple-500"} />
                                        ) : (
                                            <FileText size={36} className="text-gray-500" />
                                        )}
                                    </div>

                                    {isRenaming ? (
                                        <input
                                            ref={renameInputRef}
                                            type="text"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') commitRename();
                                                if (e.key === 'Escape') setRenamingId(null);
                                                e.stopPropagation();
                                            }}
                                            onBlur={commitRename}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full text-xs text-center bg-gray-950 text-white border border-blue-500 rounded px-1 outline-none"
                                        />
                                    ) : (
                                        <span className={`
                                text-xs text-center truncate w-full px-1 font-mono select-none 
                                ${isSelected ? 'text-white bg-blue-600/50 rounded' : 'text-gray-400 group-hover:text-white'}
                                ${isScanned ? '!text-green-400 font-bold' : ''}
                                ${child.type === FileType.PACKAGE ? 'text-orange-300 font-bold' : ''}
                                ${child.type === FileType.MODULE ? 'text-green-400 font-bold' : ''}
                                ${child.type === FileType.FILE && child.extension === FileExtension.EXE && !isScanned ? 'text-purple-400 font-bold' : ''}
                            `}>
                                            {child.name}
                                            {child.type === FileType.FILE ? `.${child.extension}` : ''}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="p-1 px-3 bg-gray-900 border-t border-gray-800 text-[10px] text-gray-500 flex justify-between" onClick={(e) => e.stopPropagation()}>
                <span>{currentDir.children.length} objects</span>
                <span className="flex items-center gap-1">
                    {isWinningPathHere && <Radio size={10} className="text-gray-700" />}
                    ID: {currentDir.id}
                </span>
            </div>
        </div>
    );
};

export default Explorer;
