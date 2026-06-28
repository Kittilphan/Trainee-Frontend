import React from "react";

const AuthContext = React.createContext({
  isLoading: true,
  userId: null,
  userName: null,
  userRoles: null,
  userState: null,
  userTeam: null,
  setLoggedIn: () => {},
});

export default AuthContext;
