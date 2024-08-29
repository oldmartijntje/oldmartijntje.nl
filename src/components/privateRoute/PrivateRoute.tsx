// PrivateRoute.tsx
import React from 'react';
import LoginPage from '../../pages/loginPage/LoginPage';
import { UnauthorizedPage } from '../../pages/homepage/404/404';

interface PrivateRouteProps {
    element: React.ComponentType;  // Use React.ComponentType to accept any React component
    isAuthenticated: boolean;
    clearanceLevel: number;
    clearanceLevelNeeded: number;
    handleLoginFunction: () => void;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element: Component, isAuthenticated, clearanceLevel, clearanceLevelNeeded, handleLoginFunction }) => {
    if (!isAuthenticated) {
        return <LoginPage handleFunction={handleLoginFunction} />;
    } else if (clearanceLevelNeeded != null && clearanceLevel != null && clearanceLevel >= clearanceLevelNeeded) {
        return <Component />
    } else {
        return <UnauthorizedPage clearanceLevel={(clearanceLevel)} />
    }
};

export default PrivateRoute;
