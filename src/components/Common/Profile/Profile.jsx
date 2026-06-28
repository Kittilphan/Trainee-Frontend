import React from 'react';
import Style from './style.module.css';
import Avatar from 'react-avatar';
import Update from '../../../assets/icons/repeat.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faXmark } from '@fortawesome/free-solid-svg-icons';

function Profile({ role, username, isUpdate, sizeComponent, onClick, isRequesting }) {
	const name = username?.split(' ')[0].replace('.', ' ') || '';

	const displayRole = (
		role && role.startsWith('Presale') ? role.replace(/^Presale/, 'Infra') : role || 'Unknown Role'
	).replace(/-/, ' ');

	const toTitleCase = (str) => {
		return str.replace(/\w\S*/, (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase());
	};

	return (
		<div className="mt-3 text-center" onClick={onClick} style={sizeComponent}>
			<div className={Style.container}>
				{isUpdate ? (
					<img
						src={Update}
						alt="edit icon"
						className={`${Style.editIcon} position-absolute start-50 top-50 translate-middle`}
						role="button"
					/>
				) : null}
				{isRequesting === 1 ? (
					<div
						style={{ height: 50, width: 50 }}
						className="mb-3 mx-auto fw-bold text-white d-flex bg-graylight rounded-circle align-items-center justify-content-center">
						PM
					</div>
				) : isRequesting === 2 ? (
					<div
						style={{ height: 50, width: 50 }}
						className="mb-3 mx-auto d-flex bg-danger rounded-circle align-items-center justify-content-center">
						<FontAwesomeIcon icon={faXmark} size="3x" style={{ color: 'white' }} />
					</div>
				) : (
					<Avatar name={name} round={true} className={Style.profileIcon} size={50} />
				)}
			</div>
			<h4 className="mt-1 text-nowarp">{username || 'Unknown User'}</h4>
			<h5 className="text-gray mt-1">{toTitleCase(displayRole)}</h5>
		</div>
	);
}

export default Profile;
