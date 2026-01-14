import React, { useState, useRef } from 'react';
import { Image, Upload, Trash2, Check, AlertTriangle } from 'lucide-react';

interface PersonalizeProps {
    currentWallpaper?: string;
    onSetWallpaper: (dataUrl: string | undefined) => void;
}

const Personalize: React.FC<PersonalizeProps> = ({ currentWallpaper, onSetWallpaper }) => {
    const [preview, setPreview] = useState<string | undefined>(currentWallpaper);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (Limit to ~3MB to be safe with LocalStorage 5MB limit along with game data)
        if (file.size > 3 * 1024 * 1024) {
            setError("File size too large. Please select an image under 3MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setPreview(result);
        };
        reader.readAsDataURL(file);
    };

    const handleApply = () => {
        onSetWallpaper(preview);
    };

    const handleReset = () => {
        setPreview(undefined);
        onSetWallpaper(undefined);
    };

    return (
        <div className="h-full flex flex-col bg-gray-950 text-gray-200 select-none">
            {/* Header */}
            <div className="bg-gray-900 p-4 border-b border-gray-800 flex items-center gap-2 shadow-lg z-10">
                <Image className="text-pink-400" />
                <span className="font-bold text-lg tracking-wide">PERSONALIZATION</span>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-md mx-auto space-y-6">

                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Desktop Background</h3>
                        <p className="text-xs text-gray-500">Upload an image to replace the default system void. Images are stored locally.</p>
                    </div>

                    {/* Preview Area */}
                    <div className="aspect-video w-full bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg overflow-hidden relative group">
                        {preview ? (
                            <img src={preview} alt="Wallpaper Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-animated">
                                <span className="text-xs font-mono">DEFAULT VOID</span>
                            </div>
                        )}

                        {/* Overlay on hover if preview exists, or always if empty */}
                        <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 transition-opacity ${preview ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center gap-2"
                            >
                                <Upload size={14} />
                                CHOOSE IMAGE
                            </button>
                            <span className="text-[10px] text-gray-400">Max 3MB (JPG, PNG, WEBP)</span>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded flex items-center gap-2 text-xs text-red-300">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            <Trash2 size={16} />
                            Reset to Default
                        </button>

                        <button
                            onClick={handleApply}
                            className="flex items-center gap-2 px-6 py-2 rounded text-sm font-bold bg-green-700 hover:bg-green-600 text-white shadow-lg shadow-green-900/20 transition-all"
                        >
                            <Check size={16} />
                            APPLY CHANGES
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Personalize;
