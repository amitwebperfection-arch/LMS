import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('UI Crash:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center text-red-500">
          Something went wrong 😵
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
