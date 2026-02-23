import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { EventProvider } from "./context/EventContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <EventProvider>
      <App />
    </EventProvider>
  </BrowserRouter>
);
