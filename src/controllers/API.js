import axios from 'axios';

const API = axios.create({
	baseURL: import.meta.env.VITE_API_BASEURL || 'https://localhost/api',
	// withCredentials: true,
	timeout: 10000,
	withCredentials: true
	// let axios decide
	// headers: {
	// 	'Content-Type': 'application/json'
	// }
});

const ShipmentAPI = axios.create({
	baseURL: import.meta.env.VITE_SHIPMENT_API_BASEURL || 'https://localhost/shipment-api',
	// withCredentials: true,
	timeout: 20000,
	withCredentials: true
	// let axios decide
	// headers: {
	// 	'Content-Type': 'application/json'
	// }
});

// API.interceptors.response.use((error) => {
//   if (axios.isCancel(error)) {
//     return console.error(`cancelled`, error);
//   }
// });

const setupInterceptors = (navigate, location) => {
	API.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error.response && error.response.status === 401) {
				navigate(`/user/login?redirect=${encodeURIComponent(location.pathname)}`);
			}
			return Promise.reject(error);
		}
	);

	ShipmentAPI.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error.response && error.response.status === 401) {
				navigate(`/user/login?redirect=${encodeURIComponent(location.pathname)}`);
			}
			return Promise.reject(error);
		}
	);
};

export { API, ShipmentAPI, setupInterceptors };
