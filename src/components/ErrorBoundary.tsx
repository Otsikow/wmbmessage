import * as React from "react";
import { Component, ErrorInfo, ReactNode } from "react";
import { ErrorFallback } from "./ErrorFallback";

export type FallbackRender = (fallbackProps: {
  error?: Error;
  reset: () => void;
}) => ReactNode;

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Optional custom fallback UI. When provided it will be rendered instead of
   * the default message when an error is caught.
   */
  fallback?: ReactNode | FallbackRender;
  /**
   * Optional callback invoked when the boundary is reset via the "Try again"
   * button.
   */
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: undefined,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Surface the error in development so it is still visible in the console.
    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (typeof fallback === "function") {
      return (fallback as FallbackRender)({
        error,
        reset: this.handleReset,
      });
    }

    if (fallback) {
      return fallback;
    }

    // Default to the new ErrorFallback component
    return (
      <ErrorFallback
        error={error}
        resetErrorBoundary={this.handleReset}
        title="Something went wrong"
        description="An unexpected error occurred while rendering this page. Please try again or reload the application."
      />
    );
  }
}

export default ErrorBoundary;
