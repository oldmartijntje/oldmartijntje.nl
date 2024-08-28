// PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    element: React.ComponentType;  // Use React.ComponentType to accept any React component
    isAuthenticated: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element: Component, isAuthenticated }) => {
    return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
