import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';
import type { User, LoginForm, RegisterForm } from '../types/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginForm) => Promise<void>;
    register: (userData: RegisterForm) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    useEffect(() => {
        // Check if user is already authenticated on app load
        const checkAuth = async () => {
            try {
                if (apiClient.isAuthenticated()) {
                    const response = await apiClient.getMe();
                    if (response.success) {
                        setUser(response.user);
                    } else {
                        // Token is invalid, clear it
                        apiClient.logout();
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                apiClient.logout();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (credentials: LoginForm) => {
        try {
            const response = await apiClient.login(credentials);
            if (response.success) {
                setUser(response.user);
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (userData: RegisterForm) => {
        try {
            const response = await apiClient.register(userData);
            if (response.success) {
                setUser(response.user);
            } else {
                throw new Error('Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        apiClient.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            if (apiClient.isAuthenticated()) {
                const response = await apiClient.getMe();
                if (response.success) {
                    setUser(response.user);
                }
            }
        } catch (error) {
            console.error('Refresh user failed:', error);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}