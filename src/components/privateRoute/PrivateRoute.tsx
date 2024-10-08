// PrivateRoute.tsx
import React from 'react';
import LoginPage from '../../pages/loginPage/LoginPage';
import { UnauthorizedPage } from '../../pages/404/404';

interface PrivateRouteProps {
    element: any;  // Use React.ComponentType to accept any React component
    isAuthenticated: boolean;
    clearanceLevel: number;
    clearanceLevelNeeded: number;
    handleLoginFunction: () => void;
    userProfile?: any;
    data?: any;
}

interface LayeredRouteProps {
    element: any;  // Use React.ComponentType to accept any React component
    userProfile?: any;
    data?: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element: Component, isAuthenticated, clearanceLevel, clearanceLevelNeeded, handleLoginFunction, userProfile, data }) => {
    if (!isAuthenticated) {
        return <LoginPage handleFunction={handleLoginFunction} />;
    } else if (clearanceLevelNeeded != null && clearanceLevel != null && clearanceLevel >= clearanceLevelNeeded) {
        return <Component userProfile={userProfile} data={data} />
    } else {
        return <UnauthorizedPage clearanceLevel={(clearanceLevel)} />
    }
};

const LayeredRoute: React.FC<LayeredRouteProps> = ({ element: Component, userProfile, data }) => {
    return <Component userProfile={userProfile} data={data} />
};

export { PrivateRoute, LayeredRoute };
