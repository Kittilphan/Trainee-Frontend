import { Suspense } from "react";

import SpinLoading from "./SpinLoading";

const Fallback = () => {
  return (
    <div>
      <SpinLoading size="2rem" />
      <span> Loading, please wait...</span>
    </div>
  );
};

export default function SuspenseLoading({ children }) {
  return <Suspense fallback={<Fallback />}>{children}</Suspense>;
}
