import { useState, useEffect } from 'react';
import { Modal, Button, Dropdown, Container, Form } from 'react-bootstrap';
import XOController from '../../../../controllers/XO';
import { SwalDialog } from '../../../Swal';
import axios from 'axios';
import AutoResizingTextarea from '../../../AutoResizingTextarea/AutoResizingTextarea';
import SpinLoading from '../../../SpinLoading';

const UpdateXO = ({ show, handleClose, selectedXO, onUpdate }) => {
	const [xo, setXO] = useState();
	const [initial, setInitial] = useState();
	const [isLoading, setLoading] = useState(true);

	const handleChange = (e) => {
		const { id, name, value } = e.target ? e.target : e;
		setXO((prev) => ({ ...prev, [id || name]: value }));
	};

	useEffect(() => {
		if (selectedXO?._id) {
			setLoading(true);
			let cancelTokenSource = axios.CancelToken.source();

			XOController.getById({
				id: selectedXO._id,
				options: { cancelToken: cancelTokenSource.token }
			})
				.then((request) => {
					if (!request) {
						const error = new Error(`XO Number ${selectedXO._id} not found`);
						error.httpCode = 404;
						throw error;
					}
					setXO(request);
					setInitial(request);
					setLoading(false);
				})
				.catch((err) => {
					console.error(`XOController.getById() id=${selectedXO._id}`, err);
				});
			return () => cancelTokenSource.cancel('Operation canceled by the user.');
		}
	}, [selectedXO]);

	const handleUpdate = () => {
		if (xo.stockReady === '3' && (xo.remark || '').trim() === '') {
			SwalDialog({
				icon: 'error',
				text: 'If Status is Issue, "Remark"  is required.'
			});
			return;
		}
		let cancelTokenSource = axios.CancelToken.source();

		const payload = Object.keys(xo).reduce((acc, key) => {
			if (xo[key] !== initial[key]) {
				acc[key] = xo[key];
			}
			return acc;
		}, {});

		const isEmpty = (obj) => Object.keys(obj).length === 0;
		if (isEmpty(payload)) {
			SwalDialog({
				icon: 'info',
				text: 'Payload is Empty.'
			});
			return;
		}

		XOController.updateById({
			id: xo._id,
			payload,
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((result) => {
				SwalDialog({
					icon: 'success',
					text: `XO Number: ${selectedXO.xoNumber} updated successfully!`
				}).then(() => {
					handleClose();
					onUpdate();
				});
			})
			.catch((err) => {
				SwalDialog({
					icon: 'error',
					text: `Error updating status: ${err}`
				});
			});
	};

	const dateFormat = (value) => {
		const date = new Date(value);
		return date.toLocaleString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	if (!selectedXO) return null;
	const file = xo?.fileShipment;

	return (
		<Modal show={show} onHide={handleClose} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>XO Details</Modal.Title>
			</Modal.Header>
			<Modal.Body className="bg-light">
				<Container className="row gap-3">
					<div className="d-inline d-lg-flex">
						<div className="col-8 col-lg-2">XO Number:</div>
						<div className="col-6">
							<input className="form-control" type="text" value={selectedXO?.xoNumber || ''} disabled />
						</div>
					</div>
					{isLoading ? (
						<SpinLoading />
					) : (
						<>
							<div className="d-inline d-lg-flex">
								<div className="col-8 col-lg-2">Vendor:</div>
								<div className="col-6">
									<input className="form-control" type="text" value={xo?.vendor || ''} disabled />
								</div>
							</div>

							<div className="d-inline d-lg-flex">
								<div className="col-8 col-lg-2">Shipment file :</div>
								<div className="col-6">
									{file.reference || file._id ? (
										<a
											className="mb-1 link-primary underline-on-hover"
											href={`/api/files/shipment/${file.reference || file._id}/${file.description || file.originalName}`}
											target="_blank">
											{file.description || file.originalName}
										</a>
									) : (
										'N/A'
									)}
								</div>
							</div>

							<div className="d-inline d-lg-flex">
								<div className="col-8 col-lg-2">Shipment:</div>
								<div className="col-6">
									<div className="row">
										<div className="col">
											<h6 className="text-muted text-nowrap">Sale Order NO.</h6>
											<ul>
												{xo.shipmentStatus?.saleOrderNumber?.map((number, index) => (
													<li key={index} className="border-bottom my-1">
														{number || ' -'}
													</li>
												))}
											</ul>
										</div>
										<div className="col">
											<h6 className="text-muted  text-nowrap">Web Order NO.</h6>
											<ul>
												{xo.shipmentStatus?.webOrderNumber?.map((number, index) => (
													<li key={index} className="border-bottom my-1">
														{number || ' -'}
													</li>
												))}
											</ul>
										</div>
										<div className="col">
											<h6 className="text-muted text-nowrap">Subscription ID</h6>
											<ul>
												{xo.shipmentStatus?.subscriptionNumber?.map((number, index) => (
													<li key={index} className="border-bottom my-1">
														{number || ' -'}
													</li>
												))}
											</ul>
										</div>
									</div>
								</div>
							</div>
							<div className="d-inline d-lg-flex">
								<div className="col-8 col-lg-2">Status:</div>
								<div className="col-6">
									<Dropdown>
										<Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
											{xo.stockReady === 3
												? 'Issue'
												: xo.stockReady === 2
												? 'In Stock'
												: xo.stockReady === 1
												? 'Partial'
												: 'Waiting'}
										</Dropdown.Toggle>

										<Dropdown.Menu>
											<Dropdown.Item onClick={() => handleChange({ name: 'stockReady', value: 3 })}>
												<span className="dot bg-blue"></span>Issue
											</Dropdown.Item>
											<Dropdown.Item onClick={() => handleChange({ name: 'stockReady', value: 2 })}>
												<span className="dot bg-green"></span>In Stock
											</Dropdown.Item>
											<Dropdown.Item onClick={() => handleChange({ name: 'stockReady', value: 1 })}>
												<span className="dot bg-orange"></span>Partial
											</Dropdown.Item>
											<Dropdown.Item onClick={() => handleChange({ name: 'stockReady', value: 0 })}>
												<span className="dot bg-graylight"></span>Waiting
											</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
								</div>
							</div>
							<Form.Group className="d-lg-flex">
								<Form.Label htmlFor="remark" className="col-lg-2">
									Remark
									<span className={`text-danger ${xo.stockReady === '3' ? 'd-inline' : 'd-none'}`}> *</span>
								</Form.Label>
								<AutoResizingTextarea id="remark" value={xo.remark || ''} onChange={handleChange} />
							</Form.Group>
							<div className="d-inline mt-3">
								<div className="d-flex gap-1 small text-muted fst-italic justify-content-end">
									<div>Last updated by</div>
									<div className="text-bluedark text-decoration-underline">{xo.updatedBy}</div>
									<div className="text-secondary">{dateFormat(xo.updatedAt)}</div>
								</div>
							</div>
						</>
					)}
				</Container>
			</Modal.Body>
			<Modal.Footer className="bg-light">
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>
				<Button variant="primary" onClick={handleUpdate}>
					Update Status
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default UpdateXO;
