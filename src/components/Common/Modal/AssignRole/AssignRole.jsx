import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import Select, { components } from 'react-select';
// import EmployeesController from '../../../../controllers/Employees';
import AllUsersContext from '../../../../contexts/AllUsersContext';
import ProtectedComponent from '../../../ProtectedComponent';
import Avatar from 'react-avatar';
import { SwalDialog } from '../../../Swal';
import AutoResizingTextarea from '../../../AutoResizingTextarea/AutoResizingTextarea';
import { ROLES } from '../../../../constants/users';

const CustomOption = (props) => {
	const name = props.data.label.split(' ')[0].replace('.', ' ');

	return (
		<components.Option {...props}>
			<div className="d-flex justify-content-between align-items-center">
				<div className="d-flex align-items-center">
					<Avatar name={name || 'Unknown User'} round={true} size={25} />
					<div className="ms-2">{props.data.label}</div>
				</div>
			</div>
		</components.Option>
	);
};

const AssignRole = ({
	show,
	onHide = {},
	onSubmit = {},
	presaleOwner = [],
	cablingOwner = [],
	dataCenterOwner = [],
	presaleLeaders = [],
	pmProject,
	pmProjectStatus,
	pmProjectRemark,
	cablingLeader,
	dataCenterLeader
}) => {
	const { isLoadingUser, getUserFilter } = useContext(AllUsersContext);

	const [pmList, setPmList] = useState([]);
	const [presaleList, setPresaleList] = useState([]);
	const [cablingList, setCablingList] = useState([]);
	const [dataCenterList, setDataCenter] = useState([]);
	const [presaleLeaderList, setPresaleLeaderList] = useState([]);
	const [cablingLeaderList, setCablingLeaderList] = useState([]);
	const [dataCenterLeaderList, setDataCenterLeader] = useState([]);
	const [selectedRoles, setSelectedRoles] = useState({
		pmProjectStatus: null,
		pmProjectRemark: '',
		pmProject: null,
		presaleLeaders: [],
		cablingLeader: null,
		dataCenterLeader: null,
		presaleOwner: [],
		cablingOwner: [],
		dataCenterOwner: []
	});

	useEffect(() => {
		if (
			pmProjectRemark ||
			pmProjectStatus ||
			pmProject ||
			presaleLeaders.length ||
			cablingLeader ||
			dataCenterLeader ||
			presaleOwner.length ||
			cablingOwner.length ||
			dataCenterOwner.length
		) {
			setSelectedRoles((prevRoles) => ({
				...prevRoles,
				pmProjectRemark: pmProjectRemark ? pmProjectRemark : '',
				pmProjectStatus: pmProjectStatus ? pmProjectStatus : null,
				pmProject: pmProject ? { value: pmProject._id, label: pmProject.displayName } : null,
				presaleLeaders: presaleLeaders.map((leader) => ({ value: leader._id, label: leader.displayName })),
				cablingLeader: cablingLeader
					? {
							value: cablingLeader._id,
							label: cablingLeader.displayName
					  }
					: null,
				dataCenterLeader: dataCenterLeader
					? {
							value: dataCenterLeader._id,
							label: dataCenterLeader.displayName
					  }
					: null,
				presaleOwner: presaleOwner.map((presale) => ({
					value: presale._id,
					label: presale.displayName
				})),
				cablingOwner: cablingOwner.map((cabling) => ({
					value: cabling._id,
					label: cabling.displayName
				})),
				dataCenterOwner: dataCenterOwner.map((dataCenter) => ({
					value: dataCenter._id,
					label: dataCenter.displayName
				}))
			}));

			return;
		}
	}, [
		pmProject,
		pmProjectRemark,
		pmProjectStatus,
		presaleLeaders.length,
		cablingLeader,
		cablingLeader,
		presaleOwner.length,
		cablingOwner.length,
		dataCenterOwner.length
	]);

	useEffect(() => {
		const fetchEmployeeOptions = async () => {
			try {
				const employees = await getUserFilter([
					ROLES.PROJECT_MANAGER,
					ROLES.INFRA_PRESALE,
					ROLES.CABLING_PRESALE,
					ROLES.DATA_CENTER_PRESALE,
					ROLES.INFRA_PRESALE_LEADER,
					ROLES.CABLING_PRESALE_LEADER,
					ROLES.DATA_CENTER_PRESALE_LEADER
				]);

				setPmList(createRoleList(employees, ROLES.PROJECT_MANAGER));
				setPresaleList(createRoleList(employees, ROLES.INFRA_PRESALE));
				setCablingList(createRoleList(employees, ROLES.CABLING_PRESALE));
				setDataCenter(createRoleList(employees, ROLES.DATA_CENTER_PRESALE));
				setPmList(createRoleList(employees, ROLES.PROJECT_MANAGER));
				setPresaleLeaderList(createRoleList(employees, ROLES.INFRA_PRESALE_LEADER));
				setCablingLeaderList(createRoleList(employees, ROLES.CABLING_PRESALE_LEADER));
				setDataCenterLeader(createRoleList(employees, ROLES.DATA_CENTER_PRESALE_LEADER));
			} catch (error) {
				console.error('Failed to fetch employee options:', error);
			}
		};

		if (!isLoadingUser) {
			fetchEmployeeOptions();
		}
	}, [isLoadingUser]);

	const createRoleList = (employees, roles) => {
		return employees
			.filter((employee) => employee.roles?.includes(roles))
			.map((employee) => ({
				value: employee._id,
				label: employee.displayName
			}));
	};

	const handleChange = (selectedOption, { name }) => {
		if (name === 'pmProjectStatus') {
			setSelectedRoles((prevRoles) => ({
				...prevRoles,
				pmProjectStatus: selectedOption
			}));
		} else
			setSelectedRoles((prevRoles) => ({
				...prevRoles,
				[name]: selectedOption
			}));
	};

	const handleClear = (name) => {
		setSelectedRoles((prevRoles) => {
			const newValue = ['presaleLeaders', 'presaleOwner', 'cablingOwner', 'dataCenterOwner'].includes(name) ? [] : null;
			return {
				...prevRoles,
				[name]: newValue
			};
		});
	};

	const handleSubmit = () => {
		if (selectedRoles.pmProjectStatus === 2 && !selectedRoles.pmProject) {
			SwalDialog({
				icon: 'warning',
				text: 'PM Selection is Required',
				options: {}
			});
			return;
		}
		if (selectedRoles.pmProjectStatus === 3 && selectedRoles.pmProjectRemark.trim() === '') {
			SwalDialog({
				icon: 'warning',
				text: 'Remark is Required',
				options: {}
			});
			return;
		}
		onSubmit(selectedRoles);
		onHide();
	};

	return (
		<Modal show={show} onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>Assign Role</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<ProtectedComponent requiredRoles={[ROLES.PROJECT_MANAGER_LEADER]}>
						<Form.Label>PM Project</Form.Label>
						<div className="d-flex form-check gap-4">
							<div className="form-check py-2">
								<input
									className="form-check-input"
									type="checkbox"
									name="pmProjectStatus"
									id="pmProjectStatus2"
									checked={selectedRoles?.pmProjectStatus === 2}
									onChange={() => handleChange(2, { name: 'pmProjectStatus' })}
								/>
								<label className="form-check-label" htmlFor="pmProjectStatus2">
									Accept Request
								</label>
							</div>
							<div className="form-check py-2">
								<input
									className="form-check-input"
									type="checkbox"
									name="pmProjectStatus"
									id="pmProjectStatus3"
									checked={selectedRoles?.pmProjectStatus === 3}
									onChange={() => handleChange(3, { name: 'pmProjectStatus' })}
								/>
								<label className="form-check-label" htmlFor="pmProjectStatus3">
									Reject Request
								</label>
							</div>
						</div>
						<div className="ms-3">
							{selectedRoles?.pmProjectStatus === 2 && (
								<RoleSelect
									name="pmProject"
									options={pmList}
									value={selectedRoles.pmProject}
									onChange={handleChange}
									onClear={handleClear}
									isLoading={isLoadingUser}
								/>
							)}
							{selectedRoles?.pmProjectStatus !== 2 && (
								<div>
									<label className="form-input mb-1" htmlFor="pmProjectRemark">
										Remark
									</label>
									<AutoResizingTextarea
										name="pmProjectRemark"
										value={selectedRoles.pmProjectRemark}
										onChange={(e) => handleChange(e.target?.value, { name: 'pmProjectRemark' })}
									/>
								</div>
							)}
						</div>
					</ProtectedComponent>
					<ProtectedComponent requiredRoles={['sale']}>
						<Form.Group>
							<Form.Label>Request PM Project</Form.Label>
							<div className="col mb-3 ms-4">
								<div className="form-check">
									<input
										className="form-check-input"
										type="checkbox"
										name="pmProjectStatus"
										id="requestPM"
										value=""
										checked={selectedRoles.pmProjectStatus === 1}
										onChange={() =>
											handleChange(selectedRoles.pmProjectStatus !== 1 ? 1 : 0, { name: 'pmProjectStatus' })
										}
									/>
									<label htmlFor="requestPM">Require</label>
								</div>
								<div className="mt-3">
									<label className="form-input mb-1" htmlFor="pmProjectRemark">
										Remark
									</label>
									<AutoResizingTextarea
										id="pmProjectRemark"
										value={selectedRoles.pmProjectRemark}
										readOnly={selectedRoles.pmProjectStatus === 0 || !selectedRoles.pmProjectStatus}
										onChange={(e) => handleChange(e.target?.value, { name: 'pmProjectRemark' })}
									/>
								</div>
							</div>
						</Form.Group>
						<RoleSelect
							label="Infra Leaders"
							name="presaleLeaders"
							options={presaleLeaderList}
							value={selectedRoles.presaleLeaders}
							onChange={handleChange}
							onClear={handleClear}
							isLoading={isLoadingUser}
							isMulti
						/>
						<RoleSelect
							label="Cabling Leader"
							name="cablingLeader"
							options={cablingLeaderList}
							value={selectedRoles.cablingLeader}
							onChange={handleChange}
							onClear={handleClear}
							isLoading={isLoadingUser}
						/>
						<RoleSelect
							label="Data Center Leader"
							name="dataCenterLeader"
							options={dataCenterLeaderList}
							value={selectedRoles.dataCenterLeader}
							onChange={handleChange}
							onClear={handleClear}
							isLoading={isLoadingUser}
						/>
					</ProtectedComponent>

					<ProtectedComponent requiredPersons={presaleLeaders}>
						<RoleSelect
							label="Pre-Sale Owner"
							name="presaleOwner"
							options={presaleList}
							value={selectedRoles.presaleOwner}
							onChange={handleChange}
							onClear={handleClear}
							isLoading={isLoadingUser}
							isMulti
						/>
					</ProtectedComponent>
					<ProtectedComponent requiredPersons={cablingLeader}>
						<RoleSelect
							label="Cabling Owner"
							name="cablingOwner"
							options={cablingList}
							value={selectedRoles.cablingOwner}
							onChange={handleChange}
							onClear={handleClear}
							isLoading={isLoadingUser}
							isMulti
						/>
					</ProtectedComponent>
					<ProtectedComponent requiredPersons={dataCenterLeader}>
						<RoleSelect
							label="Data Center Owner"
							name="dataCenterOwner"
							options={dataCenterList}
							value={selectedRoles.dataCenterOwner}
							onChange={handleChange}
							onClear={handleClear}
							isLoading={isLoadingUser}
							isMulti
						/>
					</ProtectedComponent>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onHide}>
					Close
				</Button>
				<Button variant="primary" onClick={handleSubmit}>
					Save Changes
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

const RoleSelect = ({ label, name, value, onClear, options = [], ...props }) => (
	<Form.Group>
		<Form.Label>{label}</Form.Label>
		<Select
			components={{
				Option: (props) => <CustomOption {...props} />
			}}
			name={name}
			value={value}
			options={options}
			{...props}
		/>
		<div className="d-flex justify-content-end">
			<div onClick={() => onClear(name)} className="text-gray" role="button">
				Clear
			</div>
		</div>
	</Form.Group>
);

export default AssignRole;
