import React, { useState, useEffect } from 'react';
import CustomerController from '../../controllers/Customers';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumb';
import SpinLoading from '../../components/SpinLoading';
import UpdateCustomer from '../../components/Common/Modal/Customer/UpdateCustomer';
import ViewCustomer from '../../components/Common/Modal/Customer/ViewCustomer';
import CustomerDataGrid from '../../components/Common/Table/DataGrid/CustomerTable';
import BackButton from '../../components/Common/Button/BackButton';
import SearchBar from '../../components/Common/SearchBar';

export default function CustomerList() {
	const [isLoading, setIsLoading] = useState(true);
	const [customers, setCustomers] = useState([]);
	const [total, setTotal] = useState(0);
	const [selectedCustomer, setSelectedCustomer] = useState();
	const [updateModalShow, setUpdateModalShow] = useState(false);
	const [viewModalShow, setViewModalShow] = useState(false);
	const [pagination, setPagination] = useState({ page: 1, limit: 10 });
	const [filterModel, setFilterModel] = useState({ items: [] });

	useEffect(() => {
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

		CustomerController.list({
			fields: {
				...pagination,
				filter: filterModel.items || [],
				...(query ? { query } : {})
			},
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((data) => {
				console.log('CustomerController.list()', data);
				if (!Array.isArray(data.customers)) {
					throw new Error('unexpected value');
				}
				setCustomers(data.customers);
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
		const customer = customers.find((customer) => customer._id === id);
		setSelectedCustomer(customer);
		if (action === 'update') setUpdateModalShow(true);
		else if (action === 'view') setViewModalShow(true);
	};

	const handleClose = () => {
		fetch();
		setUpdateModalShow(false);
		setViewModalShow(false);
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
							['Customers', `/customers`]
						]}
					/>
				</div>
			</div>
			<div className="d-flex gap-2">
				<BackButton classNames="me-3" sizePx={30} />

				<div className="col">
					<h1>Customers</h1>
				</div>

				<SearchBar onSearch={searchHandle} />
			</div>
			<hr />
			<CustomerDataGrid
				isLoading={isLoading}
				rows={customers}
				total={total}
				onClicked={handleClicked}
				pagination={pagination}
				onPaginationChange={handlePaginationChange}
				filterModel={filterModel}
				onFilterModelChange={handleFilterModelChange}
			/>
			<UpdateCustomer show={updateModalShow} onClose={handleClose} customerData={selectedCustomer} />
			<ViewCustomer show={viewModalShow} onClose={handleClose} customerData={selectedCustomer} />
		</>
	);
}
