import React, { useState, useEffect, useContext } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Link, useNavigate } from 'react-router-dom';
import Profile from '../../Common/Profile/Profile';
import edit from '../../../assets/icons/edit.png';
import ProtectedComponent from '../../ProtectedComponent';
import FileTable from '../../Common/Table/FileTable/FileTableForWIP';
import DeliveryRequestModal from '../../Common/Modal/DeliveryRequestModal';
import AutoResizingTextarea from '../../AutoResizingTextarea/AutoResizingTextarea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCircleCheck,
	faCircleXmark,
	faBox,
	faBoxOpen,
	faHourglass,
	faPhone
} from '@fortawesome/free-solid-svg-icons';
import BadgeCardWIPStatus from '../../BadgeStatus/WipStatus';
import WipTimeline from '../../Common/Timeline/WipTimeline';
import history from '../../../assets/icons/history.png';
import ContentRenderer from '../../ContentRenderer';

import UserIcon from "../../Common/UserIcon/UserIcon";
import AllUsersContext from '../../../contexts/AllUsersContext';

export default function WIPdetail({ project, wip }) {
	const { isLoadingUser, getUserFilter } = useContext(AllUsersContext);
	const [users, setUsers] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState();

	const [showModal, setShowModal] = useState(false);
	const handleShowModal = () => setShowModal(true);
	const handleCloseModal = () => setShowModal(false);
	const [showHistoryModal, setShowHistoryModal] = useState(false);
	const handleShowHistoryModal = () => setShowHistoryModal(true);
	const handleCloseHistoryModal = () => setShowHistoryModal(false);

	const navigate = useNavigate();
	const handleXOlink = (xoNum) => {
		navigate(`/xo`);
	};

	const getFormattedDate = (date) => {
		if (!date) return '';
		return new Intl.DateTimeFormat('en-GB').format(new Date(date));
	};

	const backgroundColors = {
		2: 'rgb(var(--rgb-app-green))',
		1: 'rgb(var(--rgb-app-orange))',
		0: 'rgb(var(--rgb-app-graylight))',
		3: 'rgb(var(--rgb-app-blue))'
	};
	const textColor = {
		2: 'rgb(var(--rgb-app-white))',
		1: 'rgb(var(--rgb-app-white))',
		0: 'rgb(var(--rgb-app-reddark))',
		3: 'rgb(var(--rgb-app-white))'
	};

	const calculateDaysFromCreate = (createDate) => {
		const creation = new Date(createDate);
		const today = new Date();
		const timeDiff = today - creation;
		const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
		return daysDiff;
	};

	const listPermission = () => {
		const toArray = (item) => (Array.isArray(item) ? item : [item]);
		const hasPermission = [
			...toArray(wip.engineerOwner),
			...toArray(wip.engineerConsult),
			...toArray(wip.engineerAdditional),
			...toArray(wip.cablingOwner),
			...toArray(wip.cablingConsult),
			...toArray(wip.cablingAdditional),
			...toArray(wip.datacenterOwner),
			...toArray(wip.datacenterConsult),
			...toArray(wip.datacenterAdditional)
		];

		return hasPermission;
	};

	const listPermissionWithPM = () => {
		const toArray = (item) => (Array.isArray(item) ? item : [item]);
		const hasPermission = [
			...toArray(wip.engineerOwner),
			...toArray(wip.engineerConsult),
			...toArray(wip.engineerAdditional),
			...toArray(wip.cablingOwner),
			...toArray(wip.cablingConsult),
			...toArray(wip.cablingAdditional),
			...toArray(wip.datacenterOwner),
			...toArray(wip.datacenterConsult),
			...toArray(wip.datacenterAdditional),
			...toArray(wip.pmWIP)
		];

		return hasPermission;
	};

	const listRolePermission = () => {
		let hasPermission = ['sale'];

		if (wip.typeEngineer?.length > 0) {
			hasPermission.push('engineer-leader');
		}
		if (wip.typeCabling?.length > 0) {
			hasPermission.push('cabling-leader');
		}
		if (wip.typeDataCenter?.length > 0) {
			hasPermission.push('data-center-leader');
		}

		return hasPermission;
	};

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const empList = await getUserFilter(["engineer-leader", "cabling-leader", "data-center-leader"]);
				setUsers(empList);
			} catch (error) {
				console.error('Error fetching users:', error);
			}
		};

		if (!isLoadingUser) {
			fetchUsers();
		}
	}, [isLoadingUser]);

	return (
		<div>
			<DeliveryRequestModal
				show={showModal}
				onClose={handleCloseModal}
				filePOs={project.filePO?.filter((po) => po._id === wip.filePO)}
				project={project}
				presales={project.presales}
				wipId={wip._id}
			/>
			{showHistoryModal && (
				<WipTimeline label={'WIP Activity'} show={showHistoryModal} onClose={handleCloseHistoryModal} wipId={wip._id} />
			)}
			<section className="position-relative content rounded-4 border shadow">
				<div className="position-absolute top-0 end-0 d-flex">
					<button
						className="bg-info me-3 p-3"
						style={{ borderRadius: '0  0 14px 14px' }}
						onClick={handleShowHistoryModal}>
						<img src={history} style={{ width: '20px', height: '20px' }} />
					</button>
					<ProtectedComponent requiredRoles={listRolePermission()} requiredPersons={listPermissionWithPM()}>
						<Link
							to={`/projects/${project._id}/wip/${wip._id}/update-wip`}
							className="bg-info p-3"
							style={{ borderRadius: '0 14px 0 14px' }}>
							<img src={edit} style={{ width: '20px', height: '20px' }} />
						</Link>
					</ProtectedComponent>
				</div>
				<main className="p-5">
					<div className="d-flex flex-column flex-lg-row mt-5 justify-content-between">
						<div className="text-center" style={{ minWidth: '20%' }}>
							<label className="fs-5">Kickoff : {wip.percentageKickoff} %</label>
							<ProgressBar className="mb-4" now={wip.percentageKickoff} style={{ height: '24px' }} />
						</div>
						<div className="text-center" style={{ minWidth: '20%' }}>
							<label className="fs-5">Delivery : {wip.percentageDelivery} %</label>
							<ProgressBar className="mb-4" now={wip.percentageDelivery} style={{ height: '24px' }} />
						</div>
						<div className="text-center" style={{ minWidth: '20%' }}>
							<label className="fs-5">Implement : {wip.percentageImplement} %</label>
							<ProgressBar className="mb-4" now={wip.percentageImplement} style={{ height: '24px' }} />
						</div>
						<div className="text-center" style={{ minWidth: '20%' }}>
							<label className="fs-5">Document Delivery : {wip.percentageDocDelivery} %</label>
							<ProgressBar className="mb-4" now={wip.percentageDocDelivery} style={{ height: '24px' }} />
						</div>
					</div>
					<div name="Content-field-1" className="d-flex flex-wrap justify-content-between">
						<div name="Content-field-1-left" className="col-md-5 col-12 px-0">
							<label className={`my-2 fs-4 d-flex align-items-center`}>
								<span className="me-2">Status:</span>
								<BadgeCardWIPStatus status={wip.status} />
							</label>
							<label className="my-2 fs-4 d-flex">
								WIP Number : <ContentRenderer value={wip.wipNumber || 'N/A'} />
							</label>
							<label className="my-2 fs-4 d-flex">
								WIP Description : <ContentRenderer value={wip.wipName || 'N/A'} />
							</label>
							<div className="d-flex flex-wrap py-2">
								<div className="d-flex fs-4 align-items-center">
									<div className="me-2">
										{wip.poChecked || wip.filePO ? (
											<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
										) : (
											<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
										)}
									</div>
									<label>{wip.filePO ? 'Confirmed Order Files' : 'Require Confirmed Order Files'}</label>
								</div>
								<label className="ms-3 fs-4">
									{project.filePO?.length > 0 &&
										(() => {
											const file = project.filePO.find((po) => po._id === wip.filePO);
											if (!file) return;
											return (
												<div className="underline-on-hover">
													<a
														href={`/api/files/${file.attachmentType || file.type}/${file.reference || file._id}/${file.description || file.originalName
															}`}
														target="_blank">
														{file.description || file.originalName}
													</a>
												</div>
											);
										})()}
								</label>
							</div>
							<div className="d-flex fs-4 align-items-center">
								<div className="me-2">
									{wip.xoChecked ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label>Require XO</label>
							</div>
							<div className="d-flex flex-wrap py-2">
								<div className="ms-4 fs-4">
									<ul>
										{project.filePO &&
											project.filePO
												.filter((po) => po._id === wip.filePO)
												.map((po) => (
													<li key={po._id}>
														{po.xoNumbers &&
															po.xoNumbers.map((xoObject, index) => {
																return (
																	<ul key={xoObject._id}>
																		{xoObject.xoNumber && (
																			<div key={index} className="d-flex align-items-center">
																				<button
																					type="button"
																					className="underline-on-hover me-4"
																					onClick={() => handleXOlink(xoObject.xoNumber)}>
																					{`XO ${xoObject.xoNumber}`}
																				</button>
																				<BadgeCardWIPStatus
																					status={xoObject.stockReady}
																					labelStatus={{
																						2: 'In Stock',
																						1: 'Partial',
																						0: 'Waiting',
																						3: 'Issue'
																					}}
																					iconStatus={{
																						2: faBox,
																						1: faBoxOpen,
																						0: faHourglass,
																						3: faPhone
																					}}
																					backgroundColors={backgroundColors}
																					textColor={textColor}
																				/>
																			</div>
																		)}
																	</ul>
																);
															})}
													</li>
												))}
									</ul>
								</div>
							</div>
						</div>
						<div className="d-flex flex-wrap">
							<div>
								<ProtectedComponent requiredRoles={listRolePermission()} requiredPersons={listPermission()}>
									<div className="btn btn-outline-info me-4 mt-2" onClick={handleShowModal}>
										Delivery Request with WIP
									</div>
								</ProtectedComponent>
							</div>
							<div name="Content-field-1-right" className="px-0" style={{ width: '25rem' }}>
								<div className="d-flex py-2 justify-content-between flex-column flex-sm-row">
									<label className="fs-5" style={{ width: '14rem' }}>
										วันที่ได้รับมอบหมาย :
									</label>
									<label className="fs-4" style={{ width: '7.65rem' }}>
										<label>{getFormattedDate(wip.dateAssigned)}</label>
									</label>
								</div>
								<div className="d-flex py-2 justify-content-between flex-wrap flex-column flex-sm-row">
									<label className="fs-5" style={{ width: '14rem' }}>
										วันเสร็จสิ้นงานที่คาดหวัง :
									</label>
									<label className="fs-4" style={{ width: '7.65rem' }}>
										<label>{getFormattedDate(wip.expectedCompleteDate)}</label>
									</label>
								</div>
								<div className="d-flex py-2 justify-content-between flex-wrap flex-column flex-sm-row">
									<label className="fs-5" style={{ width: '14rem' }}>
										จำนวนวันที่ทำ :
									</label>
									<label className="fs-4" style={{ width: '7.65rem' }}>
										<ContentRenderer
											value={
												wip.dateOnProject
													? `${wip.dateOnProject} วัน`
													: `${calculateDaysFromCreate(wip.dateAssigned)} วัน` || 'N/A'
											}
										/>
									</label>
								</div>
								<div className="d-row py-2 justify-content-between fs-5 text-gray">
									Updated by
									{wip.updatedBySaleName && wip.updatedBySaleAt && (
										<label className="pt-2 d-flex flex-column flex-sm-row justify-content-between">
											<div className="d-flex">
												<label style={{ width: '105px' }}>Sale :</label>
												<ContentRenderer value={wip.updatedBySaleName || 'N/A'} />
											</div>
											<label className="d-flex">At : {getFormattedDate(wip.updatedBySaleAt)}</label>
										</label>
									)}
									{wip.updatedByEngineerName && wip.updatedByEngineerAt && (
										<label className="pt-2 d-flex flex-column flex-sm-row justify-content-between">
											<div className="d-flex">
												<label style={{ width: '105px' }}>Engineer :</label>
												<ContentRenderer value={wip.updatedByEngineerName || 'N/A'} />
											</div>
											<label className="d-flex">At : {getFormattedDate(wip.updatedByEngineerAt)}</label>
										</label>
									)}
									{wip.updatedByCablingName && wip.updatedByCablingAt && (
										<label className="pt-2 d-flex flex-column flex-sm-row justify-content-between">
											<div className="d-flex">
												<label style={{ width: '105px' }}>Cabling :</label>
												<ContentRenderer value={wip.updatedByCablingName || 'N/A'} />
											</div>
											<label className="d-flex">At : {getFormattedDate(wip.updatedByCablingAt)}</label>
										</label>
									)}
									{wip.updatedByDatacenterName && wip.updatedByDatacenterAt && (
										<label className="pt-2 d-flex flex-column flex-sm-row justify-content-between">
											<div className="d-flex">
												<label style={{ width: '105px' }}>Data Center :</label>
												<ContentRenderer value={wip.updatedByDatacenterName || 'N/A'} />
											</div>
											<label className="d-flex">At : {getFormattedDate(wip.updatedByDatacenterAt)}</label>
										</label>
									)}
									{wip.updatedByProjectManagerName && wip.updatedByProjectManagerAt && (
										<label className="pt-2 d-flex flex-column flex-sm-row justify-content-between">
											<div className="d-flex">
												<label style={{ width: '105px' }}>PM :</label>
												<ContentRenderer value={wip.updatedByProjectManagerName || 'N/A'} />
											</div>
											<label className="d-flex">At : {getFormattedDate(wip.updatedByProjectManagerAt)}</label>
										</label>
									)}
								</div>
							</div>
						</div>
					</div>
					<div name="Content-field-2" className="d-flex flex-column flex-xl-row mt-4 justify-content-between">
						<div name="Content-field-2-left" className="mb-4 me-xl-4">
							<label className="fs-4 py-2" style={{ width: '42vw' }}>
								ข้อมูลลูกค้า
							</label>
							<div className="d-flex flex-column flex-xl-row fs-5 py-2">
								<label className="form-label me-xl-2 mb-2 mb-xl-0" style={{ width: '15.1rem' }}>
									ชื่อสถานที่ :
								</label>
								<ContentRenderer value={wip.siteName || 'N/A'} />
							</div>
							<div className="d-flex flex-column flex-xl-row fs-5 py-2">
								<label className="form-label me-xl-2 mb-2 mb-xl-0" style={{ width: '15.1rem' }}>
									ที่อยู่สำหรับติดตั้ง :
								</label>
								<ContentRenderer value={wip.siteAddress || 'N/A'} />
							</div>
							<div className="d-flex flex-column flex-xl-row fs-5 py-2">
								<label className="me-xl-2 mb-2 mb-xl-0" style={{ width: '15.1rem' }}>
									วันติดตั้ง :
								</label>
								<label>{getFormattedDate(wip.dateTimeRequest)}</label>
							</div>
							<div className="d-flex flex-column flex-xl-row fs-5 py-2">
								<label className="form-label me-xl-2 mb-2 mb-xl-0" style={{ width: '15.1rem' }}>
									ช่องทางติดต่อลูกค้า (ส่วนตัว) :
								</label>
								<ContentRenderer value={wip.customerContactPerson || 'N/A'} />
							</div>
							<div className="d-flex flex-column flex-xl-row fs-5 py-2">
								<label className="form-label me-xl-2 mb-2 mb-xl-0" style={{ width: '15.1rem' }}>
									เบอร์โทรติดต่อลูกค้า :
								</label>
								<ContentRenderer value={wip.customerContactTel || 'N/A'} />
							</div>
						</div>
						<div name="Content-field-2-right" className="mb-4">
							<label className="fs-4 py-2" style={{ width: '42vw' }}>
								ข้อมูล Sales
							</label>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.requireInternalKickoff ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label>WIP kickoff</label>
							</div>
							<div className="d-flex py-2 fs-5">
								<div className="me-2">
									{wip.requestSub ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<div className="w-100">
									<label>Request Sub</label>
									<AutoResizingTextarea
										className="form-control mt-2"
										id="subDetail"
										rows="3"
										value={wip.subDetail}
										disabled
									/>
								</div>
							</div>
						</div>
					</div>
					<div name="Content-field-3" className="d-row mt-4">
						<label className="fs-3">Team</label>
						<label className="fs-4 mt-3 d-flex align-items-center">
							PM WIP:
							{wip.pmWIP && (
								<Profile
									sizeComponent={{ width: '10rem' }}
									role={'Project Manager'}
									username={wip.pmWIP?.displayName}
								/>
							)}
							{wip.pmWIPType === 0 ? (
								<span className="ms-2 badge text-bg-primary">PM Project</span>
							) : wip.pmWIPType === 1 ? (
								<span className="ms-2 badge text-bg-info text-light">WIP Owner</span>
							) : wip.pmWIPType === 2 ? (
								<span className="ms-2 badge text-bg-danger">Engineer leader select</span>
							) : (
								<span>PM WIP Type not found</span>
							)}
						</label>
					</div>
					<div name="Content-field-4" className="d-flex flex-column flex-xl-row mt-4 justify-content-between">
						<div name="Content-field-3-left" className="d-row px-0 me-xl-4">
							<div className="fs-4 py-2 d-flex"
								style={{ width: "25vw" }}>
								<label className="me-4"> ข้อมูล Infra </label>
								<UserIcon users={users.filter(user => user.roles.some(role => ["engineer-leader"].includes(role)))} />
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeEngineer && wip.typeEngineer.includes('Implement') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label>Implement</label>
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeEngineer && wip.typeEngineer.includes('Training') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label className="form-check-label">Training</label>
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeEngineer && wip.typeEngineer.includes('Consult') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label className="form-check-label">Consult</label>
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeEngineer && wip.typeEngineer.includes('Delivery') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label className="form-check-label">Delivery</label>
							</div>
							<div className="d-flex py-2 fs-5">
								<div className="me-2">
									{wip.typeEngineer &&
										wip.typeEngineer.find((type) => {
											return !(type === 'Implement' || type === 'Training' || type === 'Consult' || type === 'Delivery');
										}) ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<div className="w-100">
									<label className="form-check-label">อื่น ๆ</label>
									<input
										className="form-control mt-2"
										id="engAnother"
										value={
											wip.typeEngineer &&
											wip.typeEngineer.find((type) => {
												return !(
													type === 'Implement' ||
													type === 'Training' ||
													type === 'Consult' ||
													type === 'Delivery'
												);
											})
										}
										disabled
									/>
								</div>
							</div>
							<div name="profile">
								<label className="fs-4 py-2">Infra Engineer</label>
								<div className="d-flex">
									{wip.engineerOwner ? (
										<Profile
											sizeComponent={{ width: '10rem' }}
											role={'Infra Owner'}
											username={wip.engineerOwner.displayName}
										/>
									) : (
										<div className="fs-4 my-4 text-gray">( Didn't assign engineer )</div>
									)}
								</div>
								<div className="d-flex flex-wrap justify-content-between">
									{wip.engineerConsult &&
										Array.isArray(wip.engineerConsult) &&
										wip.engineerConsult.map((engineer, index) => (
											<Profile
												sizeComponent={{ width: '10rem' }}
												key={index}
												role={'Infra Consult'}
												username={engineer.displayName}
											/>
										))}
								</div>
								<div className="d-flex flex-wrap justify-content-between">
									{wip.engineerAdditional &&
										Array.isArray(wip.engineerAdditional) &&
										wip.engineerAdditional.map((engineer, index) => (
											<Profile
												sizeComponent={{ width: '10rem' }}
												key={index}
												role={'Infra Co Project'}
												username={engineer.displayName}
											/>
										))}
								</div>
							</div>
						</div>
						<div name="Content-field-3-mid" className="d-row px-0">
							<div className="fs-4 py-2 d-flex"
								style={{ width: "25vw" }}>
								<label className="me-4"> ข้อมูล Cabling </label>
								<UserIcon users={users.filter(user => user.roles.includes("cabling-leader"))} />
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeCabling && wip.typeCabling.includes('Implement') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label className="form-check-label">Implement</label>
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeCabling && wip.typeCabling.includes('Training') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label className="form-check-label">Training</label>
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeCabling && wip.typeCabling.includes('Consult') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label className="form-check-label">Consult</label>
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeCabling && wip.typeCabling.includes('Delivery') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label className="form-check-label">Delivery</label>
							</div>
							<div className="d-flex py-2 fs-5">
								<div className="me-2">
									{wip.typeCabling &&
										wip.typeCabling.find((type) => {
											return !(type === 'Implement' || type === 'Training' || type === 'Consult' || type === 'Delivery');
										}) ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<div className="w-100">
									<label className="form-check-label">อื่น ๆ</label>
									<input
										className="form-control mt-2"
										id="cabAnother"
										value={
											wip.typeCabling &&
											wip.typeCabling.find((type) => {
												return !(
													type === 'Implement' ||
													type === 'Training' ||
													type === 'Consult' ||
													type === 'Delivery'
												);
											})
										}
										disabled
									/>
								</div>
							</div>
							<div name="profile">
								<label className="fs-4 py-2">Cabling Engineer</label>
								<div className="d-flex">
									{wip.cablingOwner ? (
										<Profile
											sizeComponent={{ width: '10rem' }}
											role={'Cabling Owner'}
											username={wip.cablingOwner.displayName}
										/>
									) : (
										<div className="fs-4 my-4 text-gray">( Didn't assign engineer )</div>
									)}
								</div>
								<div className="d-flex flex-wrap justify-content-between">
									{wip.cablingConsult &&
										Array.isArray(wip.cablingConsult) &&
										wip.cablingConsult.map((cabling, index) => (
											<Profile
												sizeComponent={{ width: '10rem' }}
												key={index}
												role={'Cabling Consult'}
												username={cabling.displayName}
											/>
										))}
								</div>
								<div className="d-flex flex-wrap justify-content-between">
									{wip.cablingAdditional &&
										Array.isArray(wip.cablingAdditional) &&
										wip.cablingAdditional.map((cabling, index) => (
											<Profile
												sizeComponent={{ width: '10rem' }}
												key={index}
												role={'Cabling Co Project'}
												username={cabling.displayName}
											/>
										))}
								</div>
							</div>
						</div>
						<div name="Content-field-3-right" className="d-row px-0">
							<div className="fs-4 py-2 d-flex"
								style={{ width: "25vw" }}>
								<label className="me-4"> ข้อมูล Datacenter </label>
								<UserIcon users={users.filter(user => user.roles.includes("data-center-leader"))} />
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeDataCenter && wip.typeDataCenter.includes('Implement') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label className="form-check-label">Implement</label>
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeDataCenter && wip.typeDataCenter.includes('Training') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label className="form-check-label">Training</label>
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeDataCenter && wip.typeDataCenter.includes('Consult') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label className="form-check-label">Consult</label>
							</div>
							<div className="d-flex py-2 fs-5 align-items-center">
								<div className="me-2">
									{wip.typeDataCenter && wip.typeDataCenter.includes('Delivery') ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<label className="form-check-label">Delivery</label>
							</div>
							<div className="d-flex py-2 fs-5">
								<div className="me-2">
									{wip.typeDataCenter &&
										wip.typeDataCenter.find((type) => {
											return !(type === 'Implement' || type === 'Training' || type === 'Consult' || type === 'Delivery');
										}) ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-success fs-4" />
									) : (
										<FontAwesomeIcon icon={faCircleXmark} className="text-secondary fs-4" />
									)}
								</div>
								<div className="w-100">
									<label className="form-check-label">อื่น ๆ</label>
									<input
										className="form-control mt-2"
										id="dataAnother"
										value={
											wip.typeDataCenter &&
											wip.typeDataCenter.find((type) => {
												return !(
													type === 'Implement' ||
													type === 'Training' ||
													type === 'Consult' ||
													type === 'Delivery'
												);
											})
										}
										disabled
									/>
								</div>
							</div>
							<div name="profile">
								<label className="fs-4 py-2">Data Center Engineer</label>
								<div className="d-flex">
									{wip.datacenterOwner ? (
										<Profile
											sizeComponent={{ width: '10rem' }}
											role={'Datacenter Owner'}
											username={wip.datacenterOwner.displayName}
										/>
									) : (
										<div className="fs-4 my-4 text-gray">( Didn't assign engineer )</div>
									)}
								</div>
								<div className="d-flex flex-wrap justify-content-between">
									{wip.datacenterConsult &&
										Array.isArray(wip.datacenterConsult) &&
										wip.datacenterConsult.map((datacenter, index) => (
											<Profile
												sizeComponent={{ width: '10rem' }}
												key={index}
												role={'Datacenter Consult'}
												username={datacenter.displayName}
											/>
										))}
								</div>
								<div className="d-flex flex-wrap justify-content-between">
									{wip.datacenterAdditional &&
										Array.isArray(wip.datacenterAdditional) &&
										wip.datacenterAdditional.map((datacenter, index) => (
											<Profile
												sizeComponent={{ width: '10rem' }}
												key={index}
												role={'Datacenter Co Project'}
												username={datacenter.displayName}
											/>
										))}
								</div>
							</div>
						</div>
					</div>
					<div name="Content-field-5" className="d-row mt-4">
						<label className="fs-4 py-2">ข้อมูลเพิ่มเติม</label>
						<div className="d-flex flex-column flex-lg-row fs-5 py-2 justify-content-between">
							<label className="form-label me-2" style={{ minWidth: '9rem' }}>
								Offered Details :
							</label>
							<label className="container-fluid px-0" style={{ whiteSpace: 'pre-wrap' }}>
								<ContentRenderer value={wip.offeredDetails || 'N/A'} />
							</label>
						</div>
						<div className="d-flex flex-column flex-lg-row fs-5 py-2 justify-content-between">
							<label className="form-label me-2" style={{ minWidth: '9rem' }}>
								Remark :
							</label>
							<label className="container-fluid px-0" style={{ whiteSpace: 'pre-wrap' }}>
								<ContentRenderer value={wip.remark || 'N/A'} />
							</label>
						</div>
					</div>
				</main>
			</section>
			<section className="position-relative rounded-4 border shadow p-5 my-4">
				<div className="fs-4 py-2">เอกสารใน WIP</div>
				<FileTable wipId={wip.wipId} />
			</section>
		</div>
	);
}
