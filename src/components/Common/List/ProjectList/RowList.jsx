import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Style from './RowList.module.css';
import FilterListIcon from '@mui/icons-material/FilterList';

const TableList = ({ projects }) => {
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
	const [filters, setFilters] = useState({
		status: '',
		customerName: '',
		projectName: '',
		description: '',
		lastUpdatedAt: ''
	});
	const [visibleFilter, setVisibleFilter] = useState({
		status: false,
		customerName: false,
		projectName: false,
		description: false,
		lastUpdatedAt: false
	});

	const dateFormat = (date) => {
		return date ? new Date(date).toLocaleDateString('en-GB') : 'Unknown';
	};

	const handleSort = (key) => {
		let direction = 'asc';
		if (sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc';
		}
		setSortConfig({ key, direction });
	};

	const handleFilterChange = (e, key) => {
		setFilters({ ...filters, [key]: e.target.value });
	};

	const toggleFilterVisibility = (key) => {
		setVisibleFilter((prevState) => ({
			...prevState,
			[key]: !prevState[key]
		}));
		setFilters((prevFilter) => ({
			...prevFilter,
			[key]: ''
		}));
	};

	const filteredProjects = projects.filter((project) => {
		return (
			(filters.status === '' || project.state === parseInt(filters.status)) &&
			(filters.customerName === '' ||
				(project.customer?.name || project.customerName).toLowerCase().includes(filters.customerName.toLowerCase())) &&
			(filters.projectName === '' || project.projectName.toLowerCase().includes(filters.projectName.toLowerCase())) &&
			(filters.description === '' || project.description.toLowerCase().includes(filters.description.toLowerCase())) &&
			(filters.lastUpdatedAt === '' || dateFormat(project.lastUpdatedAt).includes(filters.lastUpdatedAt))
		);
	});

	const sortedProjects = [...filteredProjects].sort((a, b) => {
		if (sortConfig.key) {
			let aValue = a[sortConfig.key];
			let bValue = b[sortConfig.key];

			if (sortConfig.key === 'lastUpdatedAt') {
				aValue = new Date(aValue);
				bValue = new Date(bValue);
			}

			if (aValue < bValue) {
				return sortConfig.direction === 'asc' ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortConfig.direction === 'asc' ? 1 : -1;
			}
			return 0;
		}
		return 0;
	});

	return (
		<>
			<div className="text-danger text-end">Click link in project name **</div>
			<div className={`table-responsive ${Style.tableContainer}`}>
				<table className="table">
					<thead>
						<tr>
							<th className={`${Style.minWidthColumn} ${Style.sortable}`}>
								<div onClick={() => handleSort('state')}>
									Status
									{sortConfig.key === 'state' && (
										<span className={Style.sortIcon}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
									)}
								</div>
								<FilterListIcon className={Style.filterIcon} onClick={() => toggleFilterVisibility('status')} />
								{visibleFilter.status && (
									<input
										type="text"
										className={Style.filterInput}
										value={filters.status}
										onChange={(e) => handleFilterChange(e, 'status')}
										placeholder="Filter"
									/>
								)}
							</th>

							<th className={`${Style.minWidthColumn} ${Style.sortable}`}>
								<div onClick={() => handleSort('projectName')}>
									Project
									{sortConfig.key === 'projectName' && (
										<span className={Style.sortIcon}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
									)}
								</div>
								<FilterListIcon className={Style.filterIcon} onClick={() => toggleFilterVisibility('projectName')} />
								{visibleFilter.projectName && (
									<input
										type="text"
										className={Style.filterInput}
										value={filters.projectName}
										onChange={(e) => handleFilterChange(e, 'projectName')}
										placeholder="Filter"
									/>
								)}
							</th>
							<th className={`${Style.minWidthColumn} ${Style.sortable}`}>
								<div onClick={() => handleSort('customerName')}>
									Customer
									{sortConfig.key === 'customerName' && (
										<span className={Style.sortIcon}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
									)}
								</div>

								<FilterListIcon className={Style.filterIcon} onClick={() => toggleFilterVisibility('customerName')} />
								{visibleFilter.customerName && (
									<input
										type="text"
										className={Style.filterInput}
										value={filters.customerName}
										onChange={(e) => handleFilterChange(e, 'customerName')}
										placeholder="Filter"
									/>
								)}
							</th>
							<th className={`${Style.minWidthColumn} ${Style.sortable}`}>
								<div onClick={() => handleSort('description')}>
									Scope of Work
									{sortConfig.key === 'description' && (
										<span className={Style.sortIcon}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
									)}
								</div>

								<FilterListIcon className={Style.filterIcon} onClick={() => toggleFilterVisibility('description')} />
								{visibleFilter.description && (
									<input
										type="text"
										className={Style.filterInput}
										value={filters.description}
										onChange={(e) => handleFilterChange(e, 'description')}
										placeholder="Filter"
									/>
								)}
							</th>
							<th className={`${Style.minWidthColumn} ${Style.sortable}`}>
								<div onClick={() => handleSort('lastUpdatedAt')}>
									Last Updated
									{sortConfig.key === 'lastUpdatedAt' && (
										<span className={Style.sortIcon}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
									)}
								</div>

								<FilterListIcon className={Style.filterIcon} onClick={() => toggleFilterVisibility('lastUpdatedAt')} />
								{visibleFilter.lastUpdatedAt && (
									<input
										type="text"
										className={Style.filterInput}
										value={filters.lastUpdatedAt}
										onChange={(e) => handleFilterChange(e, 'lastUpdatedAt')}
										placeholder="Filter"
									/>
								)}
							</th>
						</tr>
					</thead>
					<tbody>
						{sortedProjects.map((project, index) => (
							<tr key={index}>
								<td>
									{project.state === 0 ? (
										<h4 className="text-warning">Implementing</h4>
									) : project.state === 1 ? (
										<h4 className="text-info">Done</h4>
									) : (
										<h4 className="text-danger">Canceled</h4>
									)}
								</td>
								<td>
									<Link to={`/projects/${project._id}`} key={index}>
										<div className="card-title">
											<h2 className="col d-flex flex-wrap">
												<span className="text-nowrap">{project.projectName}</span>
												<span className="text-gray">#{project.projectCode}</span>
											</h2>
										</div>
									</Link>
								</td>
								<td>{project.customer?.name || project.customerName}</td>

								<td className={`${Style.description}`}>{project.description}</td>
								<td>
									<div className="d-flex flex-wrap text-gray">
										<div>By {project.lastUpdatedBy}</div>
										<div className="ms-1">At {dateFormat(project.lastUpdatedAt)}</div>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
};

export default TableList;
