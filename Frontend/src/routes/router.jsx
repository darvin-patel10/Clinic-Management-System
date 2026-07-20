import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import SignIn from "../pages/Login/signIn";
import SignUp from "../pages/Login/signUp";
import { ProtectedRoute, PublicRoute } from "./routeGuards";
import Dashboard from "../pages/Deshbord";


export default function AppRoutes() {
    const location = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <Routes>
            {/* Public-only pages */}
            <Route
                path="/signin"
                element={
                    <PublicRoute>
                        <SignIn />
                    </PublicRoute>
                } />
            <Route
                path="/signup"
                element={
                    <PublicRoute>
                        <SignUp />
                    </PublicRoute>
                } />
            {/* Protected pages */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
    );
}