import React from 'react';
import VendorController from '../../controllers/Vendors';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumb';
import SpinLoading from '../../components/SpinLoading';
import CreateVendor from '../../components/Common/Modal/Vendor/Create';
import UpdateVendor from '../../components/Common/Modal/Vendor/Update';
import ViewVendor from '../../components/Common/Modal/Vendor/View';
import VendorDataGrid from '../../components/Common/Table/DataGrid/VendorTable';
import BackButton from '../../components/Common/Button/BackButton';
import SearchBar from '../../components/Common/SearchBar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

export default function VendorList() {
	const [isLoading, setIsLoading] = React.useState(true);
	const [vendors, setVendors] = React.useState([]);
	const [total, setTotal] = React.useState(0);
	const [createModalShow, setCreateModalShow] = React.useState(false);
	const [selectedVendor, setSelectedVendor] = React.useState();
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

	function fetch(query) {
		setIsLoading(true);
		let cancelTokenSource = axios.CancelToken.source();

		VendorController.list({
			fields: {
				...pagination,
				filter: filterModel.items || [],
				...(query ? { query } : {})
			},
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((data) => {
				console.log('VendorController.list()', data);
				if (!Array.isArray(data.vendors)) {
					throw new Error('unexpected value');
				}
				setVendors(data.vendors);
				setTotal(data.total);
			})
			.catch((err) => {
				console.error(`ERROR`, err);
			})
			.finally(() => {
				setIsLoading(false);
				cancelTokenSource.cancel('cancel due to unmounted');
			});
	}

	const searchHandle = (query) => {
		fetch(query);
	};

	const handleClicked = (id, action) => {
		const vendor = vendors.find((vendor) => vendor._id === id);
		setSelectedVendor(vendor);
		if (action === 'update') setUpdateModalShow(true);
		else if (action === 'view') setViewModalShow(true);
	};

	const handleClose = () => {
		fetch();
		setUpdateModalShow(false);
		setViewModalShow(false);
		setCreateModalShow(false);
	};

	const handlePaginationChange = (model) => {
		let { page, pageSize } = model;
		page = page > 0 ? page + 1 : 1;
		//prevent start with fetch 2 time
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
							['Vendors', `/vendors`]
						]}
					/>
				</div>
			</div>
			<div className="d-flex gap-2">
				<BackButton classNames="me-3" sizePx={30} />
				<div className="col">
					<h1>Vendors</h1>
				</div>
				<SearchBar onSearch={searchHandle} />
				<div className="row">
					<div className="col">
						<div className="btn btn-outline-primary text-decoration-none" onClick={() => setCreateModalShow(true)}>
							<FontAwesomeIcon icon={faPlusCircle} fixedWidth className="me-1" />
							<span>Create New Vendor</span>
						</div>
					</div>
				</div>
			</div>
			<hr />
			<VendorDataGrid
				isLoading={isLoading}
				rows={vendors}
				total={total}
				onClicked={handleClicked}
				pagination={pagination}
				onPaginationChange={handlePaginationChange}
				filterModel={filterModel}
				onFilterModelChange={handleFilterModelChange}
			/>
			<CreateVendor show={createModalShow} onClose={handleClose} />
			<UpdateVendor show={updateModalShow} onClose={handleClose} vendorData={selectedVendor} />
			<ViewVendor show={viewModalShow} onClose={handleClose} vendorData={selectedVendor} />
		</>
	);
}
