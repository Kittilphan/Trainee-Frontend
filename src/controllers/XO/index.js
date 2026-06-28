import { API } from '../API';
// import { XOs } from '../../constants/xos';
// import { VENDORS } from '../../constants/vendors';

const list = ({ fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/xos/`, { params: { fields: JSON.stringify(fields) }, cancelToken })
			.then((res) => res?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const getById = ({ id, options = {} }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/xos/${id}`, { cancelToken })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const getItemById = ({ id, options = {} }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/xos/items/${id}`, { cancelToken })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const createAndUpdate = ({ payload = {}, options }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.post(`/xos/createAndUpdate`, payload, { cancelToken })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const updateById = ({ id, payload = {}, options = {} }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.patch(`/xos/update/${id}`, payload, { cancelToken })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const validate = ({ xoNumbers, sale, options = {} }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/xos/validate/${xoNumbers}`, { params: { sale: JSON.stringify(sale) }, cancelToken })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const exports = {
	list,
	getById,
	getItemById,
	createAndUpdate,
	validate,
	updateById
};

export default exports;
