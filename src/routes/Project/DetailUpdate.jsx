import React from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Spinner, Tab, Tabs } from 'react-bootstrap';
import Style from './style.module.css';

import Breadcrumb from '../../components/Breadcrumb';
import ProjectController from '../../controllers/Projects';
import FileList from '../../components/Common/List/FileList/FileList';
import Dropzone from '../../components/Uploader/Dropzone';
import useAuth from '../../hooks/useAuth';
import { SwalDialog } from '../../components/Swal';
import BackButton from '../../components/Common/Button/BackButton';

function DetailUpdate() {
	let navigate = useNavigate();
	const { projectId } = useParams();
	const { user } = useAuth();

	const [activeKey, setActiveKey] = React.useState(null);
	const [project, setProject] = React.useState(null);
	const [initial, setInitial] = React.useState({});

	const [isLoading, setLoading] = React.useState(true);
	const [submitLoading, setSubmitLoading] = React.useState(false);
	const [error, setError] = React.useState(null);

	React.useEffect(() => {
		const roleToKeyMap = {
			presale: 'presale',
			cabling: 'cabling',
			'data-center': 'dataCenter'
		};

		for (const role in roleToKeyMap) {
			if (user.roles.some((r) => r === role || r === role + '-leader')) {
				setActiveKey(roleToKeyMap[role]);
				break;
			}
		}

		return;
	}, []);

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
					setInitial(project);
					setLoading(false);
				})
				.catch((err) => {
					console.error(`useEffect() ProjectController.getById() id=${projectId}`, err);
					setError(err);
				});
		}
		fetch();
		return () => {
			cancelTokenSource.cancel('cancel due to unmounted');
		};
	}, [projectId]);

	const tabs = [
		{ value: 'presale', label: 'Infra' },
		{ value: 'cabling', label: 'Cabling' },
		{ value: 'dataCenter', label: 'Data-Center' }
	];

	const fileList = [
		{ name: 'FileDiagram', label: 'File Diagram' },
		{ name: 'SurveyPicture', label: 'Survey Picture' },
		{ name: 'FileBom', label: 'BOM/BOQ' },
		{ name: 'FileConfig', label: 'Configuration' },
		{ name: 'FileTor', label: 'TOR/RFP' },
		{ name: 'FileComply', label: 'Comply' },
		{ name: 'FileProposal', label: 'Proposal' },
		{ name: 'FilePresentation', label: 'Presentation' },
		{ name: 'FilePoc', label: 'POC Document' },
		{ name: 'FileFloorPlan', label: 'Floor Plan/Heat Map' }
	];

	const surveyList = [
		{ name: 'RackSpace', label: 'Rack Space' },
		{ name: 'PowerConsumption', label: 'Power Consumption' },
		{ name: 'PlugType', label: 'Plug Type' },
		{ name: 'CableConnectorType', label: 'Cable Connector Type' },
		{ name: 'RequestSub', label: 'Request Sub.' },
		{ name: 'SurveyInfo', label: 'Survey info' }
	];

	const handleCheckboxChange = (e, surveyName) => {
		const checked = e.target.checked ? 1 : 0;
		setProject((prevProject) => ({
			...prevProject,
			[`${activeKey}${surveyName}Checked`]: checked
		}));
	};

	const handleInputChange = (e, surveyName) => {
		const value = e.target.value;
		setProject((prevProject) => ({
			...prevProject,
			[`${activeKey}${surveyName}Info`]: value
		}));
	};

	const handleUploadFile = (file, type) => {
		const key = `${activeKey}${type}`;
		setProject((prevProject) => {
			const updatedKeyData = prevProject[key] ? [...prevProject[key], file] : [file];
			return {
				...prevProject,
				[key]: updatedKeyData
			};
		});
	};

	const handleRemoveFile = (index, type) => {
		const key = `${activeKey}${type}`;
		setProject((prevProject) => {
			const currentFiles = prevProject[key] || [];
			const fileDeleted = currentFiles[index];
			const filteredFiles = currentFiles.filter((_, i) => i !== index);
			const fileDeletedIds =
				fileDeleted && fileDeleted.reference
					? prevProject.fileDeleted
						? [...prevProject.fileDeleted, fileDeleted.reference]
						: [fileDeleted.reference]
					: prevProject.fileDeleted || [];

			return {
				...prevProject,
				[key]: filteredFiles,
				fileDeleted: fileDeletedIds
			};
		});
	};

	const handleSubmit = () => {
		// Create a FormData object
		const formData = new FormData();

		surveyList.forEach((survey) => {
			const checkedKey = `${activeKey}${survey.name}Checked`;
			const infoKey = `${activeKey}${survey.name}Info`;

			if (initial[checkedKey] !== project[checkedKey] && project[checkedKey] !== undefined) {
				formData.append(checkedKey, project[checkedKey]);
			}
			if (initial[infoKey] !== project[infoKey] && project[infoKey] !== undefined && project[infoKey] !== '') {
				formData.append(infoKey, project[infoKey]);
			}
		});

		const appendFileArrayToFormData = (filesArray, keyPrefix) => {
			if (filesArray) {
				filesArray.forEach((file, index) => {
					//if new file
					if (file.path) formData.append(`${keyPrefix}`, file);
				});
			}
		};

		const appendArrayItems = (formData, name, array) => {
			if (array.length === 0) return formData.append(name, []);
			array.forEach((item) => {
				if (item) formData.append(name, item?._id || item);
			});
		};

		if (project.fileDeleted) appendArrayItems(formData, 'fileDeleted[]', project.fileDeleted);

		fileList.map((item) => {
			const fileField = `${activeKey}${item.name}`;
			appendFileArrayToFormData(project[fileField], fileField);
		});
		setSubmitLoading(true);

		let cancelTokenSource = axios.CancelToken.source();
		ProjectController.updateDetail({
			projectId: project._id,
			payload: formData,
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((result) => {
				console.log('result: ', result);
				setSubmitLoading(false);
				SwalDialog({
					icon: 'success',
					text: `${project.projectName} detail updated`,
					options: {}
				}).then(() => {
					return navigate(`/projects/${result._id}`);
				});
			})
			.catch((err) => {
				setSubmitLoading(false);
				console.log(`ERROR ProjectController.updateInitial()`, err);
				SwalDialog({
					icon: 'error',
					text: `${err.response?.data?.message || err.response?.data?.error || err}`,
					options: {}
				});
			});
	};

	const isDisable = (value) => {
		const userId = user._id;
		if (!user.roles?.includes(value)) return true;
		else if (
			value === 'presale' &&
			(project?.presales.some((person) => person._id === userId) ||
				project?.presaleLeaders.some((person) => person._id === userId))
		)
			return false;
		else if (
			value === 'cabling' &&
			(project?.cabling.some((person) => person._id === userId) || project?.cablingLeader?._id === user._id)
		)
			return false;
		else if (
			value === 'dataCenter' &&
			(project?.dataCenter.some((person) => person._id === userId) || project?.dataCenterLeader?._id === user._id)
		)
			return false;
		return true;
	};

	if (isLoading) return <div>Loading...</div>;

	return (
		<div>
			<Breadcrumb
				items={[
					['home', `/`],
					['Projects', `/projects`],
					[project?.projectName, `/projects/${project?._id}`],
					['Update Info', `/projects/update-detail`]
				]}
			/>
			<div className="text-center">
				<h2 className="position-absolute">
					<BackButton />
				</h2>
				<h1 className="text-truncate">Update Info</h1>
			</div>
			<section className={`rounded-4 border shadow p-5 my-4`}>
				<h3 className="mb-4">Survey Info</h3>
				<Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k)} justify className="mt-4">
					{tabs.map((tab) => (
						<Tab
							key={tab.value}
							eventKey={tab.value}
							title={
								<div
									className={`d-flex justify-content-center align-items-center ${
										activeKey === tab.value ? 'text-bg-primary' : ''
									}`}>
									<div>{tab.label}</div>
								</div>
							}
							disabled={isDisable(tab.value)}>
							{surveyList.map((survey, index) => (
								<div className="mt-4" key={index}>
									<label htmlFor={survey.name} className="form-check-label">
										{survey.label}
									</label>
									<div className="form-check form-switch mt-3 gap-3">
										<label className="form-check-label">
											<input
												className="form-check-input"
												type="checkbox"
												role="switch"
												checked={project?.[`${activeKey}${survey.name}Checked`] === 1}
												onChange={(e) => handleCheckboxChange(e, survey.name)}
											/>
											<span className={Style.isCheckedMinWidth} style={{ marginLeft: '0.5rem' }}>
												{project?.[`${activeKey}${survey.name}Checked`] === 1 ? 'Already Survey' : 'Not Survey'}
											</span>
										</label>
										<div className="col-8">
											<div className="input-group mt-2">
												<input
													id={survey.name}
													type="text"
													className="form-control"
													value={project?.[`${activeKey}${survey.name}Info`] || ''}
													onChange={(e) => handleInputChange(e, survey.name)}
												/>
											</div>
										</div>
									</div>
								</div>
							))}
							{fileList.map((filetype, index) => (
								<div key={index} className={`${Style.description} my-4`}>
									<label htmlFor={filetype.name} className={`${Style.labelMinWidth} text-nowrap mb-3`}>
										<h5>{filetype.label}: </h5>
									</label>
									<div className="col col-lg-6">
										<Dropzone
											id={filetype.name}
											caption={`Upload ${filetype.label}`}
											callbackUploadFile={(file) => handleUploadFile(file, filetype.name)}
											maxFiles={filetype.name === 'SurveyPicture' ? 30 : 10}
										/>
										<FileList
											file={project?.[`${activeKey}${filetype.name}`]}
											callbackRemoveFile={(index) => handleRemoveFile(index, filetype.name)}
										/>
									</div>
								</div>
							))}
							<div name="footer-button" className="d-flex mt-5 justify-content-end">
								<div type="reset" className="btn btn-danger btn-lg" onClick={() => navigate(-1)}>
									Cancel
								</div>
								<div
									type="submit"
									className={`btn btn-success btn-lg ms-4 ${submitLoading ? 'disabled' : ''}`}
									onClick={!submitLoading ? handleSubmit : null}
									style={{ pointerEvents: submitLoading ? 'none' : 'auto' }}>
									{submitLoading ? (
										<>
											<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
											{' Loading...'}
										</>
									) : (
										'Save'
									)}
								</div>
							</div>
						</Tab>
					))}
				</Tabs>
			</section>
		</div>
	);
}

export default DetailUpdate;
