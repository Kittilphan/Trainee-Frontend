import { ShipmentAPI } from '../API';

const fileUpload = ({ payload, options = {} }) => {
	let { cancelToken } = options;
	return new Promise((resolve, reject) => {
		ShipmentAPI.post(`/file/upload`, payload, { cancelToken })
			.then((resp) => resp?.data)
			.then((json) => resolve(json))
			.catch((err) => {
				console.error(`ERROR:`, err);
				reject(err);
			});
	});
};

const exports = {
	fileUpload
};

export default exports;
