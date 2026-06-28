import React from "react";

export default function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [scrollPositionPercent, setScrollPositionPercent] = React.useState(0);
  const handleScroll = () => {
    const { scrollY } = window;
    const { scrollHeight, clientHeight } = document.documentElement;
    let percentBottomReached = (scrollY + clientHeight) / scrollHeight;
    if (scrollY <= 0) {
      percentBottomReached = 0;
    }
    setScrollPosition(scrollY);
    setScrollPositionPercent(percentBottomReached * 100);
  };
  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return {
    scrollPosition,
    scrollPositionPercent,
  };
}
