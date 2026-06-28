import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const SummaryTable = ({ label, data = [], itemsPerPage = 5, header = [] }) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [paginatedData, setPaginatedData] = useState([]);
	const [totalPages, setTotalPages] = useState(1);

	const maxPageButtons = 5;

	// Calculate total pages
	useEffect(() => {
		const total = Math.ceil(data.length / itemsPerPage);
		if (total !== totalPages) {
			setTotalPages(total);
		}
	}, [data.length, itemsPerPage]);

	useEffect(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const newPaginatedData = data.slice(start, end);

		if (!arraysAreEqual(newPaginatedData, paginatedData)) {
			setPaginatedData(newPaginatedData);
		}
	}, [currentPage, data, itemsPerPage]);

	const arraysAreEqual = (arr1, arr2) => {
		if (arr1.length !== arr2.length) return false;
		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}
		return true;
	};

	// Render limited page buttons
	const renderPageNumbers = () => {
		const pageButtons = [];
		let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
		let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

		// Adjust if on last pages
		if (endPage - startPage < maxPageButtons - 1) {
			startPage = Math.max(1, endPage - maxPageButtons + 1);
		}

		for (let i = startPage; i <= endPage; i++) {
			pageButtons.push(
				<li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
					<button className="page-link" onClick={() => setCurrentPage(i)}>
						{i}
					</button>
				</li>
			);
		}

		return pageButtons;
	};

	return (
		<div className="col-12 col-md-8">
			<div className="card p-4 h-100">
				<div className="h-100">
					<h2 className="my-1">{label + ' Summary'} </h2>
					<div className="row mb-3">
						<div className="col col-md-4">
							<div className="form-floating">
								<select className="form-select" id="selecedProject">
									<option value="0">Project</option>
									<option value="1">One</option>
									<option value="2">Two</option>
									<option value="3">Three</option>
								</select>
								<label htmlFor="selecedProject">{label}</label>
							</div>
						</div>
						<div className="col col-md-4">
							<div className="form-floating">
								<select className="form-select" id="selecedProject">
									<option value="0">Project</option>
									<option value="1">One</option>
									<option value="2">Two</option>
									<option value="3">Three</option>
								</select>
								<label htmlFor="selecedProject">{label} Owner</label>
							</div>
						</div>
						<div className="col col-md-4">
							<div className="form-floating">
								<select className="form-select" id="selecedProject">
									<option value="0">Project</option>
									<option value="1">One</option>
									<option value="2">Two</option>
									<option value="3">Three</option>
								</select>
								<label htmlFor="selecedProject">Status</label>
							</div>
						</div>
					</div>
					<table className="table table-striped">
						<thead>
							<tr>
								{header.map((item) => (
									<th>{item}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{paginatedData.length > 0 ? (
								paginatedData.map((item, index) => (
									<tr key={index}>
										<td>{item.name}</td>
										<td>{item.owner || 'N/A'}</td>
										<td>{item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB') : 'N/A'}</td>
										<td>
											{item.status === 0 ? (
												<span className="text-danger">Unassigned</span>
											) : (
												<span className="text-primary">On Progress</span>
											)}
										</td>
										<td>{item.days || '0'}</td>
									</tr>
								))
							) : (
								<tr class="text-center">
									<td colspan="5" rowspan="2">
										No data available
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination Controls */}
				<nav>
					<ul className="pagination justify-content-end">
						<li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
							<button className="page-link" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
								{'<<'}
							</button>
						</li>
						<li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
							<button
								className="page-link"
								onClick={() => setCurrentPage(currentPage - 1)}
								disabled={currentPage === 1}>
								{'<'}
							</button>
						</li>

						{renderPageNumbers()}

						<li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
							<button
								className="page-link"
								onClick={() => setCurrentPage(currentPage + 1)}
								disabled={currentPage === totalPages}>
								{'>'}
							</button>
						</li>
						<li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
							<button
								className="page-link"
								onClick={() => setCurrentPage(totalPages)}
								disabled={currentPage === totalPages}>
								{'>>'}
							</button>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	);
};

export default SummaryTable;
