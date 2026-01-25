import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";
import { ThemeProvider } from "../src/components/context/ThemeContext";
import { BrowserRouter } from "react-router-dom";
// Create React root and render the application

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
