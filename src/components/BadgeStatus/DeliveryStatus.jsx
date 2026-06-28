import React from 'react';
import BadgeCardStatus from '.';
import { faInbox, faCheckCircle, faTimesCircle, faPhone } from '@fortawesome/free-solid-svg-icons';

function BadgeDeliveryStatus({ status }) {
	const backgroundColors = {
		0: 'rgb(var(--rgb-app-graylight))',
		1: 'rgb(var(--rgb-app-green))',
		2: 'rgb(var(--rgb-app-red))',
		3: 'rgb(var(--rgb-app-blue))'
	};
	const textColor = {
		0: 'rgb(var(--rgb-app-reddark))',
		1: 'rgb(var(--rgb-app-white))',
		2: 'rgb(var(--rgb-app-white))',
		3: 'rgb(var(--rgb-app-white))'
	};

	return (
		<BadgeCardStatus
			status={status}
			labelStatus={{
				0: 'New',
				1: 'Done',
				2: 'Cancel',
				3: 'Issue'
			}}
			iconStatus={{
				0: faInbox,
				1: faCheckCircle,
				2: faTimesCircle,
				3: faPhone
			}}
			backgroundColors={backgroundColors}
			textColor={textColor}
		/>
	);
}

export default BadgeDeliveryStatus;
