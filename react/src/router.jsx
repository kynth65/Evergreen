import { createBrowserRouter, Navigate } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayouts";
import Homepage from "./pages/Homepage";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";
import About from "./pages/About";
import AgentLayout from "./layouts/AgentLayout";
import AgentDashboard from "./pages/Agent/AgentDashboard";
import Profile from "./pages/Profile";
import LandCollection from "./pages/Land/LandCollection";
import LandDetail from "./pages/Land/LandDetail";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SuperAdminDashboard from "./pages/SuperAdminLayout.jsx/SuperAdminDashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import TaskManagement from "./pages/Admin/AdminTaskManagement";
import AdminLandManagement from "./pages/Admin/AdminLandManagement";
import AdminEditLand from "./components/admin/AdminEditLand";
import AdminViewLand from "./components/admin/AdminViewLand";
import AdminAddLand from "./components/admin/AdminAddLand";
import InternLayout from "./layouts/InternLayout";
import InternDashboard from "./pages/Intern/InternDashboard";
import SuperAdminAccountManagement from "./pages/SuperAdminLayout.jsx/SuperAdminAccountManagement";
import NotFound from "./404/NotFound";
import InternTask from "./pages/Intern/InternTask";
import AdminLotList from "./pages/Admin/AdminLotList";
import AdminLotForm from "./components/admin/AdminLotForm";
import AdminLotView from "./components/admin/AdminLotView";

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
        path: "/about",
        element: <About />,
      },
      {
        path: "/lands",
        element: <LandCollection />,
      },
      {
        path: "/lands/:id",
        element: <LandDetail />,
      },
      {
        path: "contact",
        element: <ContactUs />,
      },
    ],
  },
  {
    path: "/superadmin",
    element: <SuperAdminLayout />,
    children: [
      {
        path: "",
        element: <SuperAdminDashboard />,
      },
      {
        path: "AccountManagement",
        element: <SuperAdminAccountManagement />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "",
        element: <AdminDashboard />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "tasks-management",
        element: <TaskManagement />,
      },
      {
        path: "land-management",
        element: <AdminLandManagement />,
        children: [
          {
            path: "new",
            element: <AdminAddLand />,
          },
          {
            path: ":id/edit",
            element: <AdminEditLand />,
          },
          {
            path: ":id",
            element: <AdminViewLand />,
          },
        ],
      },
      {
        path: "lot-management",
        element: <AdminLotList />,
        children: [
          {
            path: "new",
            element: <AdminLotForm />,
          },
          {
            path: ":id/edit",
            element: <AdminLotForm />,
          },
          {
            path: ":id/view",
            element: <AdminLotView />,
          },
        ],
      },
    ],
  },
  {
    path: "/agent",
    element: <AgentLayout />,
    children: [
      {
        path: "",
        element: <AgentDashboard />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/intern",
    element: <InternLayout />,
    children: [
      {
        path: "",
        element: <InternDashboard />,
      },
      {
        path: "tasks",
        element: <InternTask />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
