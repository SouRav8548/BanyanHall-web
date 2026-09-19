import { Routes, Route } from 'react-router-dom';
// Ekhane amra .jsx extension add korechi jate Vite shohoje file khunje pay
import Home from './Home.jsx'; 
import Dashboard from './Dashboard.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;