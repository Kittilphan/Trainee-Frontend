import React from 'react';
import { useNavigate } from 'react-router-dom';
import imgSrc from '../../../../assets/images/backButton.png';

function BackButton({ classNames = 'd-none d-md-inline', sizePx = 32, padding = 4, navigateOnClick }) {
	let navigate = useNavigate();
	return (
		<img
			src={imgSrc}
			width={`${sizePx}px`}
			height={`${sizePx}px`}
			className={classNames}
			style={{
				borderRadius: '50%',
				padding: `${padding}px`,
				cursor: 'pointer',
				transition: 'background-color 0.3s ease'
			}}
			onMouseOver={(e) => {
				e.target.style.backgroundColor = '#acacac';
			}}
			onMouseOut={(e) => {
				e.target.style.backgroundColor = 'transparent';
			}}
			onClick={() => {
				navigateOnClick && typeof navigateOnClick === 'function' ? navigateOnClick() : navigate(-1);
			}}
			alt="Back Button"
		/>
	);
}

export default BackButton;
