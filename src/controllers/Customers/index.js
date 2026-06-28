import { API } from '../API';

// import { CUSTOMERS } from '../../constants/customers';
// import { TEMPCUSTOMERS } from '../../constants/tempCustomers';
// import { PROJECTS } from '../../constants/projects';

const list = ({ fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/customers`, { params: { fields: JSON.stringify(fields) }, cancelToken })
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

const getById = ({ id, fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/customers/${id}`, { params: { fields: JSON.stringify(fields) }, cancelToken })
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

const getLocationsById = ({ id, fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/customers/locations/${id}`, { params: { fields: JSON.stringify(fields) }, cancelToken })
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

const createTemp = ({ payload, options = {} }) => {
	let { cancelToken } = options;
	return API.post(`/customers`, payload, { cancelToken })
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

const update = ({ id, payload, options = {} }) => {
	let { cancelToken } = options;
	return API.patch(`/customers/${id}`, payload, { cancelToken })
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

const exports = {
	list,
	getById,
	getLocationsById,
	createTemp,
	update
};

export default exports;
