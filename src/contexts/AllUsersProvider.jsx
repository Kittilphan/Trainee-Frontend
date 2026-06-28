import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AllUsersContext from './AllUsersContext';
import EmployeeController from '../controllers/Employees';

export default function AllUsersProvider({ children }) {
	const [isLoading, setLoading] = useState(false);
	const [allUsers, setAllUsers] = useState({});

	const fetchUsers = useCallback(async (roles) => {
		const cancelTokenSource = axios.CancelToken.source();
		setLoading(true);

		try {
			const response = await EmployeeController.list({
				fields: {
					fields: {
						_id: 1,
						displayName: 1,
						name: 1,
						username: 1,
						nickname: 1,
						roles: 1,
						skills: 1
					},
					filter: [
						{
							field: 'roles',
							operator: 'isAnyOf',
							value: roles
						}
					]
				},
				options: { cancelToken: cancelTokenSource.token }
			});

			if (!response) throw new Error('Invalid response');

			const newUsersByRole = roles.reduce((acc, role) => {
				acc[role] = response.filter((user) => user.roles.includes(role));
				return acc;
			}, {});

			setAllUsers((prevAllUsers) => ({ ...prevAllUsers, ...newUsersByRole }));
			return newUsersByRole;
		} catch (err) {
			if (axios.isCancel(err)) {
				console.log('Request canceled', err.message);
			} else {
				console.error('ERROR', err);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	const getUserFilter = useCallback(
		async (roles) => {
			const rolesToFetch = [];
			let userFilter = new Set();

			roles?.forEach((role) => {
				if (allUsers[role]) {
					allUsers[role].forEach((user) => userFilter.add(user));
				} else {
					rolesToFetch.push(role);
				}
			});

			if (rolesToFetch.length > 0) {
				const fetchedUsers = await fetchUsers(rolesToFetch);
				if (Object.keys(fetchedUsers).length > 0) {
					Object.keys(fetchedUsers).forEach((role) => {
						if (fetchedUsers[role]) {
							fetchedUsers[role].forEach((user) => userFilter.add(user));
						}
					});
				}
			}

			return Array.from(userFilter);
		},
		[allUsers]
	);

	return (
		<AllUsersContext.Provider value={{ isLoadingUser: isLoading, getUserFilter }}>{children}</AllUsersContext.Provider>
	);
}
