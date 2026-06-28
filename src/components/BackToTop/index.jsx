import React from "react";
import Style from "./style.module.css";
import useScrollPosition from "../../hooks/useScrollPosition";

export default function BackToTop() {
  const { scrollPosition } = useScrollPosition();
  const handleClick = (e) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <button className={[Style.button, scrollPosition > 1 ? Style.active : ""].join(" ")} onClick={handleClick}>
      Back to top
    </button>
  );
}
