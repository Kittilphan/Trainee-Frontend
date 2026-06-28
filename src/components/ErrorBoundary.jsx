import React from "react";
import ErrorPage from "./ErrorPage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.handleRetry = this.handleRetry.bind(this);
    this.handleBack = this.handleBack.bind(this);
    // this.state = { hasError: props?.error ? true : false, error: props?.error };
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError() {
    console.error(`ErrorBoundary getDerivedStateFromError()`);
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error(`ErrorBoundary componentDidCatch()`, error, errorInfo);
    this.setState({ error, errorInfo });
  }
  handleRetry() {
    window.location.reload();
  }
  handleBack() {
    window.history.back();
  }
  render() {
    console.error(`ErrorBoundary render()`, this.state);
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <ErrorPage error={this.state.error} />
          <br />
          <div className="d-flex gap-4">
            <button onClick={this.handleRetry}>Retry again</button>
            &nbsp;
            <button onClick={this.handleBack}>Back</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
