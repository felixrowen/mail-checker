const storagePrefix = "verimail_";

const storage = {
  getAuthToken: () => {
    const token = window.localStorage.getItem(`${storagePrefix}auth-token`);
    return token ? JSON.parse(token) : null;
  },
  setAuthToken: (token: string) => {
    window.localStorage.setItem(
      `${storagePrefix}auth-token`,
      JSON.stringify(token)
    );
  },
  clearAllToken: () => {
    window.localStorage.removeItem(`${storagePrefix}auth-token`);
  },
  getCurrentUser: () => {
    const userStr = window.localStorage.getItem(`${storagePrefix}current-user`);
    return userStr ? JSON.parse(userStr) : null;
  },
  setCurrentUser: (user: object) => {
    window.localStorage.setItem(
      `${storagePrefix}current-user`,
      JSON.stringify(user)
    );
  },
  clearCurrentUser: () => {
    window.localStorage.removeItem(`${storagePrefix}current-user`);
  },
};

export default storage;
