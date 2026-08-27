import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <p
                className="status-message status-message--neutral loading-message"
                role="status"
            >
                Loading your profile...
            </p>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}