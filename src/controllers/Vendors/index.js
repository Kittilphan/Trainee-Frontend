import { API } from '../API';

const list = ({ fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/vendors`, {
		params: { fields: JSON.stringify(fields) },
		cancelToken
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

const getById = ({ id, options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/vendors/${id}`, { cancelToken })
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
	return API.post(`/vendors`, payload, { cancelToken })
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			if (err.response?.data?.error) return Promise.reject(err.response.data.error);

			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

const update = ({ id, payload, options = {} }) => {
	let { cancelToken } = options;
	return API.patch(`/vendors/${id}`, payload, { cancelToken })
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
	create,
	update
};

export default exports;
