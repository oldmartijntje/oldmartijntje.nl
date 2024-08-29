// App.js
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import Sidebar from './components/sidebar/Sidebar';
import Homepage from './pages/homepage/Homepage';
import { NotFoundPage } from './pages/404/404';
import ApiTestComponent from './pages/apiTesterPage/ApiTestingPage';
import RegistrationCodeManager from './pages/registrationCodePage/registrationCodePage';
import { PrivateRoute, LayeredRoute } from './components/privateRoute/PrivateRoute';
import UserPage from './pages/userPage/UserPage';
import ServerConnector from './services/ServerConnector';
import { allEvents } from './services/EventsSystem';
import './App.css';

interface RouteData {
    path: string;
    element: any;
    isPrivate: boolean;
    clearanceLevelNeeded?: number;
}


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
                data.data.sessionToken = savedData.sessionToken;
                setIsAuthenticated(true);
                setClearanceLevel(data.data.clearanceLevel);
                setUserProfile(data.data);
            }, (error: any) => {
                console.log(error);
            });
        }
    }, []); // Empty dependency array ensures this effect runs only once

    const onLogin = () => {
        setIsAuthenticated(true);
        const savedData = ServerConnector.getUserData();
        setClearanceLevel(savedData.clearanceLevel);
        setUserProfile(savedData);
        allEvents.emit('login', savedData);
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const routesData: RouteData[] = [
        { path: '/', element: Homepage, isPrivate: false },
        {
            path: '/api-test',
            element: ApiTestComponent,
            isPrivate: true,
            clearanceLevelNeeded: 6
        },
        {
            path: '/user',
            element: UserPage,
            isPrivate: true,
            clearanceLevelNeeded: 0
        },
        {
            path: '/registerCode',
            element: RegistrationCodeManager,
            isPrivate: true,
            clearanceLevelNeeded: 4
        },
        { path: '*', element: NotFoundPage, isPrivate: false },
    ];

    return (
        <Router>
            <div className="app-container">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}></Sidebar>
                <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                    <Routes>
                        {routesData.map((route, index) => (
                            route.isPrivate ? (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <PrivateRoute
                                            key={`${isAuthenticated}-${clearanceLevel}`}  // Ensures re-render when auth status changes
                                            element={route.element}
                                            isAuthenticated={isAuthenticated}
                                            clearanceLevel={clearanceLevel}
                                            clearanceLevelNeeded={route.clearanceLevelNeeded || 0}
                                            handleLoginFunction={onLogin}
                                            userProfile={userProfile}
                                        />
                                    }
                                />
                            ) : (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={<LayeredRoute element={route.element} userProfile={userProfile} />}
                                />
                            )
                        ))}
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
