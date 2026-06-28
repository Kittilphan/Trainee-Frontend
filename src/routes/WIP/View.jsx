import React from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

import Breadcrumb from '../../components/Breadcrumb';

import WIPController from '../../controllers/WIP';

import ProjectHeader from '../../components/ProjectHeader';
import WIPdetail from '../../components/ProjectDetail/WIP/WIPdetail';
import SpinLoading from '../../components/SpinLoading';
import BackButton from '../../components/Common/Button/BackButton';
import { SwalDialog } from '../../components/Swal';

function View() {
	const navigate = useNavigate();
	const { projectId, wipId } = useParams();
	const [project, setProject] = React.useState([]);
	const [wip, setWIP] = React.useState([]);
	const [isLoading, setLoading] = React.useState(true);
	const [error, setError] = React.useState();

	React.useEffect(() => {
		const fetchData = async () => {
			const cancelTokenSource = axios.CancelToken.source();
			try {
				const data = await WIPController.getWIP({
					id: wipId,
					options: { cancelToken: cancelTokenSource.token }
				});

				if (!wip) {
					const error = new Error(`WIP #${wipId} not found`);
					error.httpCode = 404;
					throw error;
				}

				setWIP(data.wip);
				setProject(data.project);
				setLoading(false);
			} catch (err) {
				setError(err);
				if (err.response?.status === 403) {
					SwalDialog({
						icon: 'error',
						text: `${err.response?.data?.message || err.response?.data?.error || err}`,
						options: {}
					}).then(() => {
						return navigate(`/projects`);
					});
				} else {
					console.error('Error fetching project data', error);
				}
			}

			return () => {
				cancelTokenSource.cancel('cancel due to unmounted');
			};
		};

		fetchData();
	}, [wipId]);

	return (
		<div>
			<Breadcrumb
				items={[
					['home', `/`],
					['Projects', `/projects`],
					[project.projectName, `/projects/${projectId}`],
					[wip.wipName ? wip.wipName : wip.wipNumber, `/projects/${projectId}/wip/${wipId}`],
				]}
			/>
			<div className="text-center">
				<h2 className="position-absolute mt-2">
					<BackButton />
				</h2>
				<div>
					<h1 className="text-truncate">{project.projectName || 'Project Loading..'}</h1>
					<h5 className="text-truncate text-muted">{project.customer?.name || ''}</h5>
				</div>
			</div>
			{isLoading ? (
				<SpinLoading />
			) : (
				<>
					<ProjectHeader project={project} />
					<div className="fs-2 fw-medium text-center container mb-4 mt-5">WIP Detail</div>
					<WIPdetail project={project} wip={wip} />
				</>
			)}
		</div>
	);
}

export default View;
