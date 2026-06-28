import React from 'react';
import XOController from '../../controllers/XO';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumb';
import XODataGrid from '../../components/Common/Table/DataGrid/XOTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import BackButton from '../../components/Common/Button/BackButton';
import ProtectedComponent from '../../components/ProtectedComponent';
import AssignSaleOwner from '../../components/Common/Modal/ShipmentStatus/AssignSaleOwner';
import UpdateXOModal from '../../components/Common/Modal/XO/Update';
import ViewXOModal from '../../components/Common/Modal/XO/View';
import SearchBar from '../../components/Common/SearchBar';

export default function XOList() {
	const [isLoading, setIsLoading] = React.useState(true);
	const [xos, setXOs] = React.useState([]);
	const [total, setTotal] = React.useState(0);
	const [addShipmentModalShow, setAddShipmentModalShow] = React.useState(false);
	const [selectedXO, setSelectedXO] = React.useState();
	const [updateModalShow, setUpdateModalShow] = React.useState(false);
	const [viewModalShow, setViewModalShow] = React.useState(false);
	const [pagination, setPagination] = React.useState({ page: 1, limit: 10 });
	const [filterModel, setFilterModel] = React.useState({ items: [] });

	React.useEffect(() => {
		setIsLoading(true);
		const debounceFetch = setTimeout(() => {
			if (pagination && filterModel) {
				fetch();
			}
		}, 1500);

		return () => {
			clearTimeout(debounceFetch);
		};
	}, [pagination, filterModel]);

	const fetch = (query) => {
		setIsLoading(true);
		let cancelTokenSource = axios.CancelToken.source();

		XOController.list({
			fields: {
				...pagination,
				filter: filterModel.items || [],
				...(query ? { query } : {})
			},
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((data) => {
				console.log('XOController.list()', data);
				if (!Array.isArray(data.xos)) {
					throw new Error('unexpected value');
				}
				setXOs(data.xos);
				setTotal(data.total);
			})
			.catch((err) => {
				console.error(`ERROR`, err);
			})
			.finally(() => {
				setIsLoading(false);
				cancelTokenSource.cancel('cancel due to unmounted');
			});
	};

	const searchHandle = (query) => {
		fetch(query);
	};

	const handleClicked = (id, action) => {
		const xo = xos.find((xo) => xo._id === id);
		setSelectedXO(xo);
		if (action === 'update') setUpdateModalShow(true);
		else if (action === 'view') setViewModalShow(true);
	};

	const handleClose = () => {
		setAddShipmentModalShow(false);
		setUpdateModalShow(false);
		setViewModalShow(false);
	};
	const handleUpdate = () => {
		fetch();
		setAddShipmentModalShow(false);
		setUpdateModalShow(false);
		setViewModalShow(false);
	};

	const handlePaginationChange = (model) => {
		let { page, pageSize } = model;
		page = page > 0 ? page + 1 : 1;
		if (page !== pagination.page || pageSize !== pagination.limit) {
			setPagination((prev) => ({ ...prev, page, limit: pageSize }));
		}
	};

	const handleFilterModelChange = (model) => {
		setFilterModel(model);
	};

	return (
		<>
			<div className="row my-2">
				<div className="col">
					<Breadcrumb
						items={[
							['home', `/`],
							['XOs', `/xo`]
						]}
					/>
				</div>
			</div>
			<div className="d-flex  gap-2">
				<BackButton classNames="me-3" sizePx={30} />
				<div className="col">
					<h1>XOs</h1>
				</div>
				<SearchBar onSearch={searchHandle} />
				<ProtectedComponent requiredRoles={['admin', 'delivery-admin']}>
					<div className="row">
						<div className="col">
							<div
								className="btn btn-outline-primary text-decoration-none"
								onClick={() => setAddShipmentModalShow(true)}>
								<FontAwesomeIcon icon={faUpload} fixedWidth className="me-2" />
								<span>Upload Shipment File</span>
							</div>
						</div>
					</div>
				</ProtectedComponent>
			</div>
			<hr />
			<XODataGrid
				isLoading={isLoading}
				rows={xos}
				total={total}
				onClicked={handleClicked}
				pagination={pagination}
				onPaginationChange={handlePaginationChange}
				filterModel={filterModel}
				onFilterModelChange={handleFilterModelChange}
			/>
			<AssignSaleOwner show={addShipmentModalShow} onClose={handleClose} />
			<UpdateXOModal show={updateModalShow} handleClose={handleClose} onUpdate={handleUpdate} selectedXO={selectedXO} />
			<ViewXOModal show={viewModalShow} handleClose={handleClose} selectedXO={selectedXO} />
		</>
	);
}
