import { createBrowserRouter, Navigate } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayouts";
import Homepage from "./pages/Homepage";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import SellYourLand from "./pages/SellYourLand";
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
// Import the reusable components
import LotList from "./components/Lot/LotList";
import LotForm from "./components/Lot/LotForm";
import LotView from "./components/Lot/LotView";
import Register from "./pages/Register";
import RFSForm from "./components/ResidentialSheet/RFSForm";
import OCSCalculator from "./components/OCSCalculator/OCSCalculator";
import FileManagerList from "./components/FileManager/FileManagerList";

import ClientPaymentList from "./components/ClientPayment/ClientPaymentList";
import ClientPaymentAddForm from "./components/ClientPayment/ClientPaymentAddForm";
import ClientPaymentEditForm from "./components/ClientPayment/ClientPaymentEditForm";
import ClientPaymentDetails from "./components/ClientPayment/ClientPaymentDetails";

import ClientLayout from "./layouts/ClientLayout";
import ClientDashboard from "./pages/Client/ClientDashboard";
import UserClientPaymentList from "./components/PaymentList/UserClientPaymentList";
import ClientAvailableLand from "./pages/Client/AvailableLand";
import ClientLandView from "./pages/Client/ClientLandView";

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
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/verify-code",
        element: <VerifyCode />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/sell-your-land",
        element: <SellYourLand />,
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
      {
        path: "register",
        element: <Register />,
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
      // Lot management for superadmin
      {
        path: "lot-management",
        element: <LotList role="superadmin" />,
        children: [
          {
            path: "new",
            element: <LotForm role="superadmin" />,
          },
          {
            path: ":id/edit",
            element: <LotForm role="superadmin" />,
          },
          {
            path: ":id/view",
            element: <LotView role="superadmin" />,
          },
        ],
      },
      {
        path: "residential-form",
        element: <RFSForm />,
      },
      {
        path: "ocs-calculator",
        element: <OCSCalculator />,
      },
      {
        path: "file-manager-list",
        element: <FileManagerList />,
      },

      {
        path: "client-payment",
        element: <ClientPaymentList />,
      },
      {
        path: "client-payment/new",
        element: <ClientPaymentAddForm />,
      },
      {
        path: "client-payment/:id/edit",
        element: <ClientPaymentEditForm />,
      },
      {
        path: "lot-management/:id/view",
        element: <LotView role="client" />,
      },
      {
        path: "client-payment/:id/view",
        element: <ClientPaymentDetails />,
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
      // Land management for admin
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
      // Lot management for admin
      {
        path: "lot-management",
        element: <LotList role="admin" />,
        children: [
          {
            path: "new",
            element: <LotForm role="admin" />,
          },
          {
            path: ":id/edit",
            element: <LotForm role="admin" />,
          },
          {
            path: ":id/view",
            element: <LotView role="admin" />,
          },
        ],
      },
      {
        path: "residential-form",
        element: <RFSForm />,
      },
      {
        path: "ocs-calculator",
        element: <OCSCalculator />,
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
      // Land management for agent
      {
        path: "land-management",
        element: <LandManagement role="agent" />,
        children: [
          {
            path: "new",
            element: <LandAddForm role="agent" />,
          },
          {
            path: ":id/edit",
            element: <LandEditForm role="agent" />,
          },
          {
            path: ":id",
            element: <LandView role="agent" />,
          },
        ],
      },

      // Lot management for agent
      {
        path: "lot-management",
        element: <LotList role="agent" />,
        children: [
          {
            path: "new",
            element: <LotForm role="agent" />,
          },
          {
            path: ":id/edit",
            element: <LotForm role="agent" />,
          },
          {
            path: ":id/view",
            element: <LotView role="agent" />,
          },
        ],
      },
      {
        path: "residential-form",
        element: <RFSForm />,
      },
      {
        path: "ocs-calculator",
        element: <OCSCalculator />,
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
      // Land management for intern
      {
        path: "land-management",
        element: <LandManagement role="intern" />,
        children: [
          {
            path: "new",
            element: <LandAddForm role="intern" />,
          },
          {
            path: ":id/edit",
            element: <LandEditForm role="intern" />,
          },
          {
            path: ":id",
            element: <LandView role="intern" />,
          },
        ],
      },
      // Lot management for intern
      {
        path: "lot-management",
        element: <LotList role="intern" />,
        children: [
          {
            path: "new",
            element: <LotForm role="intern" />,
          },
          {
            path: ":id/edit",
            element: <LotForm role="intern" />,
          },
          {
            path: ":id/view",
            element: <LotView role="intern" />,
          },
        ],
      },
      {
        path: "residential-form",
        element: <RFSForm />,
      },
      {
        path: "ocs-calculator",
        element: <OCSCalculator />,
      },
    ],
  },

  {
    path: "/client",
    element: <ClientLayout />,
    children: [
      {
        path: "",
        element: <ClientDashboard />,
      },
      {
        path: "payment-list",
        element: <UserClientPaymentList />,
      },
      {
        path: "available-lands",
        element: <ClientAvailableLand />,
      },
      {
        path: "available-lands/:id",
        element: <ClientLandView />,
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
