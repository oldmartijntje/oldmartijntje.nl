// PrivateRoute.tsx
import React from 'react';
import LoginPage from '../../pages/loginPage/LoginPage';
import { UnauthorizedPage } from '../../pages/homepage/404/404';

interface PrivateRouteProps {
    element: any;  // Use React.ComponentType to accept any React component
    isAuthenticated: boolean;
    clearanceLevel: number;
    clearanceLevelNeeded: number;
    handleLoginFunction: () => void;
    userProfile?: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element: Component, isAuthenticated, clearanceLevel, clearanceLevelNeeded, handleLoginFunction, userProfile }) => {
    if (!isAuthenticated) {
        return <LoginPage handleFunction={handleLoginFunction} />;
    } else if (clearanceLevelNeeded != null && clearanceLevel != null && clearanceLevel >= clearanceLevelNeeded) {
        return <Component userProfile={userProfile} />
    } else {
        return <UnauthorizedPage clearanceLevel={(clearanceLevel)} />
    }
};

export default PrivateRoute;
