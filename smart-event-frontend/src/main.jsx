import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { EventProvider } from "./context/EventContext";
import { ToastProvider } from "./context/ToastContext";
import { StudentSessionProvider } from "./context/StudentSessionContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ToastProvider>
      <EventProvider>
        <StudentSessionProvider>
          <App />
        </StudentSessionProvider>
      </EventProvider>
    </ToastProvider>
  </BrowserRouter>
);
