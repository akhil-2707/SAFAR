import React from 'react';
import { AlertTriangle, RefreshCw, Home, Shield } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto my-12 p-6 sm:p-10 bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-red-200 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              S.A.F.A.R. Runtime Safety Shield Active
            </span>
            <h2 className="text-2xl font-black text-gray-900">
              Page Rendering Recovered Safely
            </h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              An unexpected display exception was caught and isolated to prevent a complete application crash. Your tourist credentials and session remain active.
            </p>
          </div>

          {this.state.error && (
            <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-left overflow-x-auto text-xs font-mono text-red-800 max-h-36">
              <strong>Error:</strong> {this.state.error.toString()}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 flex items-center space-x-2 shadow-md transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Current Page</span>
            </button>

            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center space-x-2 transition-all shadow-sm"
            >
              <Home className="w-4 h-4 text-violet-600" />
              <span>Return to Safety Overview</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
