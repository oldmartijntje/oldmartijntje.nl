// PrivateRoute.tsx
import React from 'react';
import LoginPage from '../../pages/loginPage/LoginPage';

interface PrivateRouteProps {
    element: React.ComponentType;  // Use React.ComponentType to accept any React component
    isAuthenticated: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element: Component, isAuthenticated }) => {
    return isAuthenticated ? <Component /> : <LoginPage />;
};

export default PrivateRoute;
