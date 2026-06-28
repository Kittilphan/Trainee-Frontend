import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const SwalLoading = () => {
	return MySwal.fire({
		allowOutsideClick: false,
		showConfirmButton: false,
		showCloseButton: false,
		html: (
			<div className="overflow-hidden pt-3 pb-1">
				<FontAwesomeIcon icon={faSpinner} className="fa-fw spinner" size="2x" />
				<div className="mt-2">Please wait</div>
			</div>
		)
	});
};

export const SwalDialog = ({ icon, text = '', options = {} }) => {
	return MySwal.fire({
		icon,
		html: text.replace(/\n/, '<br>'),
		timer: 3000,
		customClass: {
			confirmButton: 'btn btn-secondary'
		},
		confirmButtonText: 'Close',
		...options
	});
};

export const SwalConfirm = ({ icon, text, callbackConfirm = () => {}, callbackCancel = () => {}, options }) => {
	MySwal.fire({
		title: 'Confirmation',
		text,
		icon,
		showCancelButton: true,
		showConfirmButton: true,
		...options
	}).then(({ isConfirmed }) => {
		if (isConfirmed === true) {
			callbackConfirm();
			return;
		}
		callbackCancel();
	});
};
