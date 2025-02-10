import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

export default function GuestLayout() {
    const { token } = useStateContext();

    return (
        <div>
            <Outlet />
        </div>
    );
}
