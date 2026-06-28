import React from "react";

import AuthContext from "./AuthContext";
import AuthController from "../controllers/Auth";
import SpinLoading from "../components/SpinLoading";

export default function AuthProvider({ children }) {
  let [isLoading, setLoading] = React.useState(true);
  let [authUser, setAuthUser] = React.useState({
    isLoggedIn: false,
    _id: null,
    username: null,
    roles: null,
    team: null,
  });
  React.useEffect(() => {
    AuthController.me()
      .then(async (me) => {
        if (!me || !me.username || !me.roles)
          throw new Error("invalid response");
        const { _id, username, roles, team } = me;
        setAuthUser({ _id, username, roles, team, isLoggedIn: true });
        if (roles && roles?.indexOf("admin") >= 0) {
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("ERROR", err);
        setLoading(false);
      });
    return;
  }, []);
  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userId: authUser?._id,
        userName: authUser?.username,
        userRoles: authUser?.roles,
        userTeam: authUser?.team,
        userState: authUser?.isLoggedIn,
        setLoggedIn: ({ username, roles, isLoggedIn }) => {
          setAuthUser({ username, roles, isLoggedIn });
        },
      }}
    >
      {isLoading === true ? <SpinLoading size="1rem" /> : children}
    </AuthContext.Provider>
  );
}
