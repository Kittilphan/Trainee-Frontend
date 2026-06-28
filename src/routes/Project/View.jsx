import React from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

import Breadcrumb from '../../components/Breadcrumb';

import ProjectController from '../../controllers/Projects';

import ProjectHeader from '../../components/ProjectHeader';
import ProjectDetail from '../../components/ProjectDetail/ProjectDetail';
import SpinLoading from '../../components/SpinLoading';
import BackButton from '../../components/Common/Button/BackButton';
import { SwalDialog } from '../../components/Swal';
import ContentRenderer from '../../components/ContentRenderer';

function View() {
	let navigate = useNavigate();
	const { projectId } = useParams();
	const [project, setProject] = React.useState([]);
	const [isLoading, setLoading] = React.useState(true);
	const [error, setError] = React.useState();

	React.useEffect(() => {
		let cancelTokenSource = axios.CancelToken.source();
		function fetch() {
			ProjectController.getById({
				id: projectId,
				options: { cancelToken: cancelTokenSource.token }
			})
				.then(async (project) => {
					if (!project) {
						const error = new Error(`Project #${projectId} not found`);
						error.httpCode = 404;
						throw error;
					}
					console.log(`ProjectController.getById() id=${projectId}`, project);
					setProject(project);
					setLoading(false);
				})
				.catch((err) => {
					setLoading(false);
					console.error(`useEffect() ProjectController.getById() id=${projectId}`, err);
					setError(err);
					if (err.response?.status === 403 || err.response?.status === 404)
						SwalDialog({
							icon: 'error',
							text: `${err.response?.data?.message || err.response?.data?.error || err}`,
							options: {}
						}).then(() => {
							return navigate(`/projects`);
						});
				});
		}
		fetch();
		return () => {
			cancelTokenSource.cancel('cancel due to unmounted');
		};
	}, [projectId]);

	return (
		<div>
			<Breadcrumb
				items={[
					['home', `/`],
					['Projects', `/projects`],
					[project.projectName, `/projects/${project._id}`]
				]}
			/>
			<div className="text-center">
				<h2 className="position-absolute mt-2">
					<BackButton />
				</h2>
				<div>
					<h1 className="text-wrap text-truncate">
						<ContentRenderer value={project.projectName || 'Project Loading..'} />
					</h1>
					<h5 className="text-truncate text-muted">
						<ContentRenderer value={project.customer?.name || ''} />
					</h5>
				</div>
			</div>
			{isLoading ? (
				<SpinLoading />
			) : (
				<>
					<ProjectHeader project={project} />
					<ProjectDetail project={project} />
				</>
			)}
		</div>
	);
}

export default View;
