// src/Components/UserContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on initial load and when component mounts
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Fetch session info from the server
        const response = await fetch('http://localhost:3000/person/session', {
          method: 'GET',
          credentials: 'include', // Important for sending cookies
        });

        if (response.ok) {
          const sessionData = await response.json();
          console.log("Session data:", sessionData);
          
          // If we have a valid session with a personId, fetch the user details
          if (sessionData.personId) {
            const userResponse = await fetch(`http://localhost:3000/person/${sessionData.personId}`, {
              credentials: 'include'
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              console.log("User data from session:", userData);
              setUser(userData.payload || userData);
            }
          }
        } else {
          // No valid session
          console.log("No valid session found");
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  console.log("UserContext: Current user state:", user);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);