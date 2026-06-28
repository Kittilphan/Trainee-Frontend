import React, { useState, useEffect } from 'react';
import ProjectController from '../../controllers/Projects';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumb';
import ProjectDataGrid from '../../components/Common/Table/DataGrid/ProjectTable';
import ProtectedComponent from '../../components/ProtectedComponent';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import BackButton from '../../components/Common/Button/BackButton';
import SearchBar from '../../components/Common/SearchBar';

export default function ProjectList() {
	const [isLoading, setIsLoading] = useState(true);
	const [projects, setProjects] = useState([]);
	const [total, setTotal] = useState(0);
	const [pagination, setPagination] = useState({ page: 1, limit: 10 });
	const [filterModel, setFilterModel] = useState({ items: [] });

	useEffect(() => {
		setIsLoading(true);
		const debounceFetch = setTimeout(() => {
			if (pagination && filterModel) {
				fetch();
			}
		}, 1500);

		return () => {
			clearTimeout(debounceFetch);
		};
	}, [pagination, filterModel]);

	function fetch(query) {
		setIsLoading(true);
		let cancelTokenSource = axios.CancelToken.source();

		ProjectController.list({
			fields: {
				...pagination,
				filter: filterModel.items || [],
				...(query ? { query } : {})
			},
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((data) => {
				console.log('ProjectController.list()', data);
				if (!Array.isArray(data.projects)) {
					throw new Error('unexpected value');
				}
				setProjects(data.projects);
				setTotal(data.total);
			})
			.catch((err) => {
				console.error(`ERROR`, err);
			})
			.finally(() => {
				setIsLoading(false);
				cancelTokenSource.cancel('cancel due to unmounted');
			});
	}
	const searchHandle = (query) => {
		fetch(query);
	};

	const handlePaginationChange = (model) => {
		let { page, pageSize } = model;
		page = page > 0 ? page + 1 : 1;
		//prevent start with fetch 2 time
		if (page !== pagination.page || pageSize !== pagination.limit) {
			setPagination((prev) => ({ ...prev, page, limit: pageSize }));
		}
	};

	const handleFilterModelChange = (model) => {
		setFilterModel(model);
	};

	return (
		<>
			<div className="row my-2">
				<div className="col">
					<Breadcrumb
						items={[
							['home', `/`],
							['Projects', `/projects`]
						]}
					/>
				</div>
			</div>
			<div className="d-flex gap-2">
				<BackButton classNames="me-3" sizePx={30} />
				<div className="col">
					<h1>Projects</h1>
				</div>
				<SearchBar onSearch={searchHandle} />
				<ProtectedComponent requiredRoles={['sale']}>
					<Link to={`/projects/new`} className="btn btn-outline-primary text-decoration-none">
						<FontAwesomeIcon icon={faPlusCircle} fixedWidth className="me-1" />{' '}
						<span className="d-none d-md-inline">Create New Project</span>{' '}
					</Link>
				</ProtectedComponent>
			</div>
			<hr />
			<ProjectDataGrid
				isLoading={isLoading}
				rows={projects}
				total={total}
				pagination={pagination}
				onPaginationChange={handlePaginationChange}
				filterModel={filterModel}
				onFilterModelChange={handleFilterModelChange}
			/>
		</>
	);
}
