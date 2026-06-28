import React from "react";
import useAuth from "../../hooks/useAuth";

export default function UserLogout() {
  const { userLogout } = useAuth();
  React.useEffect(() => {
    let timer = setTimeout(() => userLogout(), 300);
    return () => {
      clearTimeout(timer);
    };
  }, [userLogout]);
  return (
    <div>
      <div className={""}>
        <p className="text-center">Logging out ...</p>
        <div className={""}></div>
      </div>
    </div>
  );
}
