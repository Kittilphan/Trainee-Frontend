import { API } from '../API';
// import { USERS } from '../../constants/users';

const list = ({ fields = {}, options = {} }) => {
	let { cancelToken } = options;
	return API.get(`/employees`, {
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

const exports = {
	list
};

export default exports;
