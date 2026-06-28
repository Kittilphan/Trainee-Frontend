import React from 'react';
import BadgeCardStatus from '.';
import { faBox, faBoxOpen, faHourglass, faPhone } from '@fortawesome/free-solid-svg-icons';

function BadgeXOStatus({ status }) {
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

	return (
		<BadgeCardStatus
			status={status}
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
	);
}

export default BadgeXOStatus;
