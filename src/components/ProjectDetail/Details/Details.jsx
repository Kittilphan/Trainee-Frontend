import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import Style from './style.module.css';

import SurveyInfo from '../SurveyInfo/SurveyInfo';
import FileRelate from '../FileRelate/FileRelate';
import { Link } from 'react-router-dom';

import edit from '../../../assets/icons/edit.png';
import ProtectedComponent from '../../ProtectedComponent';
import ImageThumail from '../ImageThumail';
import { ROLES } from '../../../constants/users';

function Details({ project }) {
	const [activeKey, setActiveKey] = React.useState(ROLES.INFRA_PRESALE);

	const tabs = [
		{
			value: 'presale',
			label: 'Infra'
		},
		{
			value: 'cabling',
			label: 'Cabling'
		},
		{
			value: 'dataCenter',
			label: 'Data-Center'
		}
	];

	const surveyList = [
		{ name: 'RackSpace', label: 'Rack Space' },
		{ name: 'PowerConsumption', label: 'Power Consumption' },
		{ name: 'PlugType', label: 'Plug Type' },
		{ name: 'CableConnectorType', label: 'Cable Connector Type' },
		{ name: 'RequestSub', label: 'Request Sub.' },
		{ name: 'SurveyInfo', label: 'Survey info' },
		{ name: 'FileDiagram', label: 'File Diagram' },
		{ name: 'SurveyPicture', label: 'Survey Picture' }
	];

	const fileList = [
		{ name: 'FileBom', label: 'BOM/BOQ' },
		{ name: 'FileConfig', label: 'Configuration' },
		{ name: 'FileTor', label: 'TOR/RFP' },
		{ name: 'FileComply', label: 'Comply' },
		{ name: 'FileProposal', label: 'Proposal' },
		{ name: 'FilePresentation', label: 'Presentation' },
		{ name: 'FilePoc', label: 'POC Document' },
		{ name: 'FileFloorPlan', label: 'Floor Plan/Heat Map' }
	];

	const fileStatus = (prefix) => {
		const hasAtLeastOneFile = fileList.some((file) => {
			const propertyName = `${prefix}${file.name}`;
			return Array.isArray(project[propertyName]) && project[propertyName].length > 0;
		});

		const bg = hasAtLeastOneFile ? 'info' : 'dark-subtle';

		return <div className={`${Style.fileStatus} bg-${bg}`}></div>;
	};

	const renderSurveyInfo = (prefix) => {
		return surveyList.map((survey, index) => {
			let text = project[`${prefix}${survey.name}Info`];
			let textClass = '';
			let checked = false;

			if (survey.name === 'FileDiagram') {
				if (project[`${prefix}${survey.name}`]?.length === 0) return;
				return <FileRelate index={index + prefix} files={project[`${prefix}${survey.name}`]} label={survey.label} />;
			} else if (survey.name === 'SurveyPicture') {
				if (project[`${prefix}${survey.name}`]?.length === 0) return;
				return <ImageThumail index={index + prefix} files={project[`${prefix}${survey.name}`]} label={survey.label} />;
			} else
				return (
					<SurveyInfo
						index={index + prefix}
						isChecked={project[`${prefix}${survey.name}Checked`] || checked}
						label={survey.label}
						text={text}
						textClass={textClass}
					/>
				);
		});
	};

	const renderFileRelate = (prefix) => {
		return fileList.map((file, index) => (
			<FileRelate index={index + prefix} files={project[`${prefix}${file.name}`]} label={file.label} />
		));
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

	return (
		<section className="position-relative rounded-4 border shadow p-5 my-4">
			<ProtectedComponent requiredPersons={listPermission()}>
				<Link
					to={`/projects/${project._id}/update-detail`}
					className="position-absolute top-0 end-0 p-3 bg-info"
					style={{ borderRadius: '0 14px 0 14px' }}>
					<img src={edit} className={Style.edit} />
				</Link>
			</ProtectedComponent>

			<h3>รายละเอียดโครงการ</h3>
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
								{fileStatus(tab.value)}
							</div>
						}
						className={`ms-3 ${activeKey === tab.value ? 'd-inline d-lg-flex' : ''} justify-content-between flex-wrap`}>
						<div key={tab.value + '1'} className="col-8 mt-4">
							<h4>ข้อมูลจากการสำรวจ</h4>
							{renderSurveyInfo(tab.value)}
						</div>
						<div key={tab.value + '2'} className="col-4 mt-4">
							<h4>ไฟล์ที่เกี่ยวข้อง</h4>
							{renderFileRelate(tab.value)}
						</div>
					</Tab>
				))}
			</Tabs>
		</section>
	);
}

export default Details;
