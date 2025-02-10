import { createContext, useContext, useState } from "react";

const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => {},
    setToken: () => {},
});

export const ContextProvider = ({ children }) => {
    // Add safe parsing with fallback to null
    const [token, _setToken] = useState(localStorage.getItem("TOKEN") || null);
    const [user, _setUser] = useState(() => {
        const savedUser = localStorage.getItem("USER");
        try {
            const parsedUser = savedUser ? JSON.parse(savedUser) : null;
            return parsedUser;
        } catch (e) {
            console.error("Failed to parse user from localStorage:", e);
            return null;
        }
    });

    const setUser = (user) => {
        console.log("Setting user in context:", user);
        if (user && !user.role) {
            console.error("Attempting to set user without role:", user);
            return;
        }
        _setUser(user);
        if (user) {
            localStorage.setItem("USER", JSON.stringify(user));
        } else {
            localStorage.removeItem("USER");
        }
    };

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("TOKEN", token);
        } else {
            localStorage.removeItem("TOKEN");
        }
    };

    return (
        <StateContext.Provider
            value={{
                user,
                token,
                setUser,
                setToken,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
