import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import VendorController from '../../controllers/Vendors/index';
import XOController from '../../controllers/XO/index';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { SwalDialog } from '../Swal';
import { faSlash } from '@fortawesome/free-solid-svg-icons';

const CreateXO = ({ show, closeModal, wipNumber, filePO, onSubmit = handleSubmit }) => {
	const { projectId, wipId } = useParams();
	const navigate = useNavigate();
	const [xoNumbers, setXoNumbers] = useState([{ _id: '', xoNumber: '', vendor: '', isDeleted: 0 }]);
	const [vendors, setVendors] = useState([]);
	const [vendorLoading, setVendorLoading] = useState(true);

	useEffect(() => {
		if (show) {
			fetchVendors();
		}
	}, [show]);

	useEffect(() => {
		if (filePO?.xoNumbers) {
			const newXONumbers = filePO.xoNumbers.map((xo) => ({
				...xo,
				xoNumber: xo.xoNumber
			}));
			setXoNumbers(newXONumbers);
		} else {
			setXoNumbers([{ _id: '', xoNumber: '', vendor: '' }]);
		}
	}, [show, filePO]);

	if (!show) return null;

	const fetchVendors = async () => {
		setVendorLoading(true);
		try {
			const vendorData = await VendorController.list({});
			const vendorOptions = (Array.isArray(vendorData.vendors) ? vendorData.vendors : []).map((vendor) => ({
				value: vendor.name,
				label: vendor.name
			}));
			setVendors(vendorOptions);
		} catch (error) {
			console.error('Error fetching vendors:', error);
			SwalDialog({
				icon: 'error',
				text: 'Failed to fetch vendors.',
				options: {}
			});
		} finally {
			setVendorLoading(false);
		}
	};

	const handleXoChange = (index, event) => {
		const newXoNumbers = xoNumbers.map((xo, i) => (i === index ? { ...xo, xoNumber: event.target.value } : xo));
		setXoNumbers(newXoNumbers);
	};

	const handleVendorChange = (index, selectedOption) => {
		const newXoNumbers = xoNumbers.map((xo, i) =>
			i === index ? { ...xo, vendor: selectedOption ? selectedOption.value : '' } : xo
		);
		setXoNumbers(newXoNumbers);
	};

	const handleAddXoNumber = () => {
		setXoNumbers([...xoNumbers, { xoNumber: '', vendor: '', isDeleted: 0 }]);
	};

	const handleDeleteXoNumber = (index) => {
		const newXoNumbers = xoNumbers.map((xo, i) => (i === index ? { ...xo, isDeleted: 1 } : xo));
		setXoNumbers(newXoNumbers);
	};

	const handleClose = () => {
		closeModal();
	};

	const handleSave = () => {
		onSubmit(wipNumber, filePO, xoNumbers, handleClose, navigate, projectId);
	};

	return (
		<Modal show={show} onHide={closeModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Create XO</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{wipNumber && (
					<div className="mb-3">
						<label htmlFor="WIPnumber" className="form-label">
							WIP
						</label>
						<input type="text" className="form-control" id="WIPnumber" value={wipNumber} disabled />
					</div>
				)}
				<div className="mb-3">
					<label htmlFor="filePO" className="form-label">
						PO
					</label>
					<input
						type="text"
						className="form-control"
						id="filePO"
						value={filePO.originalName || filePO.name || filePO.path || filePO.description}
						disabled
					/>
				</div>
				<div className="mb-4">
					<label className="form-label">XO Numbers</label>
					{xoNumbers.map(
						(xo, index) =>
							xo.isDeleted !== 1 && (
								<div key={index} className="mb-3">
									<div className="input-group mb-2">
										<input
											type="number"
											className="form-control"
											placeholder="Enter XO Number"
											value={xo.xoNumber || ''}
											onChange={(event) => handleXoChange(index, event)}
											inputMode="numeric"
											pattern="[0-9]*"
										/>
										<button className="btn btn-danger" onClick={() => handleDeleteXoNumber(index)}>
											Delete
										</button>
									</div>
									<Select
										className="basic-single"
										classNamePrefix="select"
										options={vendors}
										value={xo.vendor ? vendors.find((v) => v.value === xo.vendor) : null}
										onChange={(option) => handleVendorChange(index, option)}
										isClearable
										placeholder="Select Vendor"
										isLoading={vendorLoading}
									/>
								</div>
							)
					)}
					<button className="btn btn-outline-success w-100" onClick={handleAddXoNumber}>
						Add XO Number
					</button>
				</div>
			</Modal.Body>
			<Modal.Footer>
				<button type="button" className="btn btn-secondary" onClick={handleClose}>
					Cancel
				</button>
				<button type="button" className="btn btn-primary" onClick={handleSave}>
					Save
				</button>
			</Modal.Footer>
		</Modal>
	);
};

const handleSubmit = async (wipNumber, filePO, xoNumbers, handleClose, navigate, projectId) => {
	const xoData = xoNumbers.map((xo) => ({
		xoId: xo._id,
		wipNumber: wipNumber,
		filePO: {
			description: filePO.description,
			reference: filePO.reference,
			type: filePO.type,
			_id: filePO._id
		},
		projectId: projectId,
		xoNumber: xo.xoNumber,
		vendor: xo.vendor,
		isDeleted: xo.isDeleted
	}));

	if (xoData.some((xo) => !xo.xoNumber && xo.isDeleted !== 1)) {
		SwalDialog({
			icon: 'error',
			text: 'XO Numbers are required.',
			options: {}
		});
		return;
	}
	if (xoData.some((xo) => !xo.vendor && xo.isDeleted !== 1)) {
		SwalDialog({
			icon: 'error',
			text: 'Vendor for each XO is required.',
			options: {}
		});
		return;
	}
	try {
		for (const xo of xoData) {
			let cancelTokenSource = axios.CancelToken.source();
			await XOController.createAndUpdate({
				payload: xo,
				options: { cancelToken: cancelTokenSource.token }
			});
		}
		SwalDialog({
			icon: 'success',
			text: `XO created`,
			options: {}
		}).then(() => {
			handleClose();
			navigate(-1);
			setTimeout(() => {
				navigate(1);
			}, 1);
		});
	} catch (err) {
		console.error(`ERROR XOController.create()`, err);
		SwalDialog({
			icon: 'error',
			text: `${err}`,
			options: {}
		});
	}
};

export default CreateXO;
