"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../AxiosInstance/AxiosInstance';

// create authContext
const AuthContext = createContext(null);

// create custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider 
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // set token from localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
    }, [token]);


    useEffect(() => {
        const loadUser = async () => {
            if (token && !user) {
                try {
                    setLoading(true);

                    const tokenData = JSON.parse(atob(token.split('.')[1])); // JWT decode
                    const userId = tokenData.id;
                    
                    const response = await axiosInstance.get(`/users/${userId}`);
                    setUser(response.data.data);
                } catch (error) {
                    console.error('Failed to load user:', error);
                    if (error.response?.status === 401) {
                        signout();
                        toast.error('Session expired. Please login again.');
                    }
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        loadUser();
    }, [token]); 

    // sign up
    const signup = async (userData) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/users/signup', userData);
            
            if (response.data.success) {
                setToken(response.data.token);
                setUser(response.data.user);
                toast.success('Account created successfully!');
                return { success: true, data: response.data };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Signup failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // sign in
    const signin = async (credentials) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/users/signin', credentials);
            
            if (response.data.success) {
                setToken(response.data.token);
                setUser(response.data.user);
                toast.success('Logged in successfully!');
                return { success: true, data: response.data };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid email or password';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // sign out 
    const signout = async () => {
        try {
            // optional: backend  signout request 
            // await axiosInstance.post('/users/signout');
        } finally {
            setToken(null);
            setUser(null);
            toast.success('Logged out successfully');
        }
    };


    const updateUser = async (userId, data) => {
        try {
            setLoading(true);
            const response = await axiosInstance.patch(`/users/${userId}`, data);
            
            if (response.data.success) {

                if (user?.id === userId) {
                    setUser(prev => ({ ...prev, ...response.data.data }));
                }
                toast.success('User updated successfully');
                return { success: true, data: response.data };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Update failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };


    const uploadProfilePicture = async (file) => {
        try {
            const formData = new FormData();
            formData.append('profile_picture', file);

            const response = await axiosInstance.patch('/users/profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setUser(prev => ({ ...prev, ...response.data.data }));
                toast.success('Profile picture updated');
                return { success: true, data: response.data };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Upload failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };


    const deleteProfilePicture = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.delete('/users/profile-picture');
            
            if (response.data.success) {
                setUser(prev => ({ ...prev, profile_picture: null, profile_picture_url: null }));
                toast.success('Profile picture deleted');
                return { success: true, data: response.data };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Delete failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };


    const deleteUser = async (userId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.delete(`/users/${userId}`);
            
            if (response.data.success) {

                if (user?.id === userId) {
                    signout();
                }
                toast.success('User deleted successfully');
                return { success: true, data: response.data };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Delete failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };


    const getUserById = async (userId) => {
        try {
            const response = await axiosInstance.get(`/users/${userId}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch user';
            toast.error(message);
            return { success: false, error: message };
        }
    };


    const getUserByEmail = async (email) => {
        try {
            const response = await axiosInstance.get(`/users/email/${email}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch user';
            toast.error(message);
            return { success: false, error: message };
        }
    };


    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get('/users');
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch users';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // values
    const value = {
        user,
        loading,
        token,
        isAuthenticated: !!user,
        
        // auth functions
        signup,
        signin,
        signout,
        
        // user management
        updateUser,
        deleteUser,
        getUserById,
        getUserByEmail,
        getAllUsers,
        
        // profile picture
        uploadProfilePicture,
        deleteProfilePicture,
        
        // helper
        refreshUser: async () => {
            if (user?.id) {
                try {
                    const response = await axiosInstance.get(`/users/${user.id}`);
                    setUser(response.data.data);
                } catch (error) {
                    console.error('Refresh failed:', error);
                }
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;