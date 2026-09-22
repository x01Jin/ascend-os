import React from 'react';
import { factoryReset } from '../../services/storage';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error('Uncaught render error', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleReset = (): void => {
    try {
      factoryReset();
    } finally {
      window.location.reload();
    }
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="w-full h-screen bg-gray-950 text-gray-300 font-mono text-sm p-4 sm:p-10 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 font-bold">SYSTEM FAULT — desktop process crashed.</p>
        <p className="text-xs text-gray-500 max-w-md text-center">
          Your save is untouched. Reload to retry, or factory reset if the crash repeats on every
          load.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={this.handleReload}
            className="px-3 py-1 rounded text-xs border bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-3 py-1 rounded text-xs border bg-red-900 text-white border-red-600 hover:bg-red-800"
          >
            Factory reset
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
