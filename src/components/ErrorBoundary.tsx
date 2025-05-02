import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Uncaught error:', error, errorInfo)
    }
    
    // Log to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service
      const errorData = {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
      
      // Send error to logging endpoint
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(() => {
        // Silently fail if error logging fails
      })
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-8">
              We're sorry, but something went wrong. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary