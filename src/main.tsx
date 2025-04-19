import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
	createRoot(rootElement).render(<App />);
}
