import { API } from '../API';

// import { USERS } from '../../constants/users';

const me = () => {
	return API.get('/auth/me')
		.then((resp) => {
			if (!resp?.data) throw new Error('empty response');
			console.log(`Controller:Auth::me()`, resp.data);
			return Promise.resolve(resp.data);
		})
		.catch((err) => {
			console.error(`ERROR Controller:Auth::me()`, err);
			return Promise.reject(err);
		});
	// return new Promise((resolve, reject) => {
	//   setTimeout(() => {
	//     const token = localStorage.getItem("jwtToken");
	//     if (!token) {
	//       console.error(`ERROR Controller:Auth::me() - User not found`);
	//       reject(new Error("User not found"));
	//     }
	//     const currentUser = USERS.find((user) => user.username === token);
	//     if (currentUser) {
	//       console.log(`Controller:Auth::me()`, currentUser);
	//       resolve(currentUser);
	//     } else {
	//       console.error(`ERROR Controller:Auth::me() - User not found`);
	//       reject(new Error("User not found"));
	//     }
	//   }, 200);
	// });
};

const login = ({ username, password }) => {
	return API.post('/auth/login', {
		username,
		password
	})
		.then(async (resp) => {
			if (!resp?.data) throw new Error('empty response');
			console.log(`Controller:Auth::login()`, resp.data);
			try {
				const result = await me();
				return Promise.resolve(result);
			} catch (err) {
				return Promise.reject(null);
			}
		})
		.catch((err) => {
			console.error(`ERROR Controller:Auth::login()`, err);
			return Promise.reject(err);
		});
	// return new Promise((resolve, reject) => {
	//   const user = USERS.find((user) => user.username === username);

	//   if (user) {
	//     console.log(`Controller:Auth::login()`, user);
	//     localStorage.setItem("jwtToken", username);
	//     setTimeout(() => {
	//       const { username, roles, team } = user;
	//       resolve({ username, roles, team });
	//     }, 200);
	//   } else {
	//     console.error(`ERROR Controller:Auth::login() - Invalid credentials`);
	//     reject(new Error("Invalid credentials"));
	//   }
	// });
};

const logout = () => {
	return API.get('/auth/logout')
		.then((resp) => {
			if (!resp?.data) throw new Error('empty response');
			return Promise.resolve(resp.data);
		})
		.catch((err) => {
			console.error(`ERROR Controller:Auth::logout()`, err);
			return Promise.reject(err);
		});
};

const exports = {
	me,
	login,
	logout
};

export default exports;
