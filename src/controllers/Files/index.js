import { API } from '../API';
// import { PROJECTS } from '../../constants/projects';
// import { FILES } from '../../constants/files';

const getFileByProjectId = ({ projectId, fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/files/project/${projectId}`, { params: { fields: JSON.stringify(fields) }, cancelToken })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const getFileByWIPId = ({ wipId, fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/files/wip/${wipId}`, { params: { fields: JSON.stringify(fields) }, cancelToken })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const getById = ({ file, fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(
			`/files/${file.attachmentType || file.type}/${file.reference || file._id}/${
				file.description || file.originalName
			}`,
			{
				cancelToken,
				responseType: 'blob'
			}
		)
			.then((resp) => resolve(resp?.data))
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const downloadById = ({ file, fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		API.get(`/files/${file.attachmentType}/${file._id}/download`, {
			params: { fields: JSON.stringify(fields) },
			cancelToken,
			responseType: 'blob'
		})
			.then((resp) => resolve(resp.data))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const exports = {
	getFileByProjectId,
	getFileByWIPId,
	getById,
	downloadById
};

export default exports;
