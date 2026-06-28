import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import SpinLoading from "../../SpinLoading";
import Style from "./style.module.css";

export default function UserLogonButton() {
  const { user } = useAuth();
  if (!user) return <SpinLoading />;
  return (
    <>
      <div className={Style.container}>
        {user?.username && user?.roles && user.roles.indexOf("user") >= 0 && user?.isLoggedIn === true ? (
          <div className={Style.wrapper}>
            <div>
              <div className={Style.loggedon}>{user?.username || "unknown"}</div>
              <div className={Style.loggedonRoles}>{(user?.roles || []).join("/")}</div>
            </div>
            <Link className={Style.buttonLogout} to={`/user/logout`}>
              <div>Logout</div>
            </Link>
          </div>
        ) : (
          <Link className={Style.buttonLogin} to={`/user/login`}>
            Login
          </Link>
        )}
      </div>
    </>
  );
}
