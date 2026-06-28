import React from 'react';
import useAuth from '../../hooks/useAuth';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

export default function ProtectedRoute({ requiredRoles = [], children }) {
	const { user } = useAuth();
	const navigate = useNavigate();
	if (!user || user?.isLoggedIn !== true) {
		const location = useLocation();
		return <Navigate to={`/user/login?redirect=${encodeURIComponent(location.pathname)}`} />;
	}
	if (user.roles?.length >= 0 && requiredRoles?.length > 0) {
		let matchedRole = false;
		(user?.roles || []).forEach((role) => {
			if (requiredRoles.indexOf(role) >= 0) matchedRole = true;
		});
		if (matchedRole === false) {
			return (
				<div className="row">
					<div className="col">
						<div className="d-flex">
							<h2 className="me-2">
								<FontAwesomeIcon icon={faExclamationCircle} className="text-danger" fixedWidth />
							</h2>
							<div>
								<h2>Unauthorized</h2>
								<p className="my-4">
									<span>Permission(s) required: </span>
									<span className="text-uppercase fw-bold">{requiredRoles.join('/')}</span>
								</p>
								<div className="d-flex gap-4">
									<button className="btn btn-outline-secondary py-1" onClick={() => navigate(-1)}>
										&#129028; Back
									</button>
									<button className="btn btn-primary py-1" onClick={() => navigate(`/user/login?force=1`)}>
										Go to Login
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		}
	} else if (requiredRoles?.length > 0) {
		return <Navigate to={`/user/login`} />;
	}
	return children;
}
