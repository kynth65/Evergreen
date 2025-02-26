import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

export default function GuestLayout() {
  const { token, user } = useStateContext();

  // If user is already logged in, redirect them to their role-specific dashboard
  if (token) {
    if (user && user.role) {
      // Redirect based on user role
      return <Navigate to={`/${user.role}`} />;
    }
    // Default fallback if role is not available but user is authenticated
    return <Navigate to="/agent" />;
  }

  // If not logged in, show the guest layout
  return (
    <div>
      <Outlet />
    </div>
  );
}
