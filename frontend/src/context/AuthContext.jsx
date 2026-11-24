import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('rentlo_token');
    const user = localStorage.getItem('rentlo_user');
    if (token && user) {
      dispatch({ type: 'LOGIN', payload: { token, user: JSON.parse(user) } });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = (user, token) => {
    localStorage.setItem('rentlo_token', token);
    localStorage.setItem('rentlo_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { user, token } });
  };

  const logout = () => {
    localStorage.removeItem('rentlo_token');
    localStorage.removeItem('rentlo_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates) => {
    const updated = { ...state.user, ...updates };
    localStorage.setItem('rentlo_user', JSON.stringify(updated));
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
