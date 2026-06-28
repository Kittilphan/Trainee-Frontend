import { API } from '../API';

const list = ({ fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/delivery-request`, { params: { fields: JSON.stringify(fields) }, cancelToken })
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

const getById = ({ id, options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/delivery-request/${id}`, { cancelToken })
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

const create = ({ payload, options = {} }) => {
	let { cancelToken } = options;
	return API.post(`/delivery-request`, payload, {
		cancelToken
		// headers: {
		// 	'Content-Type': 'application/json'
		// }
	})
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

const updateById = ({ id, payload, options }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.patch(`/delivery-request/update/${id}`, payload, { cancelToken })
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
	updateById,
	create
};

export default exports;
