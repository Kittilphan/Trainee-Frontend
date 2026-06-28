import React from 'react';
import useAuth from '../../hooks/useAuth';

export default function ProtectedComponent({
	requiredRoles = [],
	requiredPersons = [],
	fallback,
	children,
	silent = true,
	caption
}) {
	const { user } = useAuth();

	if (!caption) {
		caption = `Hidden component`;
	}
	const Information = (
		<div className="alert bg-light fst-italic">
			<div className="fs-4">{caption}</div>
			<div className="small">
				{requiredRoles.length > 0 && (
					<>
						Required permission: <strong className="text-uppercase">{requiredRoles.join(' / ')}</strong>
					</>
				)}
				{requiredPersons?.length > 0 && (
					<>
						Only{' '}
						<strong className="text-uppercase">{requiredPersons?.map((person) => person?.username).join(' / ')}</strong>{' '}
						have permission
					</>
				)}
			</div>
		</div>
	);

	if (!user || user?.isLoggedIn !== true) {
		return silent === true ? <></> : Information;
	}

	if (!Array.isArray(requiredPersons)) {
		requiredPersons = [requiredPersons];
	}

	const requiredPersonIds = requiredPersons?.map((person) => person?._id);

	let hasPermission = false;

	if (requiredRoles?.length > 0) {
		hasPermission = user.roles.some((role) => requiredRoles?.includes(role));
	}

	if (!hasPermission && requiredPersons?.length > 0) {
		hasPermission = requiredPersonIds?.includes(user._id);
	}

	if (fallback && !hasPermission) {
		return fallback;
	} else if (!hasPermission) {
		return silent === true ? <></> : Information;
	}

	return children;
}
