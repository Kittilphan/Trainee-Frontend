import axios from 'axios';
import Timeline from './';
import React, { useState } from 'react';
import WipController from '../../../controllers/WIP';

const WipTimeline = ({ show, onClose, wipId }) => {
	const [timelineData, setTimelineData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	React.useEffect(() => {
		let cancelTokenSource = axios.CancelToken.source();
		function fetch() {
			setLoading(true);
			WipController.getActivityLog({
				id: wipId,
				options: { cancelToken: cancelTokenSource.token }
			})
				.then(async (timeline) => {
					if (!timeline) {
						const error = new Error(`Activity Log of Wip #${wipId} not found`);
						error.httpCode = 404;
						throw error;
					}
					console.log(`WipController.getActivityLog() id=${wipId}`, timeline);
					setTimelineData(timeline);
					setLoading(false);
				})
				.catch((err) => {
					console.error(`useEffect() WipController.getActivityLog() id=${wipId}`, err);
					setError(err);
					if (err.response?.status === 403)
						SwalDialog({
							icon: 'error',
							text: `${err.response?.data?.message || err.response?.data?.error || err}`,
							options: {}
						});
				});
		}
		if (wipId) fetch();
		return () => {
			cancelTokenSource.cancel('cancel due to unmounted');
		};
	}, [wipId]);
	if (!show) return;
	return <Timeline label={'WIP Activity'} show={show} onClose={onClose} data={timelineData} isLoading={loading} />;
};

export default WipTimeline;
