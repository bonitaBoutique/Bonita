import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from './withRouter';

class ErrorBoundary extends Component {
  state = { 
    hasError: false,
    error: null 
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Algo salió mal
            </h2>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                this.props.navigate('/');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  navigate: PropTypes.func.isRequired
};

const EnhancedErrorBoundary = withRouter(ErrorBoundary);
export default EnhancedErrorBoundary;