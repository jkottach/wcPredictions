import { useAuthStore } from '../context/authStore';

export const useAuth = () => {
  const { isLoggedIn, token, user, login, logout, setUser, authReady, initialize } =
    useAuthStore();

  return {
    isLoggedIn,
    token,
    user,
    login,
    logout,
    setUser,
    authReady,
    initialize,
  };
};
