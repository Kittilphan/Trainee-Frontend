import React, { useMemo, useState, useEffect, useContext } from 'react';
import AllUsersContext from '../../contexts/AllUsersContext';
import AuthContext from '../../contexts/AuthContext';

const AssignEngineerModal = ({ show, closeModal, modalType, handleAdd, field }) => {
	const { isLoadingUser, getUserFilter } = useContext(AllUsersContext);
	const { userRoles } = useContext(AuthContext);

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedUserId, setSelectedUserId] = useState('');
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [selectedUserSkills, setSelectedUserSkills] = useState([]);
	const [selectedSkills, setSelectedSkills] = useState([]);
	const [engineerSkills, setEngineerSkills] = useState([]);
	const [cablingSkills, setCablingSkills] = useState([]);
	const [datacenterSkills, setDatacenterSkills] = useState([]);
	const [pmSkills, setPMSkills] = useState([]);
	const [selectedTag, setSelectedTag] = useState(null);

	useEffect(() => {
		if (users.length > 0) {
			filterUsers(searchTerm, selectedSkills);
		}
		return;
	}, [users]);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const empList = await getUserFilter(["engineer", "cabling", "data-center"]);
				setUsers(empList);
				separateSkillsByRole(empList);
			} catch (error) {
				console.error('Error fetching users:', error);
			}
		};

		if (!isLoadingUser) {
			fetchUsers();
		}
	}, [isLoadingUser, show]);

	const separateSkillsByRole = (usersData) => {
		const engineerSkillsSet = new Set();
		const cablingSkillsSet = new Set();
		const pmSkillsSet = new Set();
		const datacenterSkillsSet = new Set();
		usersData?.forEach((user) => {
			if (user.roles?.includes('engineer')) {
				user.skills?.forEach((skills) => engineerSkillsSet.add(skills));
			}
			if (user.roles?.includes('cabling')) {
				user.skills?.forEach((skills) => cablingSkillsSet.add(skills));
			}
			if (user.roles?.includes('data-center')) {
				user.skills?.forEach((skills) => datacenterSkillsSet.add(skills));
			}
		});
		setEngineerSkills(Array.from(engineerSkillsSet));
		setCablingSkills(Array.from(cablingSkillsSet));
		setPMSkills(Array.from(pmSkillsSet));
		setDatacenterSkills(Array.from(datacenterSkillsSet));
	};

	const handleAssign = () => {
		if (selectedUserId) {
			const selectedUser = users.find((user) => user._id === selectedUserId);
			if (selectedUser) {
				handleCloseModal();
				handleAdd(changeTypeBeforeAdd(modalType), field, selectedUser._id, selectedUser.displayName);
			}
		}
	};

	const changeTypeBeforeAdd = (modalType) => {
		switch (modalType) {
			case 'PM':
				return 'PM';
			case 'EngineerOwner':
			case 'EngineerConsult':
			case 'EngineerCoProject':
				return 'Engineer';
			case 'CablingOwner':
			case 'CablingConsult':
			case 'CablingCoProject':
				return 'Cabling';
			case 'DatacenterOwner':
			case 'DatacenterConsult':
			case 'DatacenterCoProject':
				return 'Datacenter';
		}
	};

	const getModalHeaderText = () => {
		switch (modalType) {
			case 'PM':
				return 'Assign Project Manager';
			case 'EngineerOwner':
				return 'Assign Infra Owner';
			case 'EngineerConsult':
				return 'Assign Infra Consult';
			case 'EngineerCoProject':
				return 'Assign Infra Co Project';
			case 'CablingOwner':
				return 'Assign Cabling Owner';
			case 'CablingConsult':
				return 'Assign Cabling Consult';
			case 'CablingCoProject':
				return 'Assign Cabling Co Project';
			case 'DatacenterOwner':
				return 'Assign Datacenter Owner';
			case 'DatacenterConsult':
				return 'Assign Datacenter Consult';
			case 'DatacenterCoProject':
				return 'Assign Datacenter Co Project';
			default:
				return 'Assign Employee';
		}
	};

	const handleSearchChange = (e) => {
		const value = e.target.value;
		setSearchTerm(value);
		filterUsers(value, selectedSkills);
	};

	const handleSkillClick = (skills) => {
		const newSelectedSkills = selectedSkills.includes(skills)
			? selectedSkills.filter((selectedSkill) => selectedSkill !== skills)
			: [...selectedSkills, skills];
		setSelectedSkills(newSelectedSkills);
		filterUsers(searchTerm, newSelectedSkills);
	};

	const filterUsers = (searchTerm, skills) => {
		const lowercasedFilter = searchTerm.toLowerCase();
		const filteredData = users.filter((user) => {
			const userName = user.name?.toLowerCase() || '';
			const userSkills = user.skills || [];

			return (
				userName.includes(lowercasedFilter) &&
				(skills.length === 0 || skills.some((skill) => userSkills.includes(skill))) &&
				checkUserRole(user)
			);
		});
		setFilteredUsers(filteredData);
	};

	const checkUserRole = (user) => {
		switch (modalType) {
			case 'PM':
				if (userRoles.includes('engineer')) {
					return user.roles.includes('engineer');
				} else if (userRoles.includes('cabling')) {
					return user.roles.includes('cabling');
				} else if (userRoles.includes('engineer')) {
					return user.roles.includes('engineer');
				} else return null;
			case 'EngineerOwner':
			case 'EngineerConsult':
			case 'EngineerCoProject':
				return user.roles.includes('engineer');
			case 'CablingOwner':
			case 'CablingConsult':
			case 'CablingCoProject':
				return user.roles.includes('cabling');
			case 'DatacenterOwner':
			case 'DatacenterConsult':
			case 'DatacenterCoProject':
				return user.roles.includes('data-center');
			default:
				return true;
		}
	};

	const handleUserSelect = (userId) => {
		setSelectedUserId((prevSelectedUserId) => (prevSelectedUserId === userId ? '' : userId));
		const selectedUser = users.find((user) => user._id === userId);
		setSelectedUserSkills(selectedUser ? selectedUser.skills : []);
	};

	const getSkillsToShow = () => {
		switch (modalType) {
			case 'PM':
				return pmSkills;
			case 'EngineerOwner':
			case 'EngineerConsult':
			case 'EngineerCoProject':
				return engineerSkills;
			case 'CablingOwner':
			case 'CablingConsult':
			case 'CablingCoProject':
				return cablingSkills;
			case 'DatacenterOwner':
			case 'DatacenterConsult':
			case 'DatacenterCoProject':
				return datacenterSkills;
			default:
				return [];
		}
	};

	const handleCloseModal = () => {
		clearData();
		closeModal();
	};

	const clearData = () => {
		setSearchTerm('');
		setSelectedSkills([]);
		setSelectedUserId(null);
		setSelectedTag(null);
		filterUsers('', []);
	};

	const handleTagClick = (index) => {
		setSelectedTag(index === selectedTag ? null : index);
	};

	if (!show) {
		return;
	}

	return (
		<div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
			<div className="modal-dialog" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">{getModalHeaderText()}</h5>
						<button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}></button>
					</div>
					<div className="modal-body">
						<div className="mb-3">
							<input
								type="text"
								className="form-control"
								placeholder="Search by name..."
								value={searchTerm}
								onChange={handleSearchChange}
							/>
						</div>
						{modalType !== 'PM' && getSkillsToShow().length > 0 && (
							<div className="mb-3">
								<div className="skills-tags">
									<div className="d-flex align-items-center">
										<label className="fs-5 me-3">Skills:</label>
										<button className="btn btn-outline-secondary btn-sm" style={{ width: '4rem' }} onClick={clearData}>
											Clear
										</button>
									</div>
									{getSkillsToShow().map((skills, index) => (
										<span
											key={index}
											className={`badge mx-1 my-1 clickable ${selectedSkills.includes(skills)
												? 'bg-primary text-white skills-tag-selected'
												: 'text-white bg-info'
												} ${index === selectedTag ? 'hovered' : ''}`}
											onClick={() => {
												handleSkillClick(skills);
												handleTagClick(index);
											}}
											style={{ fontSize: '16px', cursor: 'pointer' }}>
											{skills}
										</span>
									))}
								</div>
							</div>
						)}
						{isLoadingUser && <p>Loading...</p>}
						{!isLoadingUser && filteredUsers.length > 0 && (
							<ul className="list-group fs-5" style={{ maxHeight: '250px', overflowY: 'auto' }}>
								{filteredUsers.map((user) => (
									<li
										key={user._id}
										className={`list-group-item ${selectedUserId === user._id}`}
										onClick={() => handleUserSelect(user._id)}>
										{user.displayName}
										{selectedUserId === user._id && <span className="badge bg-primary mx-2">Selected</span>}
									</li>
								))}
							</ul>
						)}
						{filteredUsers.length === 0 && !isLoadingUser && <p>No users found.</p>}
						{selectedUserId && (
							<div className="mt-3 fs-5">
								<label>Have skills:</label>
								{selectedUserSkills.map((skills, index) => (
									<span key={index} className="badge bg-primary mx-1">
										{skills}
									</span>
								))}
							</div>
						)}
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
							Close
						</button>
						<button type="button" className="btn btn-primary" onClick={handleAssign} disabled={!selectedUserId}>
							Assign
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AssignEngineerModal;
