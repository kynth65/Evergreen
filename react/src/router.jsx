import { createBrowserRouter, Navigate } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayouts";
import Homepage from "./pages/Homepage";
const router = createBrowserRouter([
    {
        path: "/",
        element: <GuestLayout />,
        children: [
            {
                path: "",
                element: <Homepage />,
            },
        ],
    },
]);

export default router;
