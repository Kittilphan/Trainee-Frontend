import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import ProtectedComponent from '../../components/ProtectedComponent';
import WIPcontroller from '../../controllers/WIP/index';
import axios from 'axios';
import Avatar from 'react-avatar';
import './List.css';
import BadgeCardWIPStatus from "../../components/BadgeStatus/WipStatus";
import { width } from '@fortawesome/free-solid-svg-icons/fa0';
import ContentRenderer from '../../components/ContentRenderer';

function WIPList({ project }) {
	const { projectId, wipId } = useParams();
	const [wip, setWIP] = useState([]);
	const [selectSort, setSelectSort] = useState('');
	const [sortedWIP, setSortedWIP] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const cancelTokenSource = axios.CancelToken.source();
		const fetchWIPData = async () => {
			try {
				const wipData = await WIPcontroller.getWIPByProjectId({
					id: projectId,
					options: { cancelToken: cancelTokenSource.token }
				});

				setWIP(wipData);
			} catch (error) {
				console.error('Failed to fetch WIP data:', error);
			}
		};

		fetchWIPData();
		return () => {
			cancelTokenSource.cancel('Request canceled due to component unmount');
		};
	}, [projectId]);

	useEffect(() => {
		if (Array.isArray(wip)) {
			setSortedWIP([...wip]);
		}
	}, [wip]);

	const handleCardClick = (wipId) => {
		if (wipId) {
			navigate(`/projects/${projectId}/wip/${wipId}`);
		}
	};

	const getFormattedDate = (date) => {
		if (!date) return '';
		return new Intl.DateTimeFormat('en-GB').format(new Date(date));
	};

	const handleChangeSort = (event) => {
		const sortValue = event.target.value;
		setSelectSort(sortValue);
		let sortedArray = [...sortedWIP];
		if (sortValue === 'numberMin') {
			sortedArray.sort((prev, after) => prev.wipNumber.localeCompare(after.wipNumber));
		} else if (sortValue === 'numberMax') {
			sortedArray.sort((prev, after) => after.wipNumber.localeCompare(prev.wipNumber));
		} else if (sortValue === 'dateMin') {
			sortedArray.sort((prev, after) => new Date(prev.expectedCompleteDate) - new Date(after.expectedCompleteDate));
		} else if (sortValue === 'dateMax') {
			sortedArray.sort((prev, after) => new Date(after.expectedCompleteDate) - new Date(prev.expectedCompleteDate));
		}
		setSortedWIP(sortedArray);
	};

	const AvatarGroup = ({ avatars }) => {
		const maxVisible = 3;
		const validAvatars = avatars.filter((name) => name);
		const extraCount = validAvatars.length > maxVisible ? validAvatars.length - maxVisible : 0;

		return (
			<div className="avatar-group d-flex align-items-center">
				{validAvatars.slice(0, maxVisible).map((avatar, index) => (
					<Avatar className="react-avatar" key={index} size={50} round={true} name={avatar} />
				))}
				{extraCount > 0 && (
					<div className="avatar-extra d-flex align-items-center justify-content-center">+{extraCount}</div>
				)}
			</div>
		);
	};

	if (!project) {
		return <div>Loading...</div>;
	}

	return (
		<div className="rounded-4 border shadow p-5 my-4">
			<label className='fs-3 mb-3 text-center'>WIP in project</label>
			<div className="d-flex mb-3 mx-0 justify-content-between flex-wrap">
				<div className="d-flex ml-auto">
					<ProtectedComponent requiredRoles={['sale']}>
						<Link to="wip-create" className="btn btn-outline-primary btn-lg">
							<FontAwesomeIcon icon={faPlusCircle} fixedWidth className="me-1" />
							<span>Create WIP</span>
						</Link>
					</ProtectedComponent>
				</div>
				<select
					className="form-select"
					id="SelectSort"
					value={selectSort}
					onChange={handleChangeSort}
					style={{ width: '8rem' }}>
					<option value="" disabled>
						Sort
					</option>
					<option value="numberMin">Sort By WIP Number ↓</option>
					<option value="numberMax">Sort By WIP Number ↑</option>
					<option value="dateMin">Sort By Date ↓</option>
					<option value="dateMax">Sort By Date ↑</option>
				</select>
			</div>
			{sortedWIP.length > 0 ? (
				<div className='d-none d-lg-block'>
					<div className='d-flex flex-wrap my-3 mx-3 fs-4'>
						<div className='mx-2' style={{ flex: '1 1 15%', width: '12rem' }}>WIP Number</div>
						<div className='mx-2' style={{ flex: '1 1 25%', width: '20rem' }}>Owner</div>
						<div className='mx-2' style={{ flex: '1 1 30%', width: '24rem' }}>วันเสร็จสิ้นงานที่คาดหวัง</div>
						<div className='mx-2' style={{ flex: '1 1 10%', width: '12rem' }}>Status</div>
					</div>
				</div>
			) : (
				<div></div>
			)}
			<div className="d-row flex-wrap">
				{sortedWIP.length > 0 ? (
					sortedWIP.map((wipItem) => {
						return (
							<div
								className="card my-3 d-flex justify-content-center fs-4"
								style={{ cursor: 'pointer', border: '1px solid #ddd', borderRadius: '5px' }}
								onClick={() => handleCardClick(wipItem._id)}>
								<div className="m-3 d-flex flex-wrap">
									<div className="underline-on-hover m-2" style={{ flex: '1 1 15%', width: '12rem', alignContent: 'center' }}>
										<ContentRenderer value={wipItem.wipNumber || 'N/A'} />
									</div>
									<div className="m-3 d-flex" style={{ flex: '1 1 25%', width: '20rem', alignItems: 'center' }}>
										<AvatarGroup
											avatars={[
												wipItem.engineerOwner?.displayName.split(' ')[0].replace('.', ' ') || '',
												wipItem.cablingOwner?.displayName.split(' ')[0].replace('.', ' ') || '',
												wipItem.datacenterOwner?.displayName.split(' ')[0].replace('.', ' ') || ''
											]}
										/>
									</div>
									<div className="m-3" style={{ flex: '1 1 30%', width: '24rem', alignContent: 'center' }}>
										<ContentRenderer value={getFormattedDate(wipItem.expectedCompleteDate) || 'N/A'} />
									</div>
									<div className="m-3" style={{ flex: '1 1 10%', width: '12rem', alignContent: 'center' }}>
										<div className='d-flex flex-row align-items-center'>
											<BadgeCardWIPStatus status={wipItem.status} />
										</div>
									</div>
								</div>
							</div>
						);
					})
				) : (
					<div className="my-4 fs-2 text-center" style={{ color: 'gray' }}>
						Don't have WIP
					</div>
				)}
			</div>
		</div>
	);
}

export default WIPList;
