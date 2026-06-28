import React from "react";
import { Link } from "react-router-dom";
import Style from "./style.module.css";

export default function Title() {
  return (
    <Link className={`${Style.banner} `} to={`/`}>
      <h1>{import.meta.env.VITE_TITLE || "Proj Connect"}</h1>
    </Link>
  );
}
