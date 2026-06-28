import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import Breadcrumb from '../../components/Breadcrumb';
import DeliveryRequestController from '../../controllers/DeliveryRequests';
import XOController from '../../controllers/XO';

import SpinLoading from '../../components/SpinLoading';
import BackButton from '../../components/Common/Button/BackButton';
import AutoResizingTextarea from '../../components/AutoResizingTextarea/AutoResizingTextarea';

import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import ProtectedComponent from '../../components/ProtectedComponent';
import UpdateDeliveryRequest from '../../components/Common/Modal/DeliveryRequestModal/UpdateDeliveryRequest';
import BadgeDeliveryStatus from '../../components/BadgeStatus/DeliveryStatus';
import ContentRenderer from '../../components/ContentRenderer';

function RequestView() {
	const { deliveryRequestId } = useParams();
	const [updateModalShow, setUpdateModalShow] = useState(false);
	const [request, setRequest] = useState(null);
	const [isLoading, setLoading] = useState(true);
	const [xoItems, setXOItems] = useState({});
	const [xoShowAll, setXOShowAll] = useState({});
	const [error, setError] = useState(null);

	const printSectionRef = useRef(null);

	useEffect(() => {
		setLoading(true);
		let cancelTokenSource = axios.CancelToken.source();
		fetch(cancelTokenSource);

		return () => {
			cancelTokenSource.cancel('cancel due to unmounted');
		};
	}, [deliveryRequestId]);

	function fetch(cancelTokenSource) {
		DeliveryRequestController.getById({
			id: deliveryRequestId,
			options: { cancelToken: cancelTokenSource?.token }
		})
			.then(async (request) => {
				if (!request) {
					const error = new Error(`Request #${deliveryRequestId} not found`);
					error.httpCode = 404;
					throw error;
				}
				console.log(`DeliveryRequestController.getById() id=${deliveryRequestId}`, request);
				setRequest(request);
				setLoading(false);

				// Fetch items for each xo number if applicable
				console.log('all::', request.allItemXo);

				await Promise.all(
					request.xoNumbers.map((xo, index) => {
						console.log(request.allItemXo[index], xo);
						if (request.allItemXo[index] === 'true') {
							return FetchItems(xo);
						}
						return Promise.resolve(); // Skip fetching if not applicable
					})
				);
			})
			.catch((err) => {
				console.error(`useEffect() DeliveryRequestController.getById() id=${deliveryRequestId}`, err);
				setError(err);
			});
	}

	const FetchItems = async (xoId) => {
		try {
			const items = await XOController.getItemById({ id: xoId });
			setXOItems((prev) => ({
				...prev,
				[xoId]: items // Store items fetched for this xoId
			}));
		} catch (err) {
			console.error('Error Fetching Items :', err);
			throw new Error(err.response?.data?.message || err.response?.data?.error || 'Error Fetching items');
		}
	};
	const handleShowAllToggle = (xoId) => {
		setXOShowAll((prev) => ({
			...prev,
			[xoId]: !prev[xoId]
		}));
	};

	const handleClose = () => {
		fetch();
		setUpdateModalShow(false);
	};

	const dateFormat = (value) => {
		if (!value) return 'N/A';
		const date = new Date(value);
		return date.toLocaleString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// Function to handle printing the section
	const handlePrint = () => {
		console.log('print');
		window.print();
	};

	if (isLoading) return <SpinLoading />;

	return (
		<div>
			<Breadcrumb
				items={[
					['home', `/`],
					['Delivery Requests', `/delivery-requests`],
					[`Delivery Request Detail`, `/delivery-requests/${request?._id}`]
				]}
			/>
			<div className="d-flex justify-content-between align-items-center">
				<div>
					<BackButton />
				</div>
				<h1 className="text-truncate">Delivery Request Detail</h1>
				{/* Button to trigger print */}
				<div>
					<IconButton onClick={handlePrint} color="primary">
						<PrintIcon />
					</IconButton>
				</div>
			</div>

			<section className="position-relative rounded-4 border d-grid gap-3 shadow p-5 my-4" ref={printSectionRef}>
				<div className="d-flex align-items-center">
					<div className="me-2 col-md-2">Delivery Status:</div>
					<div className="col-2">
						<BadgeDeliveryStatus status={request.status} />
					</div>
					<ProtectedComponent requiredRoles={['sale', 'admin', 'delivery-admin']}>
						<IconButton onClick={() => setUpdateModalShow(true)} color="primary">
							<EditIcon />
						</IconButton>
					</ProtectedComponent>
				</div>
				<div className=" d-md-flex">
					<div className="me-2  col-md-2">Delivery Date:</div>
					<div className="">{dateFormat(request.deliveryAt)}</div>
				</div>
				<div className=" d-md-flex">
					<div className="me-2 col-md-2">Expected Completion Date:</div>
					<div className="">{dateFormat(request.expectCompletaionAt)}</div>
				</div>
				<div className=" d-md-flex">
					<div className="me-2  col-md-2">Implementation:</div>
					<div className="">{request.implementation === 1 ? 'Yes' : 'No'}</div>
				</div>
				<div className=" d-md-flex">
					<div className="me-2  col-md-2">Project Name:</div>
					<ContentRenderer value={request.project?.projectName} />
				</div>
				<div className=" d-md-flex">
					<div className="me-2  col-md-2">Customer Name:</div>
					<div className="">
						<ContentRenderer
							value={(request.customer?.alias ? `[${request.customer.alias}] ` : '') + request.customer?.name}
						/>
					</div>
				</div>
				<div className=" d-md-flex">
					<div className="me-2 col-md-2">Presale:</div>
					<div className="">{request.presale?.displayName || 'N/A'}</div>
				</div>
				<div className=" d-md-flex">
					<div className="me-2 col-md-2">Designated:</div>
					<div className="">{request.designated?.displayName || 'N/A'}</div>
				</div>
				<div className=" d-md-flex">
					<div className="me-2  col-md-2">Site:</div>
					<ContentRenderer value={request.site || 'N/A'} />
				</div>
				<div className=" d-lg-flex">
					<div className="col-8 col-md-2">Address:</div>
					<div className="col-12 col-lg-10">
						<ContentRenderer
							className="form-control bg-light text-muted"
							value={request.address}
							minRows={2}
							lineHeight={1.9}
						/>
					</div>
				</div>
				<div className=" d-lg-flex">
					<div className="col-8 col-md-2">Contact Person:</div>
					<div className="col-12 col-lg-10">
						<ContentRenderer
							className="form-control bg-light text-muted"
							value={request.contactPerson}
							minRows={2}
							lineHeight={1.9}
						/>
					</div>
				</div>

				<div className=" d-lg-flex">
					<div className="col-8 col-md-2">Job Request Details:</div>
					<div className="col-12 col-lg-10">
						<ContentRenderer
							className="form-control bg-light text-muted"
							value={request.jobRequestDetail}
							minRows={2}
							lineHeight={1.9}
						/>
					</div>
				</div>

				<div className="d-lg-flex">
					<div className="col-8 col-md-2">Remark:</div>
					<div className="col-12 col-lg-10">
						<ContentRenderer
							className="form-control bg-light text-muted"
							value={request.remark}
							minRows={2}
							lineHeight={1.9}
						/>
					</div>
				</div>
				<div>
					{request.xoNumbers?.map((xo, xoIndex) => (
						<div key={xoIndex} className="my-3">
							<div className="mb-2">XO Number: {xo}</div>
							<div className="mb-2">
								{request.allItemXo && request.allItemXo[xoIndex] === 'true' ? (
									// Show items if allItemXo [xoIndex] is true
									<>
										<div className="ms-lg-4 table-responsive">
											<table className="table table-bordered bg-light">
												<thead>
													<tr>
														<th scope="col">Product Name</th>
														<th scope="col">Description</th>
													</tr>
												</thead>
												<tbody>
													{/* Show only the first 5 items initially */}
													{xoItems[xo] && xoItems[xo].length > 0 ? (
														xoItems[xo].slice(0, xoShowAll[xo] ? undefined : 5).map((item, index) => (
															<tr key={index}>
																<th scope="row">{item.productName || '-'}</th>
																<td className="text-truncate">{item.description || '-'}</td>
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
											{xoItems[xo] && xoItems[xo].length > 5 && (
												<button className="btn btn-link" onClick={() => handleShowAllToggle(xo)}>
													{xoShowAll[xo] ? 'Show Less' : `Show All (5/${xoItems[xo].length})`}
												</button>
											)}
										</div>
									</>
								) : (
									'' // or some message indicating items are not available
								)}
							</div>

							{request.fileDelivertReq
								?.filter((file) => file.xo === xo)
								?.map((file, fileIndex) => (
									<div key={fileIndex} className="ms-4 my-3">
										<span className="mb-2 link-primary underline-on-hover">
											<a
												href={`/api/files/${file.attachmentType || file.type}/${file.reference || file._id}/${
													file.description || file.originalName
												}`}
												target="_blank">
												{file.description || file.originalName}
											</a>
										</span>
									</div>
								))}
						</div>
					))}
				</div>
			</section>

			{updateModalShow && (
				<UpdateDeliveryRequest
					show={updateModalShow}
					onClose={() => setUpdateModalShow(false)}
					onSubmit={handleClose}
					deliveryRequest={request}
				/>
			)}
		</div>
	);
}

export default RequestView;
