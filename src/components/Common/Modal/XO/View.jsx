import { useEffect, useState } from 'react';
import { Modal, Button, Container } from 'react-bootstrap';
import XOController from '../../../../controllers/XO';
import SpinLoading from '../../../SpinLoading';
import axios from 'axios';
import AutoResizingTextarea from '../../../AutoResizingTextarea/AutoResizingTextarea';
import BadgeXOStatus from '../../../BadgeStatus/XOStatus';
import ContentRenderer from '../../../ContentRenderer';

const ViewXO = ({ show, handleClose, selectedXO }) => {
	const [xo, setXO] = useState();
	const [isLoading, setLoading] = useState(true);

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
					setLoading(false);
				})
				.catch((err) => {
					console.error(`XOController.getById() id=${selectedXO._id}`, err);
				});
			return () => cancelTokenSource.cancel('Operation canceled by the user.');
		}
	}, [selectedXO]);

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
											href={`/api/files/shipment/${file.reference || file._id}/${
												file.description || file.originalName
											}`}
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
									<div className="col-4">
										<BadgeXOStatus status={xo.stockReady} />
									</div>

									{xo.stockReady === 3 && (
										<div className="text-danger text-warp">*** plese contact for more infomation ***</div>
									)}
								</div>
							</div>
							{xo.remark && (
								<div className="d-inline d-lg-flex">
									<div className="col-8 col-lg-2">Remark :</div>
									<div className="col-6">
										<ContentRenderer className="form-control bg-light text-muted" value={xo?.remark || ''} />
									</div>
								</div>
							)}

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
			</Modal.Footer>
		</Modal>
	);
};

export default ViewXO;
