import { API } from '../API';
// import { PROJECTS } from '../../constants/projects';
// import { CUSTOMERS } from '../../constants/customers';
// import { FILES } from '../../constants/files';
// import { XOs } from '../../constants/xos';
// import { VENDORS } from '../../constants/vendors';

// List projects based on searchTerm
const list = ({ fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/projects`, { params: { fields: JSON.stringify(fields) }, cancelToken })
		.then((resp) => {
			if (resp?.data) return Promise.resolve(resp.data);
			throw new Error('invalid response');
		})
		.catch((err) => {
			console.error(`ERROR:`, err);
			return Promise.reject(err);
		});
};

// Get project by ID
const getById = ({ id, options }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/projects/${id}`, { cancelToken })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

// Create a new project
const createInitial = ({ payload, options }) => {
	let { cancelToken, timeout = 20000 } = options;
	return new Promise((resolve, reject) => {
		API.post(`/projects/initial`, payload, { cancelToken, timeout })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

// Update an existing project
const updateInitial = ({ projectId, payload, options }) => {
	let { cancelToken, timeout = 20000 } = options;
	return new Promise((resolve, reject) => {
		API.patch(`/projects/initial/${projectId}`, payload, { cancelToken, timeout })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

// Update project details
const updateDetail = ({ projectId, payload, options }) => {
	let { cancelToken, timeout = 20000 } = options;
	return new Promise((resolve, reject) => {
		API.patch(`/projects/tech/${projectId}`, payload, { cancelToken, timeout })
			.then((resp) => resp?.data)
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
		API.get(`/projects/activity-log/${id}`, { cancelToken })
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
	createInitial,
	updateInitial,
	updateDetail,
	getActivityLog
};

export default exports;
