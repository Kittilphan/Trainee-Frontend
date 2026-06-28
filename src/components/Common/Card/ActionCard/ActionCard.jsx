import React from "react";
import { Link } from "react-router-dom";

export default function ActionCard({actionName, linkTo}) {
  return (
    <div className="col-md-4 mb-4">
        <Link
        to={linkTo}
        className="btn btn-outline-secondary form-control text-decoration-none"
        >
        <h2 className="py-4">{actionName}</h2>
        </Link>
    </div>
  );
}
