// App.js
import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import Homepage from './pages/homepage/Homepage';
import NotFoundPage from './pages/homepage/404/404';
import ApiTestComponent from './pages/apiTesterPage/ApiTestingPage';
import PrivateRoute from './components/privateRoute/PrivateRoute';
import UserPage from './pages/userPage/UserPage';
import LoginPage from './pages/loginPage/LoginPage';
import './App.css';

const App: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const isAuthenticated = false;

    return (
        <Router>
            <div className="app-container">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}></Sidebar>
                <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/api-test" element={<PrivateRoute element={ApiTestComponent} isAuthenticated={isAuthenticated} />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/user" element={<PrivateRoute element={UserPage} isAuthenticated={isAuthenticated} />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;