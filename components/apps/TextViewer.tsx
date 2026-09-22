import React, { useState } from 'react';
import { FileNode } from '../../types';

interface TextViewerProps {
  file: FileNode;
  onUnlocked?: (file: FileNode) => void;
  onRead?: (file: FileNode) => void;
}

const TextViewer: React.FC<TextViewerProps> = ({ file, onUnlocked, onRead }) => {
  const [attempt, setAttempt] = useState('');
  const [failed, setFailed] = useState(false);
  const locked = !!file.password;

  React.useEffect(() => {
    onRead?.(file);
  }, [file.id]);

  if (!locked) {
    return (
      <div className="h-full flex flex-col bg-gray-950 text-gray-300 font-mono text-sm">
        <div className="p-4 flex-1 overflow-y-auto whitespace-pre-wrap selection:bg-blue-500/30">
          {file.content}
        </div>
        <div className="p-2 border-t border-gray-800 text-xs text-gray-600 bg-gray-900">
          Line 1, Col 1 &nbsp;|&nbsp; UTF-8 &nbsp;|&nbsp; {file.name}.{file.extension}
        </div>
      </div>
    );
  }

  const submit = () => {
    if (attempt.trim().toUpperCase() === file.password?.toUpperCase()) {
      onUnlocked?.(file);
    } else {
      setFailed(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-300 font-mono text-sm">
      <div className="p-4 flex-1 overflow-y-auto whitespace-pre-wrap selection:bg-blue-500/30">
        {file.content}
        <div className="mt-4 border border-purple-500/30 bg-purple-950/20 rounded p-3">
          <p className="text-xs text-purple-300 mb-2">ENTER GHOST PASSWORD</p>
          <div className="flex gap-2">
            <input
              value={attempt}
              onChange={e => {
                setAttempt(e.target.value);
                setFailed(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') submit();
              }}
              placeholder="4-digit code"
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white outline-none focus:border-purple-500"
            />
            <button
              onClick={submit}
              className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
            >
              DECRYPT
            </button>
          </div>
          {failed && (
            <p className="text-xs text-red-400 mt-2">Wrong password. Check the ghost file.</p>
          )}
        </div>
      </div>
      <div className="p-2 border-t border-gray-800 text-xs text-gray-600 bg-gray-900">
        ENCRYPTED &nbsp;|&nbsp; {file.name}.{file.extension}
      </div>
    </div>
  );
};

export default TextViewer;
