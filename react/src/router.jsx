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
import LandManagement from "./components/Land/LandManagement";
import LandAddForm from "./components/Land/LandAddForm";
import LandEditForm from "./components/Land/LandEditForm";
import LandView from "./components/Land/LandView";
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
      {
        path: "land-management",
        element: <LandManagement role="superadmin" />,
        children: [
          {
            path: "new",
            element: <LandAddForm role="superadmin" />,
          },
          {
            path: ":id/edit",
            element: <LandEditForm role="superadmin" />,
          },
          {
            path: ":id",
            element: <LandView role="superadmin" />,
          },
        ],
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
      // Use the same shared land management components for admin
      {
        path: "land-management",
        element: <LandManagement role="admin" />,
        children: [
          {
            path: "new",
            element: <LandAddForm role="admin" />,
          },
          {
            path: ":id/edit",
            element: <LandEditForm role="admin" />,
          },
          {
            path: ":id",
            element: <LandView role="admin" />,
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
