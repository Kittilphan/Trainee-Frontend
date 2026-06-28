import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Select, { components } from 'react-select';
import ShipmentController from '../../../../controllers/Shipment';
// import EmployeesController from '../../../../controllers/Employees';
import AllUsersContext from '../../../../contexts/AllUsersContext';
import XOController from '../../../../controllers/XO';
import { SwalDialog } from '../../../Swal';
import { Modal, Button, Form } from 'react-bootstrap';
import DropZone from '../../../Uploader/Dropzone';
import FileList from '../../List/FileList/FileList';
import Avatar from 'react-avatar';
import useAuth from '../../../../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import BadgeXOStatus from '../../../BadgeStatus/XOStatus';

const CustomOption = (props) => {
	const name = props.data.value.replace('.', ' ');
	return (
		<components.Option {...props}>
			<div className="d-flex justify-content-between align-items-center">
				<div className="d-flex align-items-center">
					<Avatar name={name || 'Unknown User'} round={true} size={25} />
					<div className="ms-2">{props.data.label}</div>
				</div>
			</div>
		</components.Option>
	);
};
// clear state
// file accept
const AssignSaleOwner = ({ show, onClose }) => {
	const { user } = useAuth();
	const { getUserFilter, isLoadingUser } = useContext(AllUsersContext);

	const [selectedUser, setSelectedUser] = useState(null);
	const [currentStep, setCurrentStep] = useState(1);
	const steps = ['Select Sale & Upload File', 'Data Extraction & Validation', 'Review & Submit'];
	const [file, setFile] = useState(null);
	const [extractedData, setExtractedData] = useState(null);
	const [sales, setSales] = useState([]);
	const [xo, setXO] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showAll, setShowAll] = useState(false);

	useEffect(() => {
		if (show) fetchSales();
	}, [show, isLoadingUser]);

	const fetchSales = async () => {
		setIsLoading(true);
		try {
			const data = await getUserFilter(['sale']);

			setSales(
				data.map((sale) => ({
					value: sale.username,
					label: sale.displayName
				}))
			);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching sales:', error);
		}
	};

	const nextStep = async () => {
		try {
			let stepPassed = true;

			if (currentStep === 1) {
				if (!selectedUser) {
					SwalDialog({
						icon: 'error',
						text: 'Sale Owner is required.'
					});
					stepPassed = false;
				}

				if (!file) {
					SwalDialog({
						icon: 'error',
						text: 'Shipment File is required.'
					});
					stepPassed = false;
				}

				if (stepPassed) {
					await handleFileUpload();
				}
			} else if (currentStep === 2) {
				await validateXONumbers();
			}

			if (stepPassed && currentStep < 3) {
				setCurrentStep(currentStep + 1);
			}
		} catch (error) {
			// Catch any unexpected errors
			console.error('Error during the step transition:', error);
			SwalDialog({
				icon: 'error',
				text: error.message || 'An unexpected error occurred. Please try again.'
			});
		}
	};

	const prevStep = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	};

	const handleUploadFile = (file) => {
		setFile(file);
	};

	const handleRemoveFile = () => {
		setFile(null);
	};

	const handleFileUpload = async () => {
		setIsLoading(true);
		const formData = new FormData();
		formData.append('username', selectedUser);
		formData.append('file', file);
		formData.append('actionBy', user.username);

		try {
			const data = await ShipmentController.fileUpload({
				payload: formData
			});
			const { ShipmentAllReady, ShipmentCountNotReady, ShipmentCountReady } = data.extractedData;
			setExtractedData((prevData) => {
				const stockReady = ShipmentAllReady || ShipmentCountNotReady === 0 ? 2 : ShipmentCountReady > 0 ? 1 : 0;
				return { ...prevData, ...data, stockReady };
			});
		} catch (error) {
			console.error('Error uploading file:', error);
			SwalDialog({
				icon: 'error',
				text: error.response?.data || 'Failed to upload shipment file.'
			});
			throw new Error('File upload failed');
		} finally {
			setIsLoading(false);
		}
	};

	const validateXONumbers = async () => {
		setIsLoading(true);
		try {
			const xo = await XOController.validate({
				sale: selectedUser.value,
				xoNumbers: extractedData?.extractedData?.XOs[0] || 'undefined'
			});
			setXO(xo);
		} catch (err) {
			console.error('Error validating XO numbers:', err.response.data?.message);
			throw new Error(err.response?.data?.message || err.response?.data?.error || 'XO validation failed');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async () => {
		if (!xo?._id) {
			SwalDialog({
				icon: 'error',
				text: 'XO Id is not Exist'
			});
			return;
		}
		try {
			const { id, ...payload } = {
				id: xo?._id,
				fileDirectory: extractedData.fileDirectory,
				fileOriginalName: extractedData.filenameNew,
				fileName: extractedData.filenameNew,
				shipmentStatus: {
					saleOrderNumber: extractedData.extractedData?.SOs,
					webOrderNumber: extractedData.extractedData?.WOs,
					subscriptionNumber: extractedData.extractedData?.Subscriptions
				},
				stockReady: extractedData?.stockReady,
				SKUs: extractedData.extractedData?.SKUs
			};

			const result = await XOController.updateById({ id, payload });

			SwalDialog({
				icon: 'success',
				text: 'Shipment and XO data successfully submitted.'
			});
			handleClose();
		} catch (err) {
			console.error('Error submitting data:', err);

			// Display error message
			SwalDialog({
				icon: 'error',
				text: err.response?.data?.message || err.response?.data?.error || err
			});
		}
	};

	const handleClose = () => {
		setSelectedUser(null);
		setCurrentStep(1);
		setFile(null);
		setExtractedData(null);
		setXO(null);
		onClose();
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="d-flex flex-column gap-4 mt-4">
						<Form.Group>
							<h5 className="mb-2">Select Sale</h5>
							<Select
								name={'sale'}
								options={sales}
								components={{ Option: CustomOption }}
								value={selectedUser}
								onChange={setSelectedUser}
								isLoading={isLoading}
							/>
						</Form.Group>
						<Form.Group>
							<h5 className="text-nowrap">Upload Shipment File</h5>
							<h5 className="text-danger mb-2">** รองรับเพียง excel ที่มีเพียงชีท(Sheet) เดียวเท่านั้น</h5>
							<DropZone caption={`Upload Shipment File`} callbackUploadFile={handleUploadFile} />
							<FileList file={file} callbackRemoveFile={handleRemoveFile} />
						</Form.Group>
					</div>
				);
			case 2:
				return (
					<div className="mt-4">
						<h5>Data Extracted from Shipment File</h5>
						{extractedData ? (
							<div className="mt-4 ms-3">
								<h6>
									<strong>File Name:</strong> {extractedData.filenameOriginal}
								</h6>

								<h6>
									<strong>XO Details:</strong>
								</h6>
								<ul className="ms-4">
									{extractedData.extractedData.XOs.length > 0 ? (
										extractedData.extractedData.XOs.map((xo, index) => (
											<li key={index}>
												XO {index + 1}: {xo}
											</li>
										))
									) : (
										<li>No XOs found</li>
									)}
								</ul>

								<ul>
									<li>
										<strong>SOs:</strong>{' '}
										{extractedData.extractedData.SOs.length > 0
											? extractedData.extractedData.SOs.join(', ')
											: 'No SOs found'}
									</li>
									<li>
										<strong>WOs:</strong>{' '}
										{extractedData.extractedData.WOs.length > 0
											? extractedData.extractedData.WOs.join(', ')
											: 'No WOs found'}
									</li>
									<li>
										<strong>Subscriptions:</strong>{' '}
										{extractedData.extractedData.Subscriptions.length > 0
											? extractedData.extractedData.Subscriptions.join(', ')
											: 'No Subscriptions found'}
									</li>
								</ul>

								<h6 className="mt-4">
									<strong>Shipment Details:</strong>
								</h6>
								<ul>
									{/* <li>
										<strong>Shipment All Ready:</strong>{' '}
										{extractedData.extractedData.ShipmentAllReady !== null
											? extractedData.extractedData.ShipmentAllReady.toString()
											: 'Not available'}
									</li> */}
									<li className="d-flex justify-content-between">
										<div>
											<strong>Shipment Count Ready:</strong> {extractedData.extractedData.ShipmentCountReady}
										</div>
										<div>
											<strong>Shipment Count Not Ready:</strong> {extractedData.extractedData.ShipmentCountNotReady}
										</div>
									</li>
									<li>
										<strong>Shipment Not Ready Items:</strong>
										{extractedData.extractedData.ShipmentNotReadyItems.length > 0 ? (
											<>
												<table className="table">
													<thead>
														<tr>
															<th scope="col">P/N</th>
															<th scope="col">Form Factory</th>
															<th scope="col">DCS (Stock)</th>
														</tr>
													</thead>
													<tbody>
														{/* Show only the first 5 items initially */}
														{extractedData.extractedData.ShipmentNotReadyItems.slice(0, showAll ? undefined : 5).map(
															(item, index) => (
																<tr key={index}>
																	<th scope="row">{item[0] || '-'}</th>
																	<td>{item[1] || '-'}</td>
																	<td>{item[2] || '-'}</td>
																</tr>
															)
														)}
													</tbody>
												</table>
												<div className="w-100 d-flex justify-content-end">
													{extractedData.extractedData.ShipmentNotReadyItems.length > 5 && (
														<button className="btn btn-link" onClick={() => setShowAll((prev) => !prev)}>
															{showAll
																? 'Show Less'
																: `Show All (5/${extractedData.extractedData.ShipmentNotReadyItems.length})`}
														</button>
													)}
												</div>
											</>
										) : (
											<span>No items</span>
										)}
									</li>
								</ul>
							</div>
						) : (
							<p>No data extracted yet.</p>
						)}
					</div>
				);
			case 3:
				return (
					<div className="w-100 d-flex gap-3">
						<div className="mt-4 flex-fill">
							<h5>found in database</h5>
							{xo ? (
								<div className="mt-3 ms-3">
									<h6>
										<strong>XO Number:</strong> {xo.xoNumber || 'N/A'}
									</h6>
									<br />

									<h6>
										<strong>Sale Owner:</strong> {xo.createdBy || 'N/A'}
									</h6>
									<h6>
										<strong>Updated By:</strong> {xo.updatedBy || 'N/A'} on {new Date(xo.updatedAt).toLocaleString()}
									</h6>

									<h6 className="mt-3">
										<strong>Shipment Status:</strong>
									</h6>
									<ul className="ms-4">
										<li>
											<strong>Sale Order Number:</strong>{' '}
											{xo.shipmentStatus.saleOrderNumber?.length > 0
												? xo.shipmentStatus.saleOrderNumber.join(', ')
												: 'No sale orders'}
										</li>
										<li>
											<strong>Web Order Number:</strong>{' '}
											{xo.shipmentStatus.webOrderNumber?.length > 0
												? xo.shipmentStatus.webOrderNumber.join(', ')
												: 'No web orders'}
										</li>
										<li>
											<strong>Subscription Number:</strong>{' '}
											{xo.shipmentStatus.subscriptionNumber?.length > 0
												? xo.shipmentStatus.subscriptionNumber.join(', ')
												: 'No subscriptions'}
										</li>
									</ul>

									<h6 className="mt-3">
										<strong>Stock Information:</strong>
									</h6>
									<ul className="ms-4">
										<li className="mt-2 d-flex gap-3">
											<strong>Status:</strong> <BadgeXOStatus status={xo.stockReady} />
										</li>
									</ul>
								</div>
							) : (
								<p>No XO data available.</p>
							)}
						</div>
						<FontAwesomeIcon icon={faArrowLeft} fixedWidth className="my-auto mx-3" />
						<div className="mt-4 flex-fill">
							<h5>new upload</h5>
							{extractedData?.extractedData ? (
								<div className="mt-3 ms-3">
									<h6>
										<strong>XO Number:</strong> {extractedData.extractedData.XOs[0] || 'N/A'}
									</h6>
									<br />

									<h6>
										<strong>Sale Owner:</strong> {selectedUser.label || 'N/A'}
									</h6>

									<h6 className="mt-3">
										<strong>Shipment Status:</strong>
									</h6>
									<ul className="ms-4">
										<li>
											<strong>Sale Order Number:</strong>{' '}
											{extractedData?.extractedData.SOs.length > 0
												? extractedData?.extractedData.SOs.join(', ')
												: 'No sale orders'}
										</li>
										<li>
											<strong>Web Order Number:</strong>{' '}
											{extractedData?.extractedData.WOs.length > 0
												? extractedData?.extractedData.WOs.join(', ')
												: 'No web orders'}
										</li>
										<li>
											<strong>Subscription Number:</strong>{' '}
											{extractedData?.extractedData.Subscriptions.length > 0
												? extractedData?.extractedData.Subscriptions.join(', ')
												: 'No subscriptions'}
										</li>
									</ul>
									<h6 className="mt-3">
										<strong>Stock Information:</strong>
									</h6>
									<ul className="ms-4">
										<li className="mt-2 d-flex gap-3">
											<strong>Status: </strong> <BadgeXOStatus status={extractedData?.stockReady} />
										</li>
									</ul>
								</div>
							) : (
								<p>No XO data available.</p>
							)}
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	if (!show) return null;

	return (
		<Modal show={show} onHide={handleClose} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Upload Shipment Status</Modal.Title>
			</Modal.Header>
			<Modal.Body className="px-5">
				<div className="stepper-wrapper">
					{steps.map((step, index) => (
						<div
							key={index}
							className={`stepper-item ${
								index + 1 > currentStep ? '' : index + 1 === currentStep ? 'active' : 'completed'
							}`}>
							<div className="step-counter">{index + 1}</div>
							<div className="step-name">{step}</div>
						</div>
					))}
				</div>
				{renderStepContent()}
			</Modal.Body>
			<Modal.Footer>
				{currentStep > 1 && (
					<Button variant="secondary" onClick={prevStep}>
						Back
					</Button>
				)}
				{currentStep < 3 ? (
					<Button variant="primary" onClick={nextStep}>
						Next
					</Button>
				) : (
					<Button variant="success" onClick={handleSubmit}>
						Submit
					</Button>
				)}
			</Modal.Footer>
		</Modal>
	);
};

export default AssignSaleOwner;
