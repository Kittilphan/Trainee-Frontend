import React from 'react';

import AuthContext from '../contexts/AuthContext';
import AuthController from '../controllers/Auth';
import { useNavigate } from 'react-router-dom';

import { SwalDialog, SwalLoading } from '../components/Swal';

export default function useAuth() {
	const { userId, userName, userRoles, userTeam, userState, isLoading, setLoggedIn } = React.useContext(AuthContext);
	const navigate = useNavigate();
	function userLogin({ username, password, redirectLogonURL }) {
		if (!username || !password) {
			SwalDialog({ icon: 'error', text: 'Username and Password is Required' });
			return;
		}
		SwalLoading();
		AuthController.login({
			username,
			password
		})
			.then((result) => {
				const { token, roles, team } = result;
				console.log('useAuth::userLogin() result: ', result);
				setLoggedIn({
					username,
					roles,
					team,
					isLoggedIn: true
				});
				SwalDialog({ icon: 'success', options: { timer: 400 } });
				return navigate(redirectLogonURL || `/`, {
					replace: true
				});
			})
			.catch((err) => {
				console.error('ERROR', err);
				SwalDialog({ icon: 'error', text: err.response?.data?.error || 'Logon Failed' });
				return navigate('/user/login', {
					replace: true
				});
			});
	}
	function userLogout(options = {}) {
		const { redirectLogoutURL } = options;
		AuthController.logout()
			.then((result) => {
				console.log('useAuth::userLogout() result: ', result);
				setLoggedIn({
					username: null,
					roles: null,
					team: null,
					isLoggedIn: false
				});
				return navigate(redirectLogoutURL || `/`, {
					replace: true
				});
			})
			.catch((err) => {
				console.error('ERROR', err);
				return navigate('/', {
					replace: true
				});
			});
	}
	return {
		isLoadingUser: isLoading,
		user:
			isLoading === false
				? {
						_id: userId,
						username: userName,
						isLoggedIn: userState,
						roles: userRoles,
						team: userTeam
				  }
				: null,
		userLogin,
		userLogout,
		isAdmin: () => {
			return isLoading === false && userRoles && userRoles.indexOf('admin') >= 0;
		}
	};
}
