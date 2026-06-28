import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Dropdown, Modal, Form, Button } from 'react-bootstrap';
import AutoResizingTextarea from '../../../AutoResizingTextarea/AutoResizingTextarea';
import DeliveryRequestController from '../../../../controllers/DeliveryRequests';
import SpinLoading from '../../../SpinLoading';
import { SwalDialog } from '../../../Swal';
import ProtectedComponent from '../../../ProtectedComponent';

const UpdateDeliveryRequest = ({ show, onClose = () => {}, onSubmit = () => {}, deliveryRequest }) => {
	const [deliReq, setDeliReq] = useState(null);
	const [initial, setInitial] = useState(null);
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		if (deliveryRequest?._id) {
			setLoading(true);
			let cancelTokenSource = axios.CancelToken.source();

			DeliveryRequestController.getById({
				id: deliveryRequest._id,
				options: { cancelToken: cancelTokenSource.token }
			})
				.then((request) => {
					if (!request) {
						const error = new Error(`Request #${deliveryRequest._id} not found`);
						error.httpCode = 404;
						throw error;
					}
					setDeliReq(request);
					setInitial(request);
					setLoading(false);
				})
				.catch((err) => {
					console.error(`DeliveryRequestController.getById() id=${deliveryRequest._id}`, err);
				});
			return () => cancelTokenSource.cancel('Operation canceled by the user.');
		}
	}, [deliveryRequest]);

	const handleChange = (e) => {
		const { id, name, value } = e.target;
		const label = id || name;
		setDeliReq((prev) => ({ ...prev, [label]: value }));
	};

	const handleSave = (e) => {
		e.preventDefault();
		if (!deliReq) return;
		if ((deliReq.status === 3 || deliReq.status === 2) && (deliReq.remark || '').trim() === '') {
			SwalDialog({
				icon: 'error',
				text: 'If Cancel or Issue, "Remark"  is required.'
			});
			return;
		}

		const payload = Object.keys(deliReq).reduce((acc, key) => {
			if (deliReq[key] !== initial[key]) {
				acc[key] = deliReq[key];
			}
			return acc;
		}, {});

		if (Object.keys(payload).length === 0 && payload.constructor === Object) {
			SwalDialog({
				icon: 'info',
				text: 'No change'
			});
			return;
		}

		let cancelTokenSource = axios.CancelToken.source();
		DeliveryRequestController.updateById({
			id: deliReq._id,
			payload: payload,
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((result) => {
				console.log('result: ', result);
				SwalDialog({
					icon: 'success',
					text: `Delivery Request\n<div class="text-truncate">Project: ${deliReq.project?.projectName}\nCustomer: ${deliReq.customer?.name}</div>\n<h5>#${deliReq._id}</h5> updated`,
					options: {}
				}).then(() => {
					onSubmit();
				});
			})
			.catch((err) => {
				console.log('ERROR DeliveryRequestController.updateById()', err);
				SwalDialog({
					icon: 'error',
					text: err.message || 'An error occurred',
					options: {}
				});
			});
	};

	if (!deliReq) return null;

	return (
		<Modal show={show} onHide={onClose} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Update Delivery Status</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{isLoading ? (
					<SpinLoading />
				) : (
					<Form onSubmit={handleSave} className="row gap-3 ">
						<div className="d-md-flex ">
							<div className="me-2 col-lg-2">Project Name:</div>
							<div>{deliReq.project?.projectName}</div>
						</div>
						<div className="d-md-flex">
							<div className="me-2 col-lg-2">Customer Name:</div>
							<div>{deliReq.customer?.name}</div>
						</div>
						<div className="d-md-flex">
							<div className="me-2 col-lg-2">Created by:</div>
							<div>{deliReq.createdBy}</div>
						</div>

						<Form.Group className="d-md-flex">
							<Form.Label className="me-2 col-lg-2">Status</Form.Label>
							<Dropdown>
								<Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
									{deliReq.status === 3
										? 'Issue'
										: deliReq.status === 2
										? 'Cancel'
										: deliReq.status === 1
										? 'Done'
										: 'New'}
								</Dropdown.Toggle>

								<Dropdown.Menu>
									<ProtectedComponent requiredRoles={['admin', 'delivery-admin']}>
										<Dropdown.Item onClick={() => handleChange({ target: { name: 'status', value: 3 } })}>
											<span className="dot bg-blue"></span>Issue
										</Dropdown.Item>
										<Dropdown.Item onClick={() => handleChange({ target: { name: 'status', value: 1 } })}>
											<span className="dot bg-green"></span>Done
										</Dropdown.Item>
									</ProtectedComponent>
									<Dropdown.Item onClick={() => handleChange({ target: { name: 'status', value: 2 } })}>
										<span className="dot bg-red"></span>Cancel
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</Form.Group>

						<Form.Group className="d-md-flex">
							<Form.Label htmlFor="remark" className="me-2 col-lg-2">
								Remark
								<span className={`text-danger ${deliReq.status === 3 || deliReq.status === 2 ? 'd-inline' : 'd-none'}`}>
									{' '}
									*
								</span>
							</Form.Label>
							<AutoResizingTextarea id="remark" value={deliReq.remark || ''} onChange={handleChange} />
						</Form.Group>

						<Form.Group className="mt-3 gap-3 d-flex justify-content-end">
							<hr />

							<Button variant="secondary" onClick={onClose}>
								Close
							</Button>
							<Button variant="primary" type="submit">
								Save
							</Button>
						</Form.Group>
					</Form>
				)}
			</Modal.Body>
		</Modal>
	);
};

export default UpdateDeliveryRequest;
