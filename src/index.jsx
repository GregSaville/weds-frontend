import ReactDOM from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./i18n";
import { ToastProvider } from "./componets/ToastProvider";

const container = document.getElementById("root");


if (!container) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(container);

function Root() {
  return (
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter>
          <ToastProvider>
              <App />
          </ToastProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

root.render(<Root />);
