import { API } from '../API';
// import WIPS from '../../constants/wips';
// import { FILES } from '../../constants/files';

const getWIP = ({ id, options }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/wips/${id}`, { cancelToken })
			.then((res) => res?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const getWIPByProjectId = ({ id, options }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/wips/project/${id}`, { cancelToken })
			.then((res) => res?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const getNewWIPNumber = ({ options }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/wips/new-wipNumber`, { cancelToken })
			.then((res) => res?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const getDataForNewWIP = ({ id, options }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/wips/newWIP/${id}`, { cancelToken })
			.then((res) => res?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const createWIP = ({ payload, options }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.post(`/wips/create`, payload, { cancelToken })
			.then((res) => res?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const updateWIP = ({ id, payload, options }) => {
	let { cancelToken, timeout = 20000 } = options;
	return new Promise((resolve, reject) => {
		API.patch(`/wips/update/${id}`, payload, { cancelToken, timeout })
			.then((res) => res?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const getActivityLog = ({ id, options }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/wips/activity-log/${id}`, { cancelToken })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const exports = {
	getWIP,
	getWIPByProjectId,
	getNewWIPNumber,
	createWIP,
	updateWIP,
	getDataForNewWIP,
	getActivityLog
};

export default exports;
