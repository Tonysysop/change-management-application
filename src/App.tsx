import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
// import Dashboard from './pages/Dashboard' // Assuming you have this component

function App() {
  return (
    <BrowserRouter>
      <Routes >
        
        <Route path="/" element={<Login />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
