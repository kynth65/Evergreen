import { createBrowserRouter, Navigate } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayouts";
import Homepage from "./pages/Homepage";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import AgentLayout from "./layouts/AgentLayout";
import AgentDashboard from "./pages/Agent/AgentDashboard";
import Profile from "./pages/Profile";

const router = createBrowserRouter([
    {
        path: "/",
        element: <GuestLayout />,
        children: [
            {
                path: "",
                element: <Homepage />,
            },
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/signup",
                element: <Signup />,
            },
            {
                path: "/about",
                element: <About />,
            },
            {
                path: "contact",
                element: <ContactUs />,
            },
        ],
    },

    {
        path: "/agent",
        element: <AgentLayout />,
        children: [
            {
                path: "dashboard",
                element: <AgentDashboard />,
            },
            {
                path: "profile",
                element: <Profile />,
            },
        ],
    },
]);

export default router;
