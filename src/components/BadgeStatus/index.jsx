import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Style from './style.module.css';
import {
	faPlayCircle,
	faCheckCircle,
	faSlash,
	faHand,
	faThumbsUp,
	faLightbulb
} from '@fortawesome/free-solid-svg-icons';

export default function BadgeCardStatus({ status, labelStatus, iconStatus, backgroundColors, textColor }) {
	const getStatusLabel = (status) => {
		if (labelStatus && labelStatus[status] !== undefined) {
			return labelStatus[status];
		}

		switch (status) {
			case 0:
				return 'New';
			case 1:
				return 'Proposing';
			case 2:
				return 'Implementing';
			case 3:
				return 'Done';
			default:
				return 'Cancelled';
		}
	};

	const getStatusIcon = (status) => {
		if (iconStatus && iconStatus[status] !== undefined) {
			return <FontAwesomeIcon icon={iconStatus[status]} fixedWidth className="mt-1 small pb-1" />;
		}

		switch (status) {
			case 0:
				return <FontAwesomeIcon icon={faLightbulb} fixedWidth className="mt-1 small pb-1" />;
			case 1:
				return <FontAwesomeIcon icon={faThumbsUp} fixedWidth className="mt-1 small pb-1" />;
			case 2:
				return <FontAwesomeIcon icon={faPlayCircle} fixedWidth className="mt-1 small pb-1" />;
			case 3:
				return <FontAwesomeIcon icon={faCheckCircle} fixedWidth className="mt-1 small pb-1" />;
			default:
				return (
					<div className="mt-1 fa-layers fa-fw text-secondary">
						<FontAwesomeIcon icon={faSlash} />
						<FontAwesomeIcon icon={faHand} />
					</div>
				);
		}
	};

	const getBackgroundColor = (status) => {
		return backgroundColors && backgroundColors[status] ? backgroundColors[status] : '';
	};

	const getTextColor = (status) => {
		return textColor && textColor[status] ? textColor[status] : '';
	};

	return (
		<div
			className={[Style.cardBadgeStatus, Style[`cardBadgeStatus-${status}`]].join(' ')}
			data-project-state={status}
			style={{
				backgroundColor: getBackgroundColor(status),
				color: getTextColor(status)
			}}>
			<div className="d-flex align-items-center gap-1">
				{getStatusIcon(status)}
				<label>{getStatusLabel(status)}</label>
			</div>
		</div>
	);
}
