import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  fullname: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // Add user state
  login: (userData: User) => void; // Modify to accept user data
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null); // User state

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token) {
      setIsAuthenticated(true);
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Set user from localStorage
      }
    }
  }, []);

  const login = (userData: User): void => {
    setIsAuthenticated(true);
    setUser(userData); // Set user details
    localStorage.setItem('token', 'your-token'); // Store token
    localStorage.setItem('user', JSON.stringify(userData)); // Store user details
  };

  const logout = (): void => {
    setIsAuthenticated(false);
    setUser(null); // Clear user details
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Clear user details from localStorage
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
