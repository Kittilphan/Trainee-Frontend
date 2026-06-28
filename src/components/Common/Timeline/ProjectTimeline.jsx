import axios from 'axios';
import Timeline from './';
import React, { useState } from 'react';
import ProjectController from '../../../controllers/Projects';

const ProjectTimeline = ({ show, onClose, projectId }) => {
	const [timelineData, setTimelineData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	React.useEffect(() => {
		let cancelTokenSource = axios.CancelToken.source();
		function fetch() {
			setLoading(true);
			ProjectController.getActivityLog({
				id: projectId,
				options: { cancelToken: cancelTokenSource.token }
			})
				.then(async (timeline) => {
					if (!timeline) {
						const error = new Error(`Activity Log of Project #${projectId} not found`);
						error.httpCode = 404;
						throw error;
					}
					console.log(`ProjectController.getActivityLog() id=${projectId}`, timeline);
					setTimelineData(timeline);
					setLoading(false);
				})
				.catch((err) => {
					console.error(`useEffect() ProjectController.getActivityLog() id=${projectId}`, err);
					setError(err);
					if (err.response?.status === 403)
						SwalDialog({
							icon: 'error',
							text: `${err.response?.data?.message || err.response?.data?.error || err}`,
							options: {}
						});
				});
		}
		if (projectId) fetch();
		return () => {
			cancelTokenSource.cancel('cancel due to unmounted');
		};
	}, [projectId]);
	if (!show) return;
	return <Timeline label={'Project Activity'} show={show} onClose={onClose} data={timelineData} isLoading={loading} />;
};

export default ProjectTimeline;
