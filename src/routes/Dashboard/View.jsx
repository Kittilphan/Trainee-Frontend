import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumb';
import BackButton from '../../components/Common/Button/BackButton';
import ProtectedComponent from '../../components/ProtectedComponent';
import DashboardController from '../../controllers/Dashboard';

import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SummaryTable from '../../components/Common/Table/SummaryTable';
import CircleProgress from '../../components/Common/CircleProgress';
import { ROLES } from '../../constants/users';

ChartJS.register(CategoryScale, ArcElement, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
	const [projectSummaryData, setProjectSummaryData] = useState([]);
	const [wipSummaryData, setWipSummaryData] = useState([]);
	const [workloadData, setWorkloadData] = useState();

	const [error, setError] = useState(null);
	useEffect(() => {
		const cancelTokenSource = axios.CancelToken.source();

		Promise.all([projectFetch(cancelTokenSource), wipFetch(cancelTokenSource), workloadFetch(cancelTokenSource)]).catch(
			(err) => {
				if (axios.isCancel(err)) {
					console.log('Fetch canceled:', err.message);
				} else {
					console.error('Error in data fetch:', err);
					setError(err);
				}
			}
		);

		return () => {
			cancelTokenSource.cancel('Operation canceled by the user.');
		};
	}, []);

	const projectFetch = async (cancelTokenSource) => {
		return DashboardController.getProjectSummary({
			options: { cancelToken: cancelTokenSource.token }
		}).then((summary) => {
			if (!summary) {
				const error = new Error(`Project Summary not found`);
				error.httpCode = 404;
				throw error;
			}
			console.log(`DashboardController.getProjectSummary() ::`, summary);
			setProjectSummaryData(summary);
		});
	};

	const wipFetch = async (cancelTokenSource) => {
		return DashboardController.getWIPSummary({
			options: { cancelToken: cancelTokenSource.token }
		}).then((summary) => {
			if (!summary) {
				const error = new Error(`WIP Summary not found`);
				error.httpCode = 404;
				throw error;
			}
			console.log(`DashboardController.getWIPSummary() ::`, summary);
			setWipSummaryData(summary);
		});
	};

	const workloadFetch = async (cancelTokenSource) => {
		return DashboardController.getWorkload({
			options: { cancelToken: cancelTokenSource.token }
		}).then((workload) => {
			if (!workload) {
				const error = new Error(`Workload not found`);
				error.httpCode = 404;
				throw error;
			}
			console.log(`DashboardController.getWorkload() ::`, workload);
			setWorkloadData({
				labels: workload.map((item) => item.displayName),
				datasets: [
					{
						label: 'Projects',
						data: workload.map((item) => item.projects),
						backgroundColor: 'rgba(30, 144, 255, 1)'
					},
					{
						label: 'WIP',
						data: workload.map((item) => item.wips),
						backgroundColor: 'rgba(102, 187, 106, 1)'
					}
				]
			});
		});
	};

	const getPercent = (data) => {
		const total = data.length;
		const completed = data.filter((item) => item.status === 1).length;
		return ((completed / total) * 100 || 0).toFixed(2);
	};

	const projectPercent = useMemo(() => {
		return getPercent(projectSummaryData);
	}, [projectSummaryData]);

	const wipPercent = useMemo(() => {
		return getPercent(wipSummaryData);
	}, [wipSummaryData]);

	const barOptions = {
		indexAxis: 'y',
		scales: {
			x: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'Projects' // X-axis title
				}
			},
			y: {
				title: {
					display: true,
					text: 'Names' // Y-axis title
				}
			}
		},
		plugins: {
			legend: {
				display: true,
				position: 'top'
			}
		}
	};

	return (
		<>
			<div className="row my-2">
				<div className="col">
					<Breadcrumb
						items={[
							['home', `/`],
							['Dashboard', `/dashboard`]
						]}
					/>
				</div>
			</div>
			<div className="d-flex gap-2">
				<BackButton classNames="me-3" sizePx={30} />

				<div className="col">
					<h1>Dashboard</h1>
				</div>
			</div>
			<hr />

			<div className="row gap-3">
				<div className="d-md-flex flex-warp gap-3 align-items-stretch">
					<SummaryTable
						label={'Project'}
						data={projectSummaryData}
						header={['Project Name', 'Project Owner', 'Contract End', 'Status', 'Days']}
					/>
					<CircleProgress label={'Overall Project Progress'} percent={projectPercent} />
				</div>
				<div className="d-md-flex flex-warp gap-3  align-items-stretch">
					<SummaryTable
						label={'Wip'}
						data={wipSummaryData}
						header={['WIP Number', 'WIP Owner', 'Due Date', 'Status', 'Days']}
					/>
					<CircleProgress label={'Overall WIP Progress'} percent={wipPercent} />
				</div>

				{/* Workload Chart Card */}
				<ProtectedComponent
					requiredRoles={[ROLES.INFRA_PRESALE, ROLES.INFRA_ENGINEER, ROLES.CABLING, ROLES.DATA_CENTER]}>
					{workloadData && (
						<div className="col col-10">
							<div className="card p-4">
								<h2 className="my-1">Workload Chart</h2>
								<div className="row mb-3">
									<div className="col col-md-4">
										<div className="form-floating">
											<select className="form-select" id="selecedProject">
												<option value="0">All Time</option>
												<option value="1">The Year</option>
												<option value="2">6 Month</option>
												<option value="3">3 Month</option>
											</select>
											<label htmlFor="selecedProject">Time Range</label>
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
											<label htmlFor="selecedProject">Project Manager</label>
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
											<label htmlFor="selecedProject">Project Status</label>
										</div>
									</div>
								</div>
								<div>
									<Bar data={workloadData} options={barOptions} />
								</div>
							</div>
						</div>
					)}
				</ProtectedComponent>
			</div>
		</>
	);
}
