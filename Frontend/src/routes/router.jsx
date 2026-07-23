import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import SignIn from "../pages/Login/signIn";
import SignUp from "../pages/Login/signUp";
import ForgotPassword from "../pages/Login/forgot";
import { ProtectedRoute, PublicRoute } from "./routeGuards";
import Dashboard from "../pages/Deshbord";
import AllMedicines from "../pages/madicin/allmadicin";
import AddMedicineModal from "../pages/madicin/addMadicin";
import AddPationt from "../pages/pationt/AddPationt";
import AllPationt from "../pages/pationt/AllPationt";

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
            <Route
                path="/forgot-password"
                element={
                    <PublicRoute>
                        <ForgotPassword />
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
            <Route
                path="/allmadicin"
                element={
                    <ProtectedRoute>
                        <AllMedicines />
                    </ProtectedRoute>
                } />

            <Route
                path="/addmadicin"
                element={
                    <ProtectedRoute>
                        <AddMedicineModal />
                    </ProtectedRoute>
                } />

            <Route
                path="/add-pationt"
                element={
                    <ProtectedRoute>
                        <AddPationt />
                    </ProtectedRoute>
                } />
            <Route
                path="/all-pationt"
                element={
                    <ProtectedRoute>
                        <AllPationt />
                    </ProtectedRoute>
                } />
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}