import { API } from '../API';

const getProjectSummary = ({ options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/dashboard/project`, { cancelToken })
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

const getWIPSummary = ({ options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/dashboard/wips`, { cancelToken })
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

const getWorkload = ({ options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/dashboard/workload`, { cancelToken })
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
	getProjectSummary,
	getWIPSummary,
	getWorkload
};

export default exports;
