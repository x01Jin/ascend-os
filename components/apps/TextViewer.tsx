import React from 'react';
import { FileNode } from '../../types';

interface TextViewerProps {
  file: FileNode;
}

const TextViewer: React.FC<TextViewerProps> = ({ file }) => {
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
};

export default TextViewer;
