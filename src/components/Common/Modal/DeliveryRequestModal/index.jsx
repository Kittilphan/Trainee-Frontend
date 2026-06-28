import React, { useContext, useEffect, useState } from 'react';
import { Modal, Button, Form, Container, Spinner } from 'react-bootstrap';
import Select, { components } from 'react-select';
import DropZone from '../../../Uploader/Dropzone';
import FileList from '../../List/FileList/FileList';
import AutoResizingTextarea from '../../../AutoResizingTextarea/AutoResizingTextarea';
import DeliveryRequestController from '../../../../controllers/DeliveryRequests';
import CustomerController from '../../../../controllers/Customers';
import XOController from '../../../../controllers/XO';
import Avatar from 'react-avatar';
import { SwalConfirm, SwalDialog } from '../../../Swal';
import axios from 'axios';
import AllUsersContext from '../../../../contexts/AllUsersContext';
import { ROLES } from '../../../../constants/users';
import { DEFAULT_DELIVERY_ADMIN } from '../../../../constants/deliveryRequests';

const CustomOption = (props) => (
	<components.Option {...props}>
		<div className="d-flex justify-content-between align-items-center">
			<div className="d-flex align-items-center">
				<Avatar name={props.data.username || 'Unknown User'} round={true} size={25} />
				<div className="ms-2">{props.data.displayName || 'Unknown User'}</div>
			</div>
		</div>
	</components.Option>
);

const DeliveryRequestModal = ({ show, onClose, filePOs, project = {}, presales = [], wipId }) => {
	const { isLoadingUser, getUserFilter } = useContext(AllUsersContext);

	const [deliveryRequest, setDeliveryRequest] = useState({
		deliveryAt: new Date(Date.now()).toISOString(),
		implementation: '',
		filePOs: [],
		expectCompletaionAt: '',
		jobRequestDetail: '',
		customerId: '',
		customerIsTemp: 0,
		site: '',
		address: '',
		contactPerson: '',
		presale: null,
		remark: '',
		wipId: ''
	});
	const [isLoading, setIsLoading] = useState(false);
	const [locationsLoading, setLocationsLoading] = useState(false);
	const [deleveryOptions, setDeliveryOptions] = useState([]);
	const [useOfficialAddress, setUseOfficialAddress] = useState(false);
	const [AddressOptions, setAddressOptions] = useState([]);

	useEffect(() => {
		setDeliveryRequest((prevDeliveryRequest) => ({
			...prevDeliveryRequest,
			filePOs: filePOs,
			customerId: project.customer?._id,
			customerIsTemp: project.customer?.isTemp,
			wipId: wipId
		}));

		return;
	}, [filePOs, project]);

	useEffect(() => {
		const fetchAdmin = async () => {
			const result = await getUserFilter([ROLES.ADMIN, ROLES.DELIVERY_ADMIN]);
			if (result.length > 0) {
				setDeliveryOptions(result);
				if (DEFAULT_DELIVERY_ADMIN) {
					const { _id, displayName } = result.find((user) => user.username === DEFAULT_DELIVERY_ADMIN);
					setDeliveryRequest((prev) => ({
						...prev,
						designated: { _id, displayName }
					}));
				}
			}
		};
		fetchAdmin();
		return;
	}, []);

	const FetchItems = async (xoId) => {
		setIsLoading(true);
		try {
			const items = await XOController.getItemById({
				id: xoId
			});
			setDeliveryRequest((prevDeliveryRequest) => {
				const updatedFilePOs = prevDeliveryRequest.filePOs.map((po) => ({
					...po,
					xoNumbers: po.xoNumbers.map((xo) => {
						return xo._id === xoId ? { ...xo, items: items || [], isLoading: false } : xo;
					})
				}));
				return {
					...prevDeliveryRequest,
					filePOs: updatedFilePOs
				};
			});
		} catch (err) {
			console.error('Error Fetching Items :', err);
			throw new Error(err.response?.data?.message || err.response?.data?.error || 'Error Fetching items');
		} finally {
			setIsLoading(false);
		}
	};

	const FetchLocations = async () => {
		setLocationsLoading(true);
		try {
			const locations = await CustomerController.getLocationsById({
				id: deliveryRequest.customerId
			});
			setAddressOptions(locations);
		} catch (err) {
			console.error('Error Fetching Locations :', err);
			throw new Error(err.response?.data?.message || err.response?.data?.error || 'Error Fetching items');
		} finally {
			setLocationsLoading(false);
		}
	};

	const setXOShowAll = (xoId) => {
		setDeliveryRequest((prevDeliveryRequest) => {
			const updatedFilePOs = prevDeliveryRequest.filePOs.map((po) => ({
				...po,
				xoNumbers: po.xoNumbers.map((xo) =>
					xo._id === xoId
						? {
								...xo,
								showAll: !xo.showAll
						  }
						: xo
				)
			}));
			return {
				...prevDeliveryRequest,
				filePOs: updatedFilePOs
			};
		});
	};

	const handleChange = (e, type) => {
		const { id, name, value } = e.target;
		const label = name || id;
		if (type === 'date') {
			const newDateTime = `${value}T${deliveryRequest.deliveryAt?.split('T')[1] || '07:00'}`;
			setDeliveryRequest((prevDeliveryRequest) => ({
				...prevDeliveryRequest,
				[label]: newDateTime
			}));
		} else if (type === 'time') {
			const newDateTime = `${deliveryRequest.deliveryAt?.split('T')[0]}T${value}`;
			setDeliveryRequest((prevDeliveryRequest) => ({
				...prevDeliveryRequest,
				[label]: newDateTime
			}));
		} else if (e.target) {
			setDeliveryRequest((prevDeliveryRequest) => ({
				...prevDeliveryRequest,
				[label]: value
			}));
		}
	};

	const handleCheckboxChange = (xoId, checked) => {
		setDeliveryRequest((prevDeliveryRequest) => {
			const updatedFilePOs = prevDeliveryRequest.filePOs.map((po) => ({
				...po,
				xoNumbers: po.xoNumbers.map((xo) => {
					const isTargetXO = xo._id === xoId;
					const isCheckedStateChanging = xo.checked !== checked;

					if (isTargetXO && xo.checked && xo.fileDelivertReq?.length > 0) {
						SwalDialog({
							icon: 'warning',
							text: 'Remove Delivery Request File Before',
							options: {}
						});
						return xo;
					}

					const newCheckedState = isCheckedStateChanging ? checked : checked - 1;
					if (isTargetXO && newCheckedState === 2) FetchItems(xoId);

					return isTargetXO ? { ...xo, checked: newCheckedState, isLoading: newCheckedState === 2 } : xo;
				})
			}));
			return {
				...prevDeliveryRequest,
				filePOs: updatedFilePOs
			};
		});
	};

	const handleUploadFile = (file, xoId, type) => {
		setDeliveryRequest((prevDeliveryRequest) => {
			const updatedFilePOs = prevDeliveryRequest.filePOs.map((po) => ({
				...po,
				xoNumbers: po.xoNumbers.map((xo) =>
					xo._id === xoId
						? {
								...xo,
								[type]: [...(xo[type] || []), file]
						  }
						: xo
				)
			}));
			return {
				...prevDeliveryRequest,
				filePOs: updatedFilePOs
			};
		});
	};

	const handleRemoveFile = (index, xoId, type) => {
		setDeliveryRequest((prevDeliveryRequest) => {
			const updatedFilePOs = prevDeliveryRequest.filePOs.map((po) => ({
				...po,
				xoNumbers: po.xoNumbers.map((xo) =>
					xo._id === xoId
						? {
								...xo,
								[type]: (xo[type] || []).filter((_, i) => i !== index)
						  }
						: xo
				)
			}));
			return {
				...prevDeliveryRequest,
				filePOs: updatedFilePOs
			};
		});
	};

	const handleUseOfficialAddress = () => {
		const changeTo = !useOfficialAddress;
		setUseOfficialAddress(changeTo);
		if (changeTo) FetchLocations();
	};

	const handleSubmit = () => {
		if (!deliveryRequest.filePOs || deliveryRequest.filePOs.length === 0) {
			SwalDialog({
				icon: 'warning',
				text: 'Delivery XO Number is required',
				options: {}
			});
			return;
		}
		if (!deliveryRequest.deliveryAt) {
			SwalDialog({
				icon: 'warning',
				text: 'Delivery Date is required',
				options: {}
			});
			return;
		}
		if (!deliveryRequest.implementation) {
			SwalDialog({
				icon: 'warning',
				text: 'Implementation selection is required',
				options: {}
			});
			return;
		}
		if (!deliveryRequest.address) {
			SwalDialog({
				icon: 'warning',
				text: 'Address is required',
				options: {}
			});
			return;
		}
		if (!deliveryRequest.contactPerson) {
			SwalDialog({
				icon: 'warning',
				text: 'Contact Person is required',
				options: {}
			});
			return;
		}
		const sendData = () => {
			const include = [
				'deliveryAt',
				'projectId',
				'implementation',
				'expectCompletaionAt',
				'jobRequestDetail',
				'customerId',
				'customerIsTemp',
				'site',
				'address',
				'contactPerson',
				'remark',
				'wipId'
			];

			const formData = new FormData();

			Object.keys(deliveryRequest).forEach((key) => {
				if (
					include.includes(key) &&
					deliveryRequest[key] !== null &&
					deliveryRequest[key] !== undefined &&
					deliveryRequest[key] !== ''
				) {
					formData.append(key, deliveryRequest[key]);
				}
			});

			const appendDeliveryReqToFormData = (filesArray) => {
				if (filesArray) {
					let fileIndex = 0;
					filesArray.forEach((po, i) => {
						po.xoNumbers?.forEach((xoNumber, j) => {
							if (xoNumber.checked) {
								let fileList = [];
								xoNumber.fileDelivertReq?.forEach((file, k) => {
									fileList.push(fileIndex++);
									formData.append(`fileDelivertReq`, file);
								});
								formData.append(
									'xoNumber[]',
									JSON.stringify({
										xoNumber: xoNumber.xoNumber,
										fileReqIndex: fileList,
										areAll: xoNumber.checked === 2 ? true : false
									})
								);
							}
						});
					});
				}
			};

			appendDeliveryReqToFormData(deliveryRequest.filePOs);

			formData.append('projectId', project._id);
			if (deliveryRequest.presale) formData.append('presale', deliveryRequest.presale._id);
			if (deliveryRequest.designated) formData.append('designated', deliveryRequest.designated._id);
			if (deliveryRequest.ccto) formData.append('ccto', deliveryRequest.ccto._id);

			let cancelTokenSource = axios.CancelToken.source();
			setIsLoading(true);

			DeliveryRequestController.create({
				payload: formData,
				options: { cancelToken: cancelTokenSource.token }
			})
				.then((result) => {
					console.log('result: ', result);
					SwalDialog({
						icon: 'success',
						text: `Delivery Request is created`,
						options: {}
					}).then(() => {
						onClose();
					});
				})
				.catch((err) => {
					console.log(`ERROR ProjectController.create()`, err);
					SwalDialog({
						icon: 'error',
						text: `${err.response?.data || err}`,
						options: {}
					});
				})
				.finally(() => setIsLoading(false));
		};

		if (deliveryRequest.designated) {
			const designated = deliveryRequest.designated;
			const roles = [designated && `Designated: ${designated.displayName}`].filter(Boolean);

			const confirmationText = `
				<h3>Are you sure you want to send the mail to the following user(s)?</h3>
				<br/>
				<ul style="text-align: left;">
				  ${roles.map((role) => `<li>${role}</li>`).join('')}
				</ul>
			  `;

			SwalConfirm({
				icon: 'warning',
				options: {
					html: confirmationText,
					showCancelButton: true,
					confirmButtonText: 'Send it!',
					cancelButtonText: 'No, cancel',
					title: ''
				},
				callbackConfirm: () => {
					sendData();
					return;
				},
				callbackCancel: () => {
					return;
				}
			});
		} else sendData();
	};

	const handleClose = () => {
		setUseOfficialAddress(false);
		onClose();
	};

	return (
		<Modal show={show} onHide={handleClose} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Delivery Request Form</Modal.Title>
			</Modal.Header>
			<Modal.Body className="bg-light">
				<Container className="row gap-3 ">
					<div className="d-inline d-lg-flex">
						<div className="col-8 col-lg-2 text-nowrap">
							Delivery Date:<span className="text-danger"> *</span>
						</div>
						<div className="d-flex col-8 col-lg-2">
							<input
								type="date"
								className="form-control"
								name="deliveryAt"
								value={deliveryRequest.deliveryAt?.split('T')[0]}
								onChange={(e) => handleChange(e, 'date')}
							/>
							<input
								type="time"
								className="form-control ms-2"
								name="deliveryAt"
								value={deliveryRequest.deliveryAt ? deliveryRequest.deliveryAt.split('T')[1].slice(0, 5) : ''}
								onChange={(e) => handleChange(e, 'time')}
							/>
						</div>
					</div>

					<div className="d-inline d-lg-flex gap-3">
						<div className="col-8 col-lg-2">
							Implementation:<span className="text-danger"> *</span>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								name="implementation"
								id="implementation1"
								value="1"
								checked={deliveryRequest.implementation === '1'}
								onChange={handleChange}
							/>
							<label className="form-check-label" htmlFor="implementation1">
								Yes
							</label>
						</div>
						<div className="form-check">
							<input
								className="form-check-input"
								type="checkbox"
								name="implementation"
								id="implementation2"
								value="0"
								checked={deliveryRequest.implementation === '0'}
								onChange={handleChange}
							/>
							<label className="form-check-label" htmlFor="implementation2">
								No
							</label>
						</div>
					</div>
					<div className="d-inline d-lg-flex">
						<div className="col-8 col-lg-2">Project Name:</div>
						<div className="col-4">
							<input className="form-control" type="text" placeholder={project.projectName} disabled />
						</div>
					</div>
					<div>
						<div className="col-8 col-lg-2">
							Order Number (Cisco XO)<span className="text-danger"> *</span>
						</div>
						<div className="ms-3 mt-2">
							{deliveryRequest?.filePOs?.map((file) => (
								<div key={file._id} className="mb-3">
									<h5 className="text-primary mb-2">Confirmed Order Files: {file.description || file.originalName}</h5>
									{(!file.xoNumbers || file.xoNumbers.length === 0) && (
										<div className="ms-4 my-3">No Have Any Xo Number</div>
									)}
									{file.xoNumbers?.map((xo) => (
										<div key={xo?._id} className="ms-4 my-3">
											<div className="d-lg-flex">
												<div className="d-flex">
													<Form.Check
														type="checkbox"
														id={`checkbox${xo?._id}`}
														onChange={() => handleCheckboxChange(xo._id, 1)}
														className="mb-2"
														checked={xo.checked > 0 || ''}
													/>
													<label className="ps-3" htmlFor={`checkbox${xo?._id}`}>{`XO Number: ${xo.xoNumber}`}</label>
												</div>
												<div className="d-flex ms-4">
													<Form.Check
														type="checkbox"
														id={`checkbox${xo?._id}_all`}
														onChange={() => handleCheckboxChange(xo._id, 2)}
														className="mb-2"
														checked={xo.checked > 1 || ''}
													/>
													<label className="ps-3" htmlFor={`checkbox${xo?._id}_all`}>{`All Items`}</label>
												</div>
											</div>
											<div className="ms-4 mb-2">
												{xo.checked === 2 &&
													(xo.isLoading ? (
														<>loading</>
													) : xo.items ? (
														<>
															<div className="table-responsive">
																<table className="table table-bordered bg-light">
																	<thead>
																		<tr>
																			<th className="bg-light" scope="col">
																				Product Name
																			</th>
																			<th className="bg-light" scope="col">
																				Description
																			</th>
																		</tr>
																	</thead>
																	<tbody>
																		{/* Show only the first 5 items initially */}
																		{xo.items && xo.items.length > 0 ? (
																			xo.items.slice(0, xo.showAll ? undefined : 5).map((item, index) => (
																				<tr className="bg-light" key={index}>
																					<th className="bg-light" scope="row">
																						{item.productName || '-'}
																					</th>
																					<td className="bg-light text-truncate">{item.description || '-'}</td>
																				</tr>
																			))
																		) : (
																			<tr>
																				<td colSpan="2" className="text-center">
																					No Items Data
																				</td>
																			</tr>
																		)}
																	</tbody>
																</table>
															</div>
															<div className="w-100 d-flex justify-content-end">
																{xo.items && xo.items.length > 5 && (
																	<button className="btn btn-link bg-light" onClick={() => setXOShowAll(xo._id)}>
																		{xo.showAll ? 'Show Less' : `Show All (5/${xo.items.length})`}
																	</button>
																)}
															</div>
														</>
													) : (
														<div className="">No Items Data</div>
													))}
											</div>
											<div className="ms-4">
												{xo.checked !== undefined && xo.checked !== 0 && (
													<DropZone
														caption={'Upload Delivery Request File'}
														callbackUploadFile={(file) => handleUploadFile(file, xo._id, 'fileDelivertReq')}
													/>
												)}

												<FileList
													file={xo?.fileDelivertReq}
													callbackRemoveFile={(index) => handleRemoveFile(index, xo._id, 'fileDelivertReq')}
												/>
											</div>
										</div>
									))}
								</div>
							))}
						</div>
					</div>
					<div className="d-inline d-lg-flex">
						<div className="col-8 col-lg-2">Expected Completion Date:</div>
						<div className="col-8 col-lg-2">
							<input
								type="date"
								className="form-control"
								name="expectCompletaionAt"
								value={deliveryRequest.expectCompletaionAt}
								onChange={handleChange}
							/>
						</div>
					</div>
					<div className="d-inline d-lg-flex">
						<label htmlFor="jobRequestDetail" className="col-8 col-lg-2">
							Job Request Details:
						</label>
						<div className="col-12 col-lg-10">
							<AutoResizingTextarea
								id="jobRequestDetail"
								value={deliveryRequest.jobRequestDetail}
								onChange={handleChange}
							/>
						</div>
					</div>
					<div className="d-inline d-lg-flex">
						<div className="col-8 col-lg-2">
							Customer Name:<span className="text-danger"> *</span>
						</div>
						<div className="col-6">
							<input className="form-control" type="text" placeholder={project.customer?.name} disabled />
						</div>
					</div>
					<div className="d-inline d-lg-flex">
						<label htmlFor="site" className="col-8 col-lg-2">
							Site:
						</label>
						<div className="d-flex col-lg-10">
							{useOfficialAddress ? (
								<Select
									className="col-4"
									options={AddressOptions}
									getOptionLabel={(option) => option.label || 'default'}
									getOptionValue={(option) => option.location}
									onChange={(selected) => handleChange({ target: { id: 'address', value: selected.location } })}
								/>
							) : (
								<div className="col-4">
									<input
										className="form-control"
										type="text"
										id="site"
										value={deliveryRequest.site}
										onChange={handleChange}
									/>
								</div>
							)}

							<div className="form-check my-auto ms-3">
								<input
									className="form-check-input"
									type="checkbox"
									id="useOfficialAddress"
									value="1"
									checked={useOfficialAddress}
									onChange={() => handleUseOfficialAddress()}
								/>
								<label className="form-check-label user-select-none" htmlFor="useOfficialAddress">
									Use Official Address
								</label>
							</div>
						</div>
					</div>
					<div className="d-inline d-lg-flex">
						<label htmlFor="address" className="col-8 col-lg-2">
							Address:<span className="text-danger"> *</span>
						</label>
						<div className="col-12 col-lg-10">
							<AutoResizingTextarea id="address" value={deliveryRequest.address} onChange={handleChange} />
						</div>
					</div>
					<div className="d-inline d-lg-flex">
						<label htmlFor="contactPerson" className="col-8 col-lg-2">
							Contact Person:<span className="text-danger"> *</span>
						</label>
						<div className="col-12 col-lg-10">
							<AutoResizingTextarea id="contactPerson" value={deliveryRequest.contactPerson} onChange={handleChange} />
						</div>
					</div>
					<div className="d-inline d-lg-flex">
						<div className="col-8 col-lg-2">Presale:</div>
						<div className="col-8 col-lg-4">
							<Select
								name="presale"
								options={presales}
								components={{ Option: CustomOption }}
								value={deliveryRequest.presale}
								onChange={(selectedOption) =>
									handleChange({
										target: { name: 'presale', value: selectedOption }
									})
								}
								getOptionLabel={(option) => option.displayName}
								getOptionValue={(option) => option._id}
								isLoading={isLoadingUser}
							/>
						</div>
					</div>

					<div className="d-inline d-lg-flex">
						<div className="col-8 col-lg-2">Email to:</div>
						<div className="col-8 col-lg-4">
							<Select
								name="designated"
								options={deleveryOptions}
								components={{ Option: CustomOption }}
								value={deliveryRequest.designated}
								onChange={(selectedOption) =>
									handleChange({
										target: { name: 'designated', value: selectedOption }
									})
								}
								getOptionLabel={(option) => option.displayName}
								getOptionValue={(option) => option._id}
							/>
						</div>
					</div>
					<div className="d-inline d-lg-flex">
						<div className="col-8 col-lg-2">CC to:</div>
						<div className="col-8 col-lg-4">
							<Select
								name="ccto"
								options={deleveryOptions}
								components={{ Option: CustomOption }}
								value={deliveryRequest.ccto}
								onChange={(selectedOption) =>
									handleChange({
										target: { name: 'ccto', value: selectedOption }
									})
								}
								getOptionLabel={(option) => option.displayName}
								getOptionValue={(option) => option._id}
							/>
						</div>
					</div>
					<div className="d-inline d-lg-flex">
						<label htmlFor="remark" className="col-8 col-lg-2">
							Remark:
						</label>
						<div className="col-12 col-lg-10">
							<AutoResizingTextarea id="remark" value={deliveryRequest.remark} onChange={handleChange} />
						</div>
					</div>
				</Container>
			</Modal.Body>
			<Modal.Footer className="bg-light">
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>
				<Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
					{isLoading ? (
						<>
							<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
							{' Loading...'}
						</>
					) : (
						'Request'
					)}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default DeliveryRequestModal;
