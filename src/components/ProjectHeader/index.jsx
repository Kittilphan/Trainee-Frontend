import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Style from './style.module.css';
import Profile from '../Common/Profile/Profile';
import document from '../../assets/images/document.png';
import edit from '../../assets/icons/edit.png';
import history from '../../assets/icons/history.png';
import ProtectedComponent from '../ProtectedComponent';
import DeliveryRequestModal from '../Common/Modal/DeliveryRequestModal';
import FileController from '../../controllers/Files';

import BadgeCardStatus from '../BadgeStatus';
import axios from 'axios';
import { SwalDialog } from '../Swal';
import ProjectTimeline from '../Common/Timeline/ProjectTimeline';
import { ROLES } from '../../constants/users';
import renderContent from '../../utils/renderContent';
import ContentRenderer from '../ContentRenderer';

function ProjectHeader({ project }) {
	const { wipId } = useParams();
	const [showDeliveryModal, setShowDeliveryModal] = useState(false);
	const [showHistoryModal, setShowHistoryModal] = useState(false);

	const handleShowDeliveryModal = () => setShowDeliveryModal(true);
	const handleCloseDeliveryModal = () => setShowDeliveryModal(false);
	const handleShowHistoryModal = () => setShowHistoryModal(true);
	const handleCloseHistoryModal = () => setShowHistoryModal(false);

	const dateFormat = (date) => {
		return date ? new Date(date).toLocaleDateString('en-GB') : 'Unknown';
	};

	const listPermission = () => {
		const {
			presales = [],
			presaleLeaders = [],
			cablingLeader = [],
			cabling = [],
			dataCenter = [],
			dataCenterLeader = []
		} = project;

		// Convert non-array objects to single-element arrays
		const toArray = (item) => (Array.isArray(item) ? item : [item]);

		// Aggregate permissions
		const hasPermission = [
			...presales,
			...toArray(presaleLeaders),
			...toArray(cablingLeader),
			...toArray(cabling),
			...toArray(dataCenter),
			...toArray(dataCenterLeader)
		];

		return hasPermission;
	};

	if (!project) return;

	return (
		<section className="position-relative rounded-4 border shadow p-5 my-3 d-flex flex-column gap-4">
			<div className="position-absolute top-0 end-0 d-flex">
				{/* History Icon */}
				<button
					className="bg-info me-3 p-3"
					style={{ borderRadius: '0  0 14px 14px' }}
					onClick={handleShowHistoryModal}>
					<img src={history} className={Style.icon} />
				</button>

				{/* Edit Icon */}
				<ProtectedComponent
					requiredRoles={[
						ROLES.SALE,
						project.pmProjectStatus && project.pmProjectStatus !== 0 && ROLES.PROJECT_MANAGER_LEADER
					]}
					requiredPersons={listPermission()}>
					<Link
						to={`/projects/${project._id}/update-header`}
						className="bg-info p-3"
						style={{ borderRadius: '0 14px 0 14px' }}>
						<img src={edit} className={Style.icon} />
					</Link>
				</ProtectedComponent>
			</div>

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
					{!wipId && (
						<ProtectedComponent requiredRoles={['sale']}>
							<div className="btn btn-outline-info mt-2 btn-hover-white" onClick={handleShowDeliveryModal}>
								Delivery Request without WIP
							</div>
						</ProtectedComponent>
					)}
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
										<a
											className="mb-1 link-primary underline-on-hover "
											href={`/api/files/${file.attachmentType || file.type}/${file.reference || file._id}/${
												file.description || file.originalName
											}`}
											target="_blank">
											<div
												className="text-truncate"
												style={{
													maxWidth: '50vw'
												}}>
												{file.description || file.originalName}
											</div>
										</a>
										<h6 className="text-gray">{file.uploadedBy}</h6>
										<div className="mt-1 d-flex gap-2 flex-wrap">
											{file.xoNumbers.map((xoNumber, index) => (
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
			<div className="d-flex flex-wrap flex-fill justify-content-between gap-3">
				{(project.pmProject || (project.pmProjectStatus !== undefined && project.pmProjectStatus !== 0)) && (
					<div className="mt-3">
						<h4 className={Style.headerTitle}>PM Project</h4>
						<div className="d-flex flex-wrap gap-3 mt-3">
							{project?.pmProjectStatus === 2 && project?.pmProject ? (
								<Profile role={'PM Project'} username={project.pmProject.displayName} />
							) : project?.pmProjectStatus === 1 ? (
								<Profile username={'Requesting PM'} role={' '} isRequesting={1} />
							) : (
								<Profile username={'PM Rejected'} role={' '} isRequesting={2} />
							)}
						</div>
					</div>
				)}
				{project.presales && project.presales.length > 0 && (
					<div className="mt-3">
						<h4 className={Style.headerTitle}>Infra Presale</h4>
						<div className="d-flex flex-wrap gap-3 mt-3">
							{project.presales.map((user, index) => (
								<Profile key={index} role={'Infra Presale'} username={user.displayName} />
							))}
						</div>
					</div>
				)}
				{project.cabling && project.cabling.length > 0 && (
					<div className="mt-3">
						<h4 className={Style.headerTitle}>Cabling Presale</h4>
						<div className="d-flex flex-wrap gap-3 mt-3">
							{project.cabling.map((user, index) => (
								<Profile key={index} role={'Cabling Presale'} username={user.displayName} />
							))}
						</div>
					</div>
				)}
				{project.dataCenter && project.dataCenter.length > 0 && (
					<div className="mt-3">
						<h4 className={Style.headerTitle}>Data Center Presale</h4>
						<div className="d-flex flex-wrap gap-3 mt-3">
							{project.dataCenter.map((user, index) => (
								<Profile key={index} role={'Data Center Presale'} username={user.displayName} />
							))}
						</div>
					</div>
				)}
				{(project.presaleLeaders?.length > 0 || project.dataCenterLeader || project.cablingLeader) && (
					<div className="mt-3">
						<h4 className={Style.headerTitle}>Project Leader</h4>
						<div className="d-flex flex-wrap gap-3 mt-3">
							{project?.presaleLeaders?.length > 0 &&
								project.presaleLeaders.map((user, index) => (
									<Profile key={index} role={'Infra Leader'} username={user.displayName} />
								))}
							{project?.cablingLeader != null && (
								<Profile role={'Cabling Leader'} username={project.cablingLeader.displayName} />
							)}
							{project?.dataCenterLeader != null && (
								<Profile role={'Data Center Leader'} username={project.dataCenterLeader.displayName} />
							)}
						</div>
					</div>
				)}
			</div>
			{project.vendors && project.vendors.length > 0 ? (
				<div className="my-3">
					<h4 className={Style.headerTitle}>Vendor</h4>
					<div className="d-flex flex-wrap">
						{project.vendors.map((vendor, index) => (
							<div className="d-flex ms-3 mt-3" key={index}>
								<img src={vendor.iconLocation} alt={`${vendor.name} icon`} className={Style.venderIcon} />
								<div className="my-auto ms-1">
									<h5 className="mb-1">{vendor.name}</h5>
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<></>
			)}
			<div className={`${Style.headerTitle} row gap-2`}>
				<div className="d-inline d-lg-flex">
					<h4 className="text-nowrap me-3 mb-2 col-8 col-lg-2">คำอธิบายโครงการ: </h4>
					<h4
						className={`${Style.descriptionText} ${Style.limitedWidth}`}
						dangerouslySetInnerHTML={renderContent(project.description)}
					/>
				</div>
				<div className="d-inline d-lg-flex">
					<h4 className="text-nowrap me-3 mb-2 col-8 col-lg-2">ขอบเขตการทำงาน: </h4>
					<h4
						className={`${Style.descriptionText} ${Style.limitedWidth}`}
						dangerouslySetInnerHTML={renderContent(project.scopeOfWork)}
					/>
				</div>
				<div className="d-inline d-lg-flex">
					<h4 className="text-nowrap me-3 mb-2 col-8 col-lg-2">นอกเหนือขอบเขตการทำงาน: </h4>
					<h4
						className={`${Style.descriptionText} ${Style.limitedWidth}`}
						dangerouslySetInnerHTML={renderContent(project.outOfWork)}
					/>
				</div>
				<div className="d-inline d-lg-flex">
					<h4 className="text-nowrap me-3 mb-2 col-8 col-lg-2">หมายเหตุ: </h4>
					<h4
						className={`${Style.descriptionText} ${Style.limitedWidth}`}
						dangerouslySetInnerHTML={renderContent(project.remark)}
					/>
				</div>
			</div>
			{showDeliveryModal && (
				<DeliveryRequestModal
					show={showDeliveryModal}
					onClose={handleCloseDeliveryModal}
					filePOs={project.filePO}
					project={project}
					presales={project.presales}
				/>
			)}
			{showHistoryModal && (
				<ProjectTimeline
					label={'Project Activity'}
					show={showHistoryModal}
					onClose={handleCloseHistoryModal}
					projectId={project._id}
				/>
			)}
		</section>
	);
}

export default ProjectHeader;
