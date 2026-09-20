import { Routes, Route } from "react-router-dom";
// Ekhane amra .jsx extension add korechi jate Vite shohoje file khunje pay
import Home from "./Home.jsx";
import Dashboard from "./Dashboard.jsx";
import ResetPasswordPage from "./components/ResetPasswordPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}

export default App;
