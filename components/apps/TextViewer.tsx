import React, { useState } from 'react';
import { FileNode } from '../../types';
import { isTrailLocateFileId, trailAnswersMatch } from '../../services/trailScramble';

export interface TrailScramble {
  scrambled: [string, string, string];
  answers: [string, string, string];
  solved: boolean;
  reveal: string;
  onSolve: () => void;
}

interface TextViewerProps {
  file: FileNode;
  onUnlocked?: (file: FileNode) => void;
  onRead?: (file: FileNode) => void;
  trail?: TrailScramble;
}

const TrailUnscramble: React.FC<{ trail: TrailScramble }> = ({ trail }) => {
  const [words, setWords] = useState<string[]>(['', '', '']);
  const [failed, setFailed] = useState(false);

  if (trail.solved) {
    return (
      <div className="mt-4 border border-cyan-700 bg-cyan-950/20 rounded p-3 whitespace-pre-wrap">
        <p className="text-xs text-cyan-300 mb-2">MARGIN WORDS ACCEPTED</p>
        <p className="text-sm text-cyan-200">{trail.reveal}</p>
      </div>
    );
  }

  const submit = () => {
    if (trailAnswersMatch(trail.answers, words)) {
      trail.onSolve();
    } else {
      setFailed(true);
    }
  };

  return (
    <div className="mt-4 border border-purple-500/30 bg-purple-950/20 rounded p-3">
      <p className="text-xs text-purple-300 mb-2">UNSCRAMBLE THE MARGIN WORDS</p>
      <div className="flex flex-col gap-2">
        {trail.scrambled.map((scrambled, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-28 shrink-0 text-sm tracking-[0.2em] text-amber-200">
              {i + 1}. {scrambled}
            </span>
            <input
              value={words[i] ?? ''}
              onChange={e => {
                const next = [...words];
                next[i] = e.target.value;
                setWords(next);
                setFailed(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') submit();
              }}
              placeholder={`word ${i + 1}`}
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white outline-none focus:border-purple-500"
            />
          </div>
        ))}
      </div>
      <button
        onClick={submit}
        className="mt-3 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
      >
        UNSCRAMBLE
      </button>
      {failed && <p className="text-xs text-red-400 mt-2">Wrong words. Check the letter order.</p>}
    </div>
  );
};

const TextViewer: React.FC<TextViewerProps> = ({ file, onUnlocked, onRead, trail }) => {
  const [attempt, setAttempt] = useState('');
  const [failed, setFailed] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const locked = !!file.password && !unlocked;
  const showTrail = isTrailLocateFileId(file.id) && trail !== undefined;

  React.useEffect(() => {
    onRead?.(file);
  }, [file, onRead]);

  if (!locked) {
    return (
      <div className="h-full flex flex-col bg-gray-950 text-gray-300 font-mono text-sm">
        <div className="p-4 flex-1 overflow-y-auto whitespace-pre-wrap selection:bg-blue-500/30">
          {file.content}
          {showTrail && trail && <TrailUnscramble key={file.id} trail={trail} />}
        </div>
        <div className="p-2 border-t border-gray-800 text-xs text-gray-600 bg-gray-900">
          Line 1, Col 1 &nbsp;|&nbsp; UTF-8 &nbsp;|&nbsp; {file.name}.{file.extension}
        </div>
      </div>
    );
  }

  const submit = () => {
    if (unlocked) return;
    if (attempt.trim().toUpperCase() === file.password?.toUpperCase()) {
      setUnlocked(true);
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
              placeholder="path part"
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
