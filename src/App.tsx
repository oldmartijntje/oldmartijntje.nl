// App.js
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import Sidebar from './components/sidebar/Sidebar';
import Homepage from './pages/homepage/Homepage';
import { NotFoundPage } from './pages/homepage/404/404';
import ApiTestComponent from './pages/apiTesterPage/ApiTestingPage';
import PrivateRoute from './components/privateRoute/PrivateRoute';
import UserPage from './pages/userPage/UserPage';
import ServerConnector from './services/ServerConnector';
import { allEvents } from './services/EventsSystem';
import './App.css';

const App: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [clearanceLevel, setClearanceLevel] = useState(0);
    const [userProfile, setUserProfile] = useState({});

    useEffect(() => {
        allEvents.on('logout', this, () => {
            setIsAuthenticated(false);
            setClearanceLevel(0);
            setUserProfile({});
        });
        const serverConnector = new ServerConnector();
        const savedData = ServerConnector.getUserData();

        if (savedData && savedData.username && savedData.sessionToken) {
            serverConnector.loginRequest(savedData.username, savedData.sessionToken, false, (data: any) => {
                console.log(data);
                setIsAuthenticated(true);
                setClearanceLevel(data.data.clearanceLevel);
                setUserProfile(data.data);
            }, (error: any) => {
                console.log(error);
            });
        }
    }, []); // Empty dependency array ensures this effect runs only once

    const onLogin = () => {
        console.log('Logged in');
        setIsAuthenticated(true);
        const savedData = ServerConnector.getUserData();
        setClearanceLevel(savedData.clearanceLevel);
        setUserProfile(savedData);
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <Router>
            <div className="app-container">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}></Sidebar>
                <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route
                            path="/api-test"
                            element={
                                <PrivateRoute
                                    key={`${isAuthenticated}-${clearanceLevel}`}  // Ensures re-render when auth status changes
                                    element={ApiTestComponent}
                                    isAuthenticated={isAuthenticated}
                                    clearanceLevel={clearanceLevel}
                                    clearanceLevelNeeded={6}
                                    handleLoginFunction={onLogin}
                                    userProfile={userProfile}
                                />
                            }
                        />
                        <Route
                            path="/user"
                            element={
                                <PrivateRoute
                                    key={`${isAuthenticated}-${clearanceLevel}`}  // Ensures re-render when auth status changes
                                    element={UserPage}
                                    isAuthenticated={isAuthenticated}
                                    clearanceLevel={clearanceLevel}
                                    clearanceLevelNeeded={0}
                                    handleLoginFunction={onLogin}
                                    userProfile={userProfile}
                                />
                            }
                        />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;