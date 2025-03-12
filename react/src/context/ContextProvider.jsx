import { createContext, useContext, useState } from "react";

const StateContext = createContext({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
});

export const ContextProvider = ({ children }) => {
  // Change TOKEN to ACCESS_TOKEN to match your axios client
  const [token, _setToken] = useState(
    localStorage.getItem("ACCESS_TOKEN") || null
  );

  const [user, _setUser] = useState(() => {
    const savedUser = localStorage.getItem("USER");
    try {
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      console.log("Initial user from localStorage:", parsedUser);
      return parsedUser;
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
      return null;
    }
  });

  const setUser = (user) => {
    console.log("Setting user in context:", user);

    // Special case for logout
    if (
      user === null ||
      (typeof user === "object" && Object.keys(user).length === 0)
    ) {
      console.log("Logout detected, clearing user");
      _setUser(null);
      localStorage.removeItem("USER");
      return;
    }

    // Validate user has role for other cases
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
      localStorage.setItem("ACCESS_TOKEN", token); // Changed to ACCESS_TOKEN
    } else {
      localStorage.removeItem("ACCESS_TOKEN"); // Changed to ACCESS_TOKEN
    }
  };

  return (
    <StateContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
        // Expose internal setters for logout
        _setUser,
        _setToken,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
