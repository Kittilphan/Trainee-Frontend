import React from 'react';
import Style from './style.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

function UserIcon({ users }) {
	return (
		<div className={Style.iconContainer}>
			{users.map((user, index) => (
				<div key={index} className={Style.iconWrapper}>
					<FontAwesomeIcon icon={faUser} />
					<span className={Style.tooltip}>{user.username}</span>
				</div>
			))}
		</div>
	);
}

export default UserIcon;
