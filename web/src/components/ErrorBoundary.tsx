"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Da xay ra loi</h2>
              <p className="text-text-secondary mb-4">Vui long tai lai trang</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="bg-accent-blue text-white px-4 py-2 rounded-lg text-sm"
              >
                Thu lai
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
