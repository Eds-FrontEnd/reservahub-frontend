import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./contexts/AutContext.tsx";
import { CartProvider } from "./contexts/CartContext";
import { DarkThemeProvider } from "./contexts/DarkThemeContext";
import { LoadingProvider } from "./contexts/LoadingContext";

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <DarkThemeProvider>
        <LoadingProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </LoadingProvider>
      </DarkThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
