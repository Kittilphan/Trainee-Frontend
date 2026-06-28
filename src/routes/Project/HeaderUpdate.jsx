import { useEffect, useState, useRef, useContext } from 'react';
import Select, { components } from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import Style from './style.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faL, faUser } from '@fortawesome/free-solid-svg-icons';

import CustomerController from '../../controllers/Customers';
import ProjectController from '../../controllers/Projects';

import Breadcrumb from '../../components/Breadcrumb';
import Profile from '../../components/Common/Profile/Profile';
import AutoResizingTextarea from '../../components/AutoResizingTextarea/AutoResizingTextarea';
import DropZone from '../../components/Uploader/Dropzone/index';
import FileList from '../../components/Common/List/FileList/FileList';
import POFileList from '../../components/Common/List/FileList/POFileList';
import { SwalConfirm, SwalDialog } from '../../components/Swal';

import AssignRole from '../../components/Common/Modal/AssignRole/AssignRole';
import TempCustomer from '../../components/Common/Modal/TempCustomer/TempCustomer';

import add from '../../assets/icons/add.png';
import document from '../../assets/images/document.png';
import ProtectedComponent from '../../components/ProtectedComponent';
import BackButton from '../../components/Common/Button/BackButton';
import BadgeCardStatus from '../../components/BadgeStatus';
import { Spinner } from 'react-bootstrap';
import { ROLES } from '../../constants/users';
import AllUsersContext from '../../contexts/AllUsersContext';
import ContentRenderer from '../../components/ContentRenderer';

const CustomSingleValue = ({ children, ...props }) => {
	const { data } = props;

	return (
		<components.SingleValue {...props}>
			{children}
			{data.isTemp ? <span className="ms-2 badge text-bg-danger"> TEMP</span> : <></>}
		</components.SingleValue>
	);
};

const HeaderUpdate = () => {
	let navigate = useNavigate();

	const { isLoadingUser, getUserFilter } = useContext(AllUsersContext);

	const { projectId } = useParams();
	const dropdownRef = useRef(null);
	const [project, setProject] = useState({});
	const [initial, setInitial] = useState({});

	const [optionCustomers, setOptionCustomers] = useState([]);
	const [smgOptions, setSmgOptions] = useState([]);
	const [roleModalShow, setRoleModalShow] = useState(false);
	const [customerModalShow, setCustomerModalShow] = useState(false);

	const [isLoading, setLoading] = useState(true);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [customerLoading, setCustomerLoading] = useState(true);
	const [error, setError] = useState();

	useEffect(() => {
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
					const customer = project.customer;
					setProject({
						...project,
						customer: {
							value: customer?._id,
							label: customer?.name || project.customerName,
							name: customer?.name || project.customerName,
							...customer
						},
						smg: project.smg ? { value: project.smg._id, label: project.smg.displayName } : undefined
					});
					// setInitial({...project}); //i dont know why. when i comment this initail = project when i uncomment initial always = project (filePO)
					setLoading(false);
				})
				.catch((err) => {
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
			cancelTokenSource.cancel('cancel useEffect() due to unmounted');
		};
	}, [projectId]);

	useEffect(() => {
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
					setInitial({ ...project }); //i dont know why. when i comment this initail = project when i uncomment initial always = project (filePO)
				})
				.catch((err) => {
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
			cancelTokenSource.cancel('cancel useEffect() due to unmounted');
		};
	}, [projectId]);

	useEffect(() => {
		let cancelTokenSource = axios.CancelToken.source();
		async function fetchCustomerOptions() {
			const data = await CustomerController.list({
				fields: {
					areAll: true,
					fields: { _id: 1, name: 1, alias: 1 },
					filter: [{ field: 'isTemp', operator: 'is', value: 'false' }]
				},
				options: { cancelToken: cancelTokenSource.token }
			});
			setOptionCustomers(
				data?.customers
					?.map((v) => {
						return { value: v._id, label: `${v.alias ? `[${v.alias}] ` : ''}${v.name}` };
					})
					.sort(customerSort)
			);
			setCustomerLoading(false);
		}
		fetchCustomerOptions();

		return () => {
			cancelTokenSource.cancel('cancel due to unmounted');
		};
	}, []);

	useEffect(() => {
		const fetchSMG = async () => {
			const result = await getUserFilter([ROLES.SMG]);
			const mapped = result.map((user) => ({ value: user._id, label: user.displayName }));
			if (mapped.length > 0) setSmgOptions(mapped);
		};

		const mapped = fetchSMG();
		return;
	}, []);

	const customerSort = (a, b) => {
		const isSpecialChar = (str) => /^[^a-zA-Z]/.test(str);

		if (isSpecialChar(a.label) && !isSpecialChar(b.label)) return -1;
		if (!isSpecialChar(a.label) && isSpecialChar(b.label)) return 1;
		return a.label.localeCompare(b.label);
	};

	const handleChange = (e) => {
		const { id, name, value } = e.target;
		const label = id || name;

		if (label === 'state') {
			const stateLabels = {
				0: 'New',
				1: 'Proposing',
				2: 'Implementing',
				3: 'Done',
				4: 'Canceled'
			};
			SwalConfirm({
				icon: 'warning',
				text: `Are you sure to change the project state to "${stateLabels[value]}"?`,
				callbackConfirm: () => {
					setProject((prevProject) => ({ ...prevProject, [label]: value }));
				}
			});
			// Close the dropdown
			if (dropdownRef.current) {
				dropdownRef.current.click();
			}
		} else setProject((prevProject) => ({ ...prevProject, [label]: value }));
	};

	const handleCustomerChange = (selectedOption) => {
		setProject((prevProject) => ({
			...prevProject,
			customer: { ...selectedOption, isTemp: 0 }
		}));
	};

	const handleTempCustomerChange = (selectedOption) => {
		setProject((prevProject) => ({
			...prevProject,
			customer: { ...selectedOption, isTemp: 1 }
		}));
		setCustomerModalShow(false);
	};

	const handleSMGChange = (selectedOption) => {
		setProject((prevProject) => ({
			...prevProject,
			smg: selectedOption
		}));
	};

	const handleUploadFile = (file, type) => {
		setProject((prevProject) => {
			const updatedFiles = prevProject[type] || [];
			return {
				...prevProject,
				[type]: [...updatedFiles, file]
			};
		});
	};

	const handleRemoveFile = (index, type) => {
		setProject((prevProject) => {
			const currentFiles = prevProject[type] || [];
			const fileDeleted = currentFiles[index];
			const filteredFiles = currentFiles.filter((_, i) => i !== index);

			const fileDeletedIds = fileDeleted
				? // use _id for filePO
				  prevProject.fileDeleted
					? [...prevProject.fileDeleted, fileDeleted.reference ? fileDeleted.reference : fileDeleted._id]
					: [fileDeleted.reference ? fileDeleted.reference : fileDeleted._id]
				: prevProject.fileDeleted || [];

			return {
				...prevProject,
				[type]: filteredFiles,
				fileDeleted: fileDeletedIds
			};
		});
	};

	const handleSubmitRoles = ({
		pmProjectStatus,
		pmProjectRemark,
		pmProject,
		presaleLeaders,
		cablingLeader,
		dataCenterLeader,
		presaleOwner,
		cablingOwner,
		dataCenterOwner
	}) => {
		const formatLeader = (person) => (person ? { _id: person.value, displayName: person.label } : null);

		setProject((prevProject) => ({
			...prevProject,
			pmProjectStatus,
			pmProjectRemark,
			pmProject: formatLeader(pmProject),
			presaleLeaders: presaleLeaders.map(formatLeader),
			cablingLeader: formatLeader(cablingLeader),
			dataCenterLeader: formatLeader(dataCenterLeader),
			presales: presaleOwner.map(formatLeader),
			cabling: cablingOwner.map(formatLeader),
			dataCenter: dataCenterOwner.map(formatLeader)
		}));
	};

	const setCustomer = () => {
		if (project.customer) {
			const { label, value, ...rest } = project.customer;
			return {
				_id: value,
				name: label,
				...rest
			};
		}
		return;
	};

	const handleSubmit = () => {
		if (!project?.projectName?.trim()) {
			SwalDialog({
				icon: 'warning',
				text: 'Project name is required',
				options: {}
			});
			return;
		}

		const include = [
			'description',
			'scopeOfWork',
			'outOfWork',
			'remark',
			'projectName',
			'projectCode',
			'state',
			'projectStartAt',
			'projectEndAt',
			'contractStartAt',
			'contractEndAt',
			'pmProjectStatus',
			'pmProjectRemark'
		];

		// Create a FormData object
		const formData = new FormData();

		Object.keys(project).forEach((key) => {
			if (
				include.includes(key) &&
				initial[key] !== project[key] &&
				project[key] !== null &&
				project[key] !== undefined
			) {
				formData.append(key, project[key]);
			}
		});

		const getValueByPath = (obj, path) => {
			return path
				.split(/[\.\[\]\'\"]/)
				.filter(Boolean)
				.reduce((acc, key) => acc && acc[key], obj);
		};

		const isUpdated = (data, name) => {
			const initialValue = getValueByPath(initial, name);

			if (initialValue === undefined && data === null) return false;
			if (data === initialValue) return false;
			else if (Array.isArray(data)) {
				console.log(name, '1');
				console.log(data, initialValue);

				if (!Array.isArray(initialValue) || data.length !== initialValue.length) return true;

				for (let index in data) {
					const dataItem = data[index];
					const initialItem = initialValue[index];

					if (typeof dataItem === 'object' && typeof initialItem === 'object') {
						for (let key in dataItem) {
							if (dataItem[key] !== initialItem[key]) return true;
						}
					} else if (dataItem !== initialItem) {
						return true;
					}
				}
			} else if (typeof data === 'object' && typeof initialValue === 'object') {
				console.log(name, '2');
				console.log(data, initialValue);

				if (initialValue === null && data !== null) return true;
				else if (initialValue !== null && data === null) return true;
				for (let key in data) {
					if (initialValue[key] !== data[key]) return true;
				}
			} else if (data !== initialValue) {
				return true;
			}

			return false;
		};

		const appendArrayItems = (formData, name, array) => {
			if (array.length === 0 || array[0] === '') return formData.append(name, []);
			array.forEach((item) => {
				if (item) formData.append(name, item?._id || item);
			});
		};

		const customer = setCustomer();
		const {
			pmProject,
			presaleLeaders,
			cablingLeader,
			dataCenterLeader,
			presales,
			cabling,
			dataCenter,
			smg,
			fileDeleted
		} = project;
		const pmUpdated = isUpdated(pmProject, 'pmProject');
		const presaleLeadersUpdated = isUpdated(presaleLeaders, 'presaleLeaders');
		const cablingLeaderUpdated = isUpdated(cablingLeader, 'cablingLeader');
		const dataCenterLeaderUpdated = isUpdated(dataCenterLeader, 'dataCenterLeader');
		const presalesUpdated = isUpdated(presales, 'presales');
		const cablingUpdated = isUpdated(cabling, 'cabling');
		const dataCenterUpdated = isUpdated(dataCenter, 'dataCenter');
		const smgUpdated = smg?.value !== initial.smg?._id;

		const sendData = () => {
			if (isUpdated(customer, 'customer')) formData.append('customer', JSON.stringify(customer));
			if (pmUpdated) formData.append('pmProject', pmProject?._id);
			if (presaleLeadersUpdated) appendArrayItems(formData, 'presaleLeaders[]', presaleLeaders);
			if (cablingLeaderUpdated) formData.append('cablingLeader', cablingLeader?._id);
			if (dataCenterLeaderUpdated) formData.append('dataCenterLeader', dataCenterLeader?._id);
			if (presalesUpdated) appendArrayItems(formData, 'presales[]', presales);
			if (cablingUpdated) appendArrayItems(formData, 'cabling[]', cabling);
			if (dataCenterUpdated) appendArrayItems(formData, 'dataCenter[]', dataCenter);
			if (isUpdated(fileDeleted, 'fileDeleted')) appendArrayItems(formData, 'fileDeleted[]', fileDeleted);
			if (smgUpdated) formData.append('smg', smg.value);

			const appendFileArrayToFormData = (filesArray, keyPrefix) => {
				if (filesArray) {
					const xoNumbersSet = new Set();
					const duplicateXoNumbers = [];

					filesArray.forEach((file, index) => {
						if (file.path) formData.append(`${keyPrefix}`, file);

						if (keyPrefix === 'filePO' && isUpdated(file.xoNumbers, `filePO[${index}].xoNumbers`)) {
							file.xoNumbers.forEach((xoNumber) => {
								const xo = xoNumber.xoNumber;
								if (xoNumbersSet.has(xo)) {
									duplicateXoNumbers.push(xo);
								} else {
									xoNumbersSet.add(xo);
								}
							});

							if (file.xoNumbers.length > 0) {
								formData.append(`xoNumbers[${index}]`, JSON.stringify(file.xoNumbers));
							}
						}
						if (keyPrefix === 'filePO' && isUpdated(file.remark, `filePO[${index}].remark`)) {
							formData.append(`remarkPO[${index}]`, file.remark || '');
						}
					});

					if (duplicateXoNumbers.length > 0) {
						SwalDialog({
							icon: 'info',
							text: `Duplicate XO Numbers found: ${duplicateXoNumbers.join(', ')}`,
							options: {}
						});
						throw new Error(`Duplicate XO Numbers found: ${duplicateXoNumbers.join(', ')}`);
					}
				}
			};

			appendFileArrayToFormData(project.filePO, 'filePO');
			appendFileArrayToFormData(project.fileQuotation, 'fileQuotation');
			appendFileArrayToFormData(project.presaleFileBom, 'presaleFileBom');
			appendFileArrayToFormData(project.presaleFileTor, 'presaleFileTor');
			appendFileArrayToFormData(project.fileOther, 'fileOther');

			const isEmptyFormData = (formData) => ![...formData.keys()].length;
			console.log(isEmptyFormData(formData));
			if (isEmptyFormData(formData)) {
				SwalDialog({
					icon: 'info',
					text: `Payload is Empty.`,
					options: {}
				}).then(() => {
					return navigate(`/projects/${project._id}`);
				});
				return;
			}

			let cancelTokenSource = axios.CancelToken.source();
			setSubmitLoading(true);
			ProjectController.updateInitial({
				projectId: project._id,
				payload: formData,
				options: { cancelToken: cancelTokenSource.token }
			})
				.then((result) => {
					console.log('result: ', result);
					SwalDialog({
						icon: 'success',
						text: `${project.projectName} updated`,
						options: {}
					}).then(() => {
						return navigate(`/projects/${result._id}`);
					});
				})
				.catch((err) => {
					console.error(`ERROR ProjectController.updateInitial()`, err);
					SwalDialog({
						icon: 'error',
						text: `${err.response?.data?.message || err.response?.data?.error || err}`,
						options: {}
					}).then(() => {
						if (err.response?.status === 403 || err.response?.status === 404) return navigate(`/projects`);
					});
				})
				.finally(() => setSubmitLoading(false));
		};

		if (
			(pmUpdated && pmUpdated) ||
			(presaleLeadersUpdated && presaleLeaders.length > 0) ||
			(cablingLeaderUpdated && cablingLeader) ||
			(dataCenterLeaderUpdated && dataCenterLeader) ||
			(presalesUpdated && presales) ||
			(cablingUpdated && cabling) ||
			(dataCenterUpdated && dataCenter) ||
			smgUpdated
		) {
			const roles = [
				pmUpdated && pmUpdated && `PM: ${pmProject.displayName}`,
				presaleLeadersUpdated &&
					presaleLeaders.length > 0 &&
					`Infra Leader: ${presaleLeaders.map((leader) => leader.displayName)}`,
				cablingLeaderUpdated && cablingLeader && `Cabling Leader: ${cablingLeader.displayName}`,
				dataCenterLeaderUpdated && dataCenterLeader && `Data Center Leader: ${dataCenterLeader.displayName}`,
				presalesUpdated && presales && `Infra: ${presales.map((leader) => leader.displayName)}`,
				cablingUpdated && cabling && `Cabling: ${cabling.map((leader) => leader.displayName)}`,
				dataCenterUpdated && dataCenter && `Data Center: ${dataCenter.map((leader) => leader.displayName)}`,
				smgUpdated && `SMG: ${smg.displayName || smg.label}`
			].filter(Boolean);

			const confirmationText = `
				<h3>Are you sure you want to send the mail to the following user(s)?</h3>
				<br/>
				<ul style="text-align: left;">
				  ${roles.map((role) => `<li>${role}</li>`).join('')}
				</ul>
			  `;

			SwalConfirm({
				icon: 'warning',
				options: {
					html: confirmationText,
					showCancelButton: true,
					confirmButtonText: 'Send it!',
					cancelButtonText: 'No, cancel',
					title: ''
				},
				callbackConfirm: () => {
					sendData();
					return;
				},
				callbackCancel: () => {
					return;
				}
			});
		} else sendData();
	};

	const dateFormat = (date) => {
		return date ? new Date(date).toLocaleDateString('en-GB') : 'Unknown';
	};

	const dateFormatForUpdate = (date) => {
		return date ? new Date(date).toISOString().split('T')[0] : '';
	};

	const getButtonClass = () => {
		switch (project.state) {
			case 0:
				return 'btn-outline-secondary';
			case 1:
				return 'btn-outline-warning';
			case 2:
				return 'btn-outline-primary';
			case 3:
				return 'btn-outline-success';
			case 4:
				return 'btn-outline-danger';
			default:
				return 'btn-outline-info';
		}
	};

	if (isLoading) return <div>Loading...</div>;

	return (
		<div>
			<Breadcrumb
				items={[
					['home', `/`],
					['Projects', `/projects`],
					[initial?.projectName, `/projects/${initial?._id}`],
					['Update Project', `/projects/update-header`]
				]}
			/>
			<div className="text-center">
				<h2 className="position-absolute">
					<BackButton />
				</h2>
				<h1 className="text-truncate">Update Project</h1>
			</div>
			<section className={`rounded-4 border shadow p-5 my-4`}>
				<ProtectedComponent requiredRoles={[ROLES.SALE]}>
					<div className="d-flex justify-content-between flex-wrap">
						<div className="flex-fill me-3">
							<div className="mb-3">
								<label htmlFor="projectName" className="form-label">
									Project Name<span className="text-danger"> *</span>
								</label>
								<div className="input-group">
									<input
										type="text"
										className="form-control"
										id="projectName"
										value={project?.projectName}
										onChange={handleChange}
									/>
								</div>
							</div>
							<div className="input-group mb-3">
								<label htmlFor="projectCode" className="input-group-text">
									Project Code
								</label>
								<input
									type="text"
									className="form-control"
									aria-label="projectCode"
									id="projectCode"
									value={project?.projectCode}
									onChange={handleChange}
								/>
							</div>
						</div>
						<div className="flex-fill">
							<div className="mb-3">
								<label className="form-label">ระยะเวลา</label>
								<div className="input-group">
									<label htmlFor="projectStartAt" className="input-group-text">
										ระยะเวลาโครงการ
									</label>
									<input
										type="date"
										className="form-control"
										id="projectStartAt"
										value={dateFormatForUpdate(project?.projectStartAt)}
										onChange={handleChange}
										max={project?.projectEndAt}
									/>
									<label htmlFor="projectEndAt" className="input-group-text">
										-
									</label>
									<input
										type="date"
										className="form-control"
										id="projectEndAt"
										value={dateFormatForUpdate(project?.projectEndAt)}
										onChange={handleChange}
										min={project?.projectStartAt}
									/>
								</div>
							</div>
							<div className="mb-3">
								<div className="input-group">
									<label htmlFor="contractStartAt" className="input-group-text">
										ระยะเวลาสัญญา
									</label>
									<input
										type="date"
										className="form-control"
										id="contractStartAt"
										value={dateFormatForUpdate(project?.contractStartAt)}
										onChange={handleChange}
										max={project?.contractEndAt}
									/>
									<label htmlFor="contractEndAt" className="input-group-text">
										-
									</label>
									<input
										type="date"
										className="form-control"
										id="contractEndAt"
										value={dateFormatForUpdate(project?.contractEndAt)}
										onChange={handleChange}
										min={project?.contractStartAt}
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="d-flex align-items-center">
						<Select
							placeholder={'Select Customer'}
							options={optionCustomers}
							className={`col-5 border rounded ${project.customer?.isTemp === 1 ? 'border-danger' : ''}`}
							value={project.customer}
							onChange={handleCustomerChange}
							isLoading={customerLoading}
							components={{ SingleValue: CustomSingleValue }}
						/>
						<div
							to={`/projects/new`}
							className="btn btn-outline-primary text-decoration-none ms-3"
							onClick={() => setCustomerModalShow(true)}>
							<FontAwesomeIcon icon={faUser} className="me-1" />
							<span>Temporary Customer</span>
						</div>
					</div>
				</ProtectedComponent>
				<ProtectedComponent
					requiredRoles={[
						ROLES.INFRA_PRESALE,
						ROLES.INFRA_PRESALE_LEADER,
						ROLES.CABLING_PRESALE,
						ROLES.CABLING_PRESALE_LEADER,
						ROLES.DATA_CENTER_PRESALE,
						ROLES.PROJECT_MANAGER_LEADER
					]}>
					<div className={Style.header}>
						<div>
							<div className="card-title">
								<h3 className="text-gray d-flex">
									<ContentRenderer
										value={
											(project.customer?.alias ? `[${project.customer.alias}] ` : '') + project.customer?.name ||
											project.customerName
										}
									/>

									{project.customer?.isTemp ? <span className="ms-2 badge text-bg-danger"> TEMP</span> : <></>}
								</h3>
								<h2 className="col d-flex flex-wrap">
									<ContentRenderer className="text-wrap text-truncate" value={project.projectName} />
									<span className="text-gray">{project.projectCode && <span>#{project.projectCode}</span>}</span>
								</h2>
								<h4 className="text-gray mt-1 text-truncate">
									Created by {project.createdBy} at {dateFormat(project.createdAt)}{' '}
								</h4>
								{project.updatedBySaleName && (
									<h4 className="text-gray mt-1 text-truncate">
										Updated by {project.updatedBySaleName} [SALE] at {dateFormat(project.updatedBySaleAt)}
									</h4>
								)}
								{project.updatedByPresaleName && (
									<h4 className="text-gray mt-1 text-truncate">
										Updated by {project.updatedByPresaleName} [Presale] at {dateFormat(project.updatedByPresaleAt)}
									</h4>
								)}
								{project.updatedByCablingName && (
									<h4 className="text-gray mt-1 text-truncate">
										Updated by {project.updatedByCablingName} [Cabling] at {dateFormat(project.updatedByCablingAt)}
									</h4>
								)}
								{project.updatedByDataCenterName && (
									<h4 className="text-gray mt-1 text-truncate">
										Updated by {project.updatedByDataCenterName} [Data Center] at{' '}
										{dateFormat(project.updatedByDataCenterAt)}
									</h4>
								)}
							</div>
						</div>
						<div className={`${Style.statusInfo} d-flex flex-column gap-4`}>
							<div className="d-flex">
								<BadgeCardStatus status={project.state} />
							</div>
							<div className="d-flex flex-wrap">
								<h4 className="mt-2">ระยะเวลาโครงการ: </h4>
								<h4 className="ms-2 mt-2">
									{dateFormat(project.projectStartAt)} - {dateFormat(project.projectEndAt)}
								</h4>
							</div>
							<div className="d-flex flex-wrap">
								<h4 className="mt-2">ระยะเวลาสัญญา: </h4>
								<h4 className="ms-2 mt-2">
									{dateFormat(project.contractStartAt)} - {dateFormat(project.contractEndAt)}
								</h4>
							</div>
						</div>
					</div>
					<div className="my-3">
						{project.filePO?.length > 0 && (
							<>
								<h4>Confirmed Order Files</h4>
								<div className="d-flex flex-wrap">
									{project.filePO.map((file, index) => (
										<div className="d-flex ms-3 mt-3" key={index}>
											<img src={document} alt="Confirmed Order Files" className={Style.document} />
											<div className="ms-1">
												<button className="mb-1 link-primary underline-on-hover">
													<a
														href={`/api/files/${file.attachmentType || file.type}/${file.reference || file._id}/${
															file.description || file.originalName
														}`}
														target="_blank">
														{file.description || file.originalName}
													</a>
												</button>
												<h6 className="text-gray">{file.uploadedBy}</h6>
												<div className="mt-1 d-flex gap-2 flex-wrap">
													{file.xoNumbers?.map((xoNumber, index) => (
														<div key={index} className="badge pt-2 text-bg-secondary">
															{xoNumber.xoNumber}
														</div>
													))}
												</div>
											</div>
										</div>
									))}
								</div>
							</>
						)}
					</div>
				</ProtectedComponent>

				<div className="d-flex flex-wrap justify-content-between gap-3 mt-3 mb-5">
					<ProtectedComponent requiredRoles={[ROLES.SALE, ROLES.PROJECT_MANAGER_LEADER]}>
						<div className="mt-3">
							<h4 className={Style.headerTitle} onClick={() => setRoleModalShow(true)}>
								Choose Project Leader/PM
							</h4>
							<div className="mt-2 d-flex flex-wrap gap-5">
								<div className="d-flex flex-wrap gap-3">
									{project?.pmProjectStatus === 2 && project?.pmProject ? (
										<Profile
											role={'PM Project'}
											username={project.pmProject.displayName}
											isUpdate={true}
											onClick={() => setRoleModalShow(true)}
										/>
									) : project?.pmProjectStatus === 1 ? (
										<Profile
											username={'Requesting PM'}
											role={' '}
											isRequesting={1}
											isUpdate={true}
											onClick={() => setRoleModalShow(true)}
										/>
									) : (
										project?.pmProjectStatus === 3 && (
											<Profile
												username={'PM Rejected'}
												role={' '}
												isRequesting={2}
												isUpdate={true}
												onClick={() => setRoleModalShow(true)}
											/>
										)
									)}
								</div>
								<ProtectedComponent requiredRoles={[ROLES.SALE]}>
									<div className="d-flex flex-wrap gap-3">
										{project?.presaleLeaders?.length > 0 &&
											project.presaleLeaders.map((user, index) => (
												<Profile
													key={index}
													role={'Infra Leader'}
													username={user.displayName}
													isUpdate={true}
													onClick={() => setRoleModalShow(true)}
												/>
											))}
										{project?.cablingLeader != null && (
											<Profile
												role={'Cabling Leader'}
												username={project.cablingLeader.displayName}
												isUpdate={true}
												onClick={() => setRoleModalShow(true)}
											/>
										)}
										{project?.dataCenterLeader != null && (
											<Profile
												role={'Data Center Leader'}
												username={project.dataCenterLeader.displayName}
												isUpdate={true}
												onClick={() => setRoleModalShow(true)}
											/>
										)}
										<div className="my-3 text-center">
											<img
												src={add}
												alt="add pm icon"
												className={Style.profileIcon}
												onClick={() => setRoleModalShow(true)}
											/>
										</div>
									</div>
								</ProtectedComponent>
							</div>
						</div>
					</ProtectedComponent>
					<ProtectedComponent requiredPersons={project.presaleLeaders}>
						<div className="mt-3">
							<h4 className={Style.headerTitle} onClick={() => setRoleModalShow(true)}>
								Infra Presale
							</h4>
							<div className="d-flex flex-wrap gap-3  mt-3">
								{project?.presales?.length > 0 ? (
									project.presales.map((user, index) => (
										<Profile
											key={index}
											role={'Infra Presale'}
											username={user.displayName}
											isUpdate={true}
											onClick={() => setRoleModalShow(true)}
										/>
									))
								) : (
									<></>
								)}
								<div className="my-3 text-center">
									<img
										src={add}
										alt="add pm icon"
										className={Style.profileIcon}
										onClick={() => setRoleModalShow(true)}
									/>
								</div>
							</div>
						</div>
					</ProtectedComponent>
					<ProtectedComponent requiredPersons={project.cablingLeader}>
						<div className="mt-3">
							<h4 className={Style.headerTitle} onClick={() => setRoleModalShow(true)}>
								Cabling Owner
							</h4>
							<div className="d-flex flex-wrap gap-3  mt-3">
								{project?.cabling?.length > 0 ? (
									project.cabling.map((user, index) => (
										<Profile
											key={index}
											role={'Cabling Owner'}
											username={user.displayName}
											isUpdate={true}
											onClick={() => setRoleModalShow(true)}
										/>
									))
								) : (
									<></>
								)}
								<div className="my-3 text-center">
									<img
										src={add}
										alt="add pm icon"
										className={Style.profileIcon}
										onClick={() => setRoleModalShow(true)}
									/>
								</div>
							</div>
						</div>
					</ProtectedComponent>
					<ProtectedComponent requiredPersons={project.dataCenterLeader}>
						<div className="mt-3">
							<h4 className={Style.headerTitle} onClick={() => setRoleModalShow(true)}>
								Data Center Owner
							</h4>
							<div className="d-flex flex-wrap gap-3  mt-3">
								{project?.dataCenter?.length > 0 ? (
									project.dataCenter.map((user, index) => (
										<Profile
											key={index}
											role={'Data Center Owner'}
											username={user.displayName}
											isUpdate={true}
											onClick={() => setRoleModalShow(true)}
										/>
									))
								) : (
									<></>
								)}
								<div className="my-3 text-center">
									<img
										src={add}
										alt="add pm icon"
										className={Style.profileIcon}
										onClick={() => setRoleModalShow(true)}
									/>
								</div>
							</div>
						</div>
					</ProtectedComponent>
				</div>
				<div className={`${Style.headerTitle} row gap-3`}>
					<div className="d-inline d-lg-flex">
						<label htmlFor="description" className="text-nowrap me-3 mb-2 col-8 col-lg-2">
							<h4>คำอธิบายโครงการ: </h4>
						</label>
						<AutoResizingTextarea id="description" value={project?.description} onChange={handleChange} />
					</div>
					<div className="d-inline d-lg-flex">
						<label htmlFor="scopeOfWork" className="text-nowrap me-3 mb-2 col-8 col-lg-2">
							<h4>ขอบเขตการทำงาน: </h4>
						</label>
						<AutoResizingTextarea id="scopeOfWork" value={project?.scopeOfWork} onChange={handleChange} />
					</div>
					<div className="d-inline d-lg-flex">
						<label htmlFor="outOfWork" className="text-nowrap me-3 mb-2 col-8 col-lg-2">
							<h4>นอกเหนือขอบเขตการทำงาน: </h4>
						</label>
						<AutoResizingTextarea id="outOfWork" value={project?.outOfWork} onChange={handleChange} />
					</div>
					<div className="d-inline d-lg-flex">
						<label htmlFor="remark" className="text-nowrap me-3 mb-2 col-8 col-lg-2">
							<h4>หมายเหตุ: </h4>
						</label>
						<AutoResizingTextarea id="remark" value={project?.remark} onChange={handleChange} />
					</div>

					<ProtectedComponent requiredRoles={[ROLES.SALE]}>
						{/* <div className="d-inline d-lg-flex">
							<label htmlFor="fileQuotation" className="me-3 mb-3">
								<h4 className="text-nowrap">Customer Quotation: </h4>
								<h5 className="text-danger">** มีคุณเท่านั้นที่สามารถเรียกดูไฟล์นี้ได้</h5>
							</label>
							<div>
								<DropZone
									id="fileQuotation"
									caption={`Upload Customer Quotation`}
									callbackUploadFile={(file) => handleUploadFile(file, 'fileQuotation')}
								/>

								<FileList
									file={project?.fileQuotation}
									callbackRemoveFile={(index) => handleRemoveFile(index, 'fileQuotation')}
								/>
							</div>
						</div> */}

						<div className="d-inline d-lg-flex">
							<label htmlFor="filePO" className="me-3 mb-3 col-lg-2">
								<h4 className="text-nowrap">Confirmed Order Files: </h4>
								<div className="text-danger">PO/Pif/Final BOM/Signed Back Quotation/E-Mail Confirm/ etc.</div>
							</label>
							<div>
								<DropZone
									id="filePO"
									caption={`Upload Confirmed Order Files`}
									callbackUploadFile={(file) => handleUploadFile(file, 'filePO')}
								/>
								<POFileList
									file={project?.filePO}
									callbackRemoveFile={(index) => handleRemoveFile(index, 'filePO')}
									setProject={setProject}
								/>
							</div>
						</div>

						<div className="d-inline d-lg-flex">
							<label htmlFor="fileBOM" className="text-nowrap me-3 mb-3 col-2">
								<h4 className="text-nowrap">BOM/BOQ: </h4>
								<div className="text-danger">Draft BOM/BOQ from Customer/Vendor</div>
							</label>
							<div>
								<DropZone
									id="fileBOM"
									caption={`Upload BOM/BOQ`}
									callbackUploadFile={(file) => handleUploadFile(file, 'presaleFileBom')}
								/>

								<FileList
									file={project?.presaleFileBom}
									callbackRemoveFile={(index) => handleRemoveFile(index, 'presaleFileBom')}
								/>
							</div>
						</div>

						<div className="d-inline d-lg-flex">
							<label htmlFor="fileTOR" className="text-nowrap me-3 mb-3 col-2">
								<h4 className="text-nowrap">TOR/RFP: </h4>
							</label>
							<div>
								<DropZone
									id="fileTOR"
									caption={`Upload TOR/RFP`}
									callbackUploadFile={(file) => handleUploadFile(file, 'presaleFileTor')}
								/>

								<FileList
									file={project?.presaleFileTor}
									callbackRemoveFile={(index) => handleRemoveFile(index, 'presaleFileTor')}
								/>
							</div>
						</div>
						<div className="d-inline d-lg-flex">
							<label htmlFor="fileOther" className="text-nowrap me-3 mb-3 col-2">
								<h4 className="text-nowrap">Other File: </h4>
								<div className="text-danger">(Diagram/Floor Plan/Email etc.)</div>
							</label>
							<div>
								<DropZone
									id="fileOther"
									caption={`Upload Other File`}
									callbackUploadFile={(file) => handleUploadFile(file, 'fileOther')}
								/>

								<FileList
									file={project?.fileOther}
									callbackRemoveFile={(index) => handleRemoveFile(index, 'fileOther')}
								/>
							</div>
						</div>

						<div className="d-inline d-lg-flex">
							<label className="text-nowrap me-3 mb-3 col-2">
								<h4 className="text-nowrap">CC to SMG: </h4>
							</label>
							<div className="col">
								<Select
									placeholder={'Select SMG'}
									options={smgOptions}
									className={`col-lg-2 border rounded`}
									value={project.smg}
									onChange={handleSMGChange}
									isLoading={isLoadingUser}
								/>
							</div>
						</div>
					</ProtectedComponent>
				</div>
				<div name="footer-button" className="d-flex flex-wrap">
					<div className="col dropdown mt-5">
						<ProtectedComponent requiredRoles={[ROLES.SALE]}>
							<button
								className={`btn btn-lg dropdown-toggle ${getButtonClass()}`}
								type="button"
								id="dropdownMenuButton"
								data-bs-toggle="dropdown"
								aria-haspopup="true"
								aria-expanded="false"
								ref={dropdownRef}>
								{project.state === 0
									? 'New'
									: project.state === 1
									? 'Proposing'
									: project.state === 2
									? 'Implementing'
									: project.state === 3
									? 'Done'
									: 'Canceled'}
							</button>
							<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
								<a className="dropdown-item" onClick={() => handleChange({ target: { name: 'state', value: 0 } })}>
									<span className="dot bg-secondary"></span>
									New
								</a>
								<a className="dropdown-item" onClick={() => handleChange({ target: { name: 'state', value: 1 } })}>
									<span className="dot bg-warning"></span>
									Proposing
								</a>
								<a className="dropdown-item" onClick={() => handleChange({ target: { name: 'state', value: 2 } })}>
									<span className="dot bg-primary"></span>
									Implementing
								</a>
								<a className="dropdown-item" onClick={() => handleChange({ target: { name: 'state', value: 3 } })}>
									<span className="dot bg-success"></span>
									Done
								</a>
								<a className="dropdown-item" onClick={() => handleChange({ target: { name: 'state', value: 4 } })}>
									<span className="dot bg-danger"></span>
									Cancel
								</a>
							</div>
						</ProtectedComponent>
					</div>

					<div className="mt-5">
						<div className="btn btn-danger btn-lg" onClick={() => navigate(-1)}>
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
				</div>
			</section>

			<TempCustomer
				show={customerModalShow}
				onClose={() => setCustomerModalShow(false)}
				onCustomerChange={handleTempCustomerChange}
				selectedCustomer={project.customer}
			/>
			{roleModalShow && (
				<AssignRole
					show={roleModalShow}
					onHide={() => setRoleModalShow(false)}
					onSubmit={handleSubmitRoles}
					presaleOwner={project?.presales}
					cablingOwner={project?.cabling}
					dataCenterOwner={project?.dataCenter}
					presaleLeaders={project?.presaleLeaders}
					pmProject={project?.pmProject}
					pmProjectRemark={project?.pmProjectRemark}
					pmProjectStatus={project?.pmProjectStatus}
					cablingLeader={project?.cablingLeader}
					dataCenterLeader={project?.dataCenterLeader}
				/>
			)}
		</div>
	);
};

export default HeaderUpdate;
