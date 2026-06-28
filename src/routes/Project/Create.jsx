import { useContext, useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Style from './style.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import CustomerController from '../../controllers/Customers';
import ProjectController from '../../controllers/Projects';

import Breadcrumb from '../../components/Breadcrumb';
import Profile from '../../components/Common/Profile/Profile';
import AutoResizingTextarea from '../../components/AutoResizingTextarea/AutoResizingTextarea';
import DropZone from '../../components/Uploader/Dropzone/index';
import FileList from '../../components/Common/List/FileList/FileList';
import POFileList from '../../components/Common/List/FileList/POFileList';
import { SwalConfirm, SwalDialog } from '../../components/Swal';

import add from '../../assets/icons/add.png';
import AssignRole from '../../components/Common/Modal/AssignRole/AssignRole';
import TempCustomer from '../../components/Common/Modal/TempCustomer/TempCustomer';
import BackButton from '../../components/Common/Button/BackButton';
import { Spinner } from 'react-bootstrap';
import AllUsersContext from '../../contexts/AllUsersContext';
import { ROLES } from '../../constants/users';

const CustomSingleValue = ({ children, ...props }) => {
	const { data } = props;

	return (
		<components.SingleValue {...props}>
			{children}
			{data.isTemp ? <span className="ms-2 badge text-bg-danger"> TEMP</span> : <></>}
		</components.SingleValue>
	);
};

const Create = () => {
	let navigate = useNavigate();

	const { isLoadingUser, getUserFilter } = useContext(AllUsersContext);

	const [project, setProject] = useState({
		projectName: '',
		projectCode: '',
		customer: null,
		description: '',
		scopeOfWork: '',
		outOfWork: '',
		remark: '',
		fileQuotation: [],
		filePO: []
	});

	const [optionCustomers, setOptionCustomers] = useState([]);
	const [smgOptions, setSmgOptions] = useState([]);
	const [roleModalShow, setRoleModalShow] = useState(false);
	const [customerModalShow, setCustomerModalShow] = useState(false);
	const [customerLoading, setCustomerLoading] = useState(true);
	const [isLoading, setIsLoading] = useState(false);

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
		fetchSMG();
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
		setProject((prevProject) => ({ ...prevProject, [id || name]: value }));
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
			const filteredFiles = currentFiles.filter((_, i) => i !== index);

			return {
				...prevProject,
				[type]: filteredFiles
			};
		});
	};

	const handleSubmitRoles = ({
		pmProjectRemark,
		pmProjectStatus,
		pmProject,
		presaleLeaders,
		cablingLeader,
		dataCenterLeader
	}) => {
		const formatLeader = (leader) => (leader ? { _id: leader.value, displayName: leader.label } : null);

		setProject((prevProject) => ({
			...prevProject,
			pmProjectRemark,
			pmProjectStatus,
			pmProject: formatLeader(pmProject),
			presaleLeaders: presaleLeaders.map(formatLeader),
			cablingLeader: formatLeader(cablingLeader),
			dataCenterLeader: formatLeader(dataCenterLeader)
		}));
	};

	const setCustomer = () => {
		if (project.customer) {
			return {
				_id: project.customer.value || project.customer._id,
				isTemp: project.customer.isTemp || false
			};
		}
		return;
	};

	const handleSubmit = () => {
		if (!project?.projectName.trim()) {
			SwalDialog({
				icon: 'warning',
				text: 'Project name is required',
				options: {}
			});
			return;
		}
		if (!project?.customer) {
			SwalDialog({
				icon: 'warning',
				text: 'Customer is required',
				options: {}
			});
			return;
		}

		const exclude = [
			'filePO',
			'fileQuotation',
			'fileOther',
			'presaleFileBom',
			'presaleFileTor',
			'customer',
			'pmProject',
			'presaleLeaders',
			'cablingLeader',
			'dataCenterLeader',
			'smg'
		];

		// Create a FormData object
		const formData = new FormData();

		Object.keys(project).forEach((key) => {
			if (project[key] && !exclude.includes(key)) {
				formData.append(key, project[key]);
			}
		});

		const appendArrayItems = (formData, name, array) => {
			if (array.length === 0) return;
			array.forEach((item) => formData.append(name, item._id));
		};

		const customer = setCustomer();
		formData.append('customer', JSON.stringify(customer));

		const sendData = () => {
			if (pmProject) formData.append('pmProject', pmProject?._id);
			if (presaleLeaders) appendArrayItems(formData, 'presaleLeaders[]', presaleLeaders);
			if (cablingLeader) formData.append('cablingLeader', cablingLeader?._id);
			if (dataCenterLeader) formData.append('dataCenterLeader', dataCenterLeader?._id);
			if (smg) formData.append('smg', smg.value);

			const appendFileArrayToFormData = (filesArray, keyPrefix) => {
				if (filesArray) {
					const xoNumbersSet = new Set(); // To track unique xoNumbers
					const duplicateXoNumbers = []; // To store duplicates
					filesArray.forEach((file, index) => {
						formData.append(`${keyPrefix}`, file);

						if (keyPrefix === 'filePO') {
							if (file.xoNumbers) {
								file.xoNumbers.forEach((xoNumber) => {
									const xo = xoNumber.xoNumber;
									if (xoNumbersSet.has(xo)) {
										duplicateXoNumbers.push(xo);
									} else {
										xoNumbersSet.add(xo);
									}
								});

								formData.append(`xoNumbers[${index}]`, JSON.stringify(file.xoNumbers));
							}
							if (file.remark) {
								formData.append(`remarkPO[${index}]`, file.remark || '');
							}
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

			let cancelTokenSource = axios.CancelToken.source();
			setIsLoading(true);
			ProjectController.createInitial({
				payload: formData,
				options: { cancelToken: cancelTokenSource.token }
			})
				.then((result) => {
					console.log('result: ', result);
					SwalDialog({
						icon: 'success',
						text: `${project.projectName} created`,
						options: {}
					}).then(() => {
						return navigate(`/projects/${result._id}`);
					});
				})
				.catch((err) => {
					console.log(`ERROR ProjectController.create()`, err);
					SwalDialog({
						icon: 'error',
						text: `${err.response?.data?.error || err}`,
						options: {}
					});
				})
				.finally(() => setIsLoading(false));
		};

		const { pmProject, presaleLeaders, cablingLeader, dataCenterLeader, smg } = project;
		if (pmProject || presaleLeaders || cablingLeader || dataCenterLeader || smg) {
			const roles = [
				pmProject && `PM: ${pmProject.displayName}`,
				presaleLeaders.length > 0 && `Infra Leader: ${presaleLeaders.map((leader) => leader.displayName)}`,
				cablingLeader && `Cabling Leader: ${cablingLeader.displayName}`,
				dataCenterLeader && `Data Center Leader: ${dataCenterLeader.displayName}`,
				smg && `SMG: ${smg.displayName || smg.label}`
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

	return (
		<div>
			<Breadcrumb
				items={[
					['home', `/`],
					['Projects', `/projects`],
					['Create Project', `/projects/new`]
				]}
			/>
			<div className="text-center">
				<h2 className="position-absolute">
					<BackButton />
				</h2>
				<h1 className="text-truncate">Create Project</h1>
			</div>
			<section className={`rounded-4 border shadow p-5 my-4`}>
				<div className="mb-3">
					<label htmlFor="projectName" className="form-label">
						Project Name<span className="text-danger"> *</span>
					</label>
					<div className="input-group">
						<input
							type="text"
							className="form-control"
							id="projectName"
							value={project.projectName}
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
						value={project.projectCode}
						onChange={handleChange}
					/>
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
					<div className="btn btn-outline-primary text-decoration-none ms-3" onClick={() => setCustomerModalShow(true)}>
						<FontAwesomeIcon icon={faUser} className="me-1" />
						<span>Temporary Customer</span>
					</div>
				</div>

				<div className="my-3">
					<h4 className={Style.headerTitle} onClick={() => setRoleModalShow(true)}>
						Choose Project Leader/PM
					</h4>
					<div className="mt-2 d-flex flex-wrap gap-5">
						<div className="d-flex flex-wrap gap-3">
							{project?.pmProjectStatus === 1 && (
								<Profile
									username={'Requesting PM'}
									role={' '}
									isRequesting={1}
									isUpdate={true}
									onClick={() => setRoleModalShow(true)}
								/>
							)}
						</div>
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
								<img src={add} alt="add pm icon" className={Style.profileIcon} onClick={() => setRoleModalShow(true)} />
							</div>
						</div>
					</div>
				</div>
				<div className={`${Style.headerTitle} row gap-3`}>
					<div className="d-inline d-lg-flex">
						<label htmlFor="description" className="text-nowrap me-3 mb-2 col-8 col-lg-2">
							<h4>คำอธิบายโครงการ: </h4>
						</label>
						<AutoResizingTextarea id="description" value={project.description} onChange={handleChange} />
					</div>
					<div className="d-inline d-lg-flex">
						<label htmlFor="scopeOfWork" className="text-nowrap me-3 mb-2 col-8 col-lg-2">
							<h4 className="text-nowrap me-3 mb-2 col-8 col-lg-2">ขอบเขตการทำงาน: </h4>
						</label>
						<AutoResizingTextarea id="scopeOfWork" value={project.scopeOfWork} onChange={handleChange} />
					</div>
					<div className="d-inline d-lg-flex">
						<label htmlFor="outOfWork" className="text-nowrap me-3 mb-2 col-8 col-lg-2">
							<h4 className="text-nowrap me-3 mb-2 col-8 col-lg-2">นอกเหนือขอบเขตการทำงาน: </h4>
						</label>
						<AutoResizingTextarea id="outOfWork" value={project.outOfWork} onChange={handleChange} />
					</div>
					<div className="d-inline d-lg-flex">
						<label htmlFor="remark" className="text-nowrap me-3 mb-2 col-8 col-lg-2">
							<h4 className="text-nowrap me-3 mb-2 col-8 col-lg-2">หมายเหตุ: </h4>
						</label>
						<AutoResizingTextarea id="remark" value={project.remark} onChange={handleChange} />
					</div>
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
								className={`col-lg-4 border rounded`}
								value={project.smg}
								onChange={handleSMGChange}
								isLoading={isLoadingUser}
							/>
						</div>
					</div>
				</div>
				<div name="footer-button" className="d-flex mt-5 justify-content-end">
					<div type="reset" className="btn btn-danger btn-lg" onClick={() => navigate(-1)}>
						Cancel
					</div>
					<div
						type="submit"
						className={`btn btn-success btn-lg ms-4 ${isLoading ? 'disabled' : ''}`}
						onClick={!isLoading ? handleSubmit : null}
						style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
						{isLoading ? (
							<>
								<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
								{' Loading...'}
							</>
						) : (
							'Save'
						)}
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

export default Create;
