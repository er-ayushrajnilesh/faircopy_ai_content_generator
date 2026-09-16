import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Generator from "./pages/Generator";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<Generator />} />
      </Routes>
    </BrowserRouter>
  );
}
