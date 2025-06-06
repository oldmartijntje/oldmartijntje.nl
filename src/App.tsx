// App.js
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { useKonamiDebug } from './helpers/konamiDebug';

import Sidebar from './components/sidebar/Sidebar';
import Homepage from './pages/homepage/Homepage';
import { NotFoundPage } from './pages/404/404';
import ApiTestComponent from './pages/apiTesterPage/ApiTestingPage';
import RegistrationCodeManager from './pages/BackendDataEditorPages/registrationCodePage';
import DisplayItemsManager from './pages/BackendDataEditorPages/displayItemsEditorPage';
import { PrivateRoute, LayeredRoute } from './components/privateRoute/PrivateRoute';
import UserPage from './pages/userPage/UserPage';
import ServerConnector from './services/ServerConnector';
import { allEvents } from './services/EventsSystem';
import './App.css';
import SignupPage from './pages/loginPage/SignupPage';
import ConsoleApp from './pages/easterEggs/ConsoleApp';
import ProjectDataManager from './pages/BackendDataEditorPages/projectDataManagerPage';
import Events from './pages/events/Events';

interface RouteData {
    path: string;
    element: any;
    isPrivate: boolean;
    clearanceLevelNeeded?: number;
    extraData?: any;
}

const randomnessSeed = Math.random() * 10000

const App: React.FC = () => {
    const [isEventActive, setEventStatus] = useState(false);

    const serverConnector = new ServerConnector();
    serverConnector.fetchData('https://api.oldmartijntje.nl/projectData/getProjectData', 'POST', JSON.stringify({
        "from": 0,
        "amount": 5,
        projectId: "Event"
    }), (response: any) => {
        if (response.status === 200) {
            if (response.projectData.length > 1) {
                setEventStatus(true);
            } else {
                setEventStatus(false);
            }

        }
    }, (error: any) => {
        console.log(error);
    });


    useKonamiDebug();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [clearanceLevel, setClearanceLevel] = useState(0);
    const [userProfile, setUserProfile] = useState({});

    useEffect(() => {
        allEvents.on('logout', this, () => {
            console.log('Logging out');
            setIsAuthenticated(false);
            setClearanceLevel(0);
            setUserProfile({});
        });
        const serverConnector = new ServerConnector();
        const savedData = ServerConnector.getUserData();

        if (savedData && savedData.username && savedData.sessionToken) {
            serverConnector.loginRequest(savedData.username, savedData.sessionToken, false, (data: any) => {
                if (data.status === 200) {
                    data.data.sessionToken = savedData.sessionToken;
                    setIsAuthenticated(true);
                    setClearanceLevel(data.data.clearanceLevel);
                    setUserProfile(data.data);
                } else {
                    setIsAuthenticated(false);
                    setClearanceLevel(0);
                    setUserProfile({});
                    savedData.sessionToken = undefined;
                    localStorage.setItem('UserLogin', JSON.stringify(savedData));
                }
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
        { path: '/', element: Homepage, isPrivate: false, extraData: { title: 'Home', randomnessSeed: randomnessSeed } },
        { path: '/discovery', element: Homepage, isPrivate: false, extraData: { title: 'Discovery', randomnessSeed: randomnessSeed } },
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
        {
            path: '/api/DisplayItems',
            element: DisplayItemsManager,
            isPrivate: true,
            clearanceLevelNeeded: 5
        },
        {
            path: '/api/projectDataManager',
            element: ProjectDataManager,
            isPrivate: true,
            clearanceLevelNeeded: 5
        },
        {
            path: "signup",
            element: SignupPage,
            isPrivate: false
        },
        {
            path: "console",
            element: ConsoleApp,
            isPrivate: false
        },
        {
            path: "events",
            element: Events,
            isPrivate: false
        },
        { path: '*', element: NotFoundPage, isPrivate: false },
    ];

    return (
        <Router>
            <div className="app-container">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} userProfile={userProfile} isEventActive={isEventActive}></Sidebar>
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
                                            data={route.extraData}
                                        />
                                    }
                                />
                            ) : (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={<LayeredRoute element={route.element} userProfile={userProfile} data={route.extraData} />}
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
