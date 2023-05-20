import React, { createContext, useState, useContext } from "react";

// Create a context
export const UserProfileContext = createContext();

// Create a provider that uses this context
export const UserProfileProvider = ({ children }) => {
  const [hasUserProfile, setHasUserProfile] = useState(false);

  // This value will be accessible to all components
  const value = { hasUserProfile, setHasUserProfile };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

// Create a hook that uses this context
export const useUserProfile = () => {
  return useContext(UserProfileContext);
};
