import React from "react";
import ReactDOM from "react-dom/client";
import PropTypes from "prop-types";
import "./index.css";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import store from "./redux/store";
import { Provider } from "react-redux";
import { injectStore } from "./socketClient";
import App from "./App";
import ToastWrapper from "./ToastWrapper";

// Inject Redux store into socketClient to prevent circular dependency TDZ errors
injectStore(store);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: "#b91c1c", background: "#fef2f2", fontFamily: "monospace" }}>
          <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Runtime Error Caught:</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{this.state.error?.stack || this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
        <ToastWrapper />
      </ErrorBoundary>
    </QueryClientProvider>
  </Provider>
);
