import React, { useState, useEffect } from 'react';
import DeliveryRequestController from '../../controllers/DeliveryRequests';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumb';
import DeliveryRequestDataGrid from '../../components/Common/Table/DataGrid/DeliveryRequestTable';
import UpdateDeliveryRequest from '../../components/Common/Modal/DeliveryRequestModal/UpdateDeliveryRequest';
import BackButton from '../../components/Common/Button/BackButton';
import SearchBar from '../../components/Common/SearchBar';

export default function DeliveryRequestList() {
	const [isLoading, setIsLoading] = useState(true);
	const [deliveryRequests, setDeliveryRequests] = useState([]);
	const [total, setTotal] = useState(0);
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

		DeliveryRequestController.list({
			fields: {
				...pagination,
				filter: filterModel.items || [],
				...(query ? { query } : {})
			},
			options: { cancelToken: cancelTokenSource.token }
		})
			.then((data) => {
				console.log('DeliveryRequestController.list()', data);
				if (!Array.isArray(data.requests)) {
					throw new Error('unexpected value');
				}
				setDeliveryRequests(data.requests);
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
							['Delivery Requests', `/delivery-requests`]
						]}
					/>
				</div>
			</div>
			<div className="d-flex gap-2">
				<BackButton classNames="me-3" sizePx={30} />

				<div className="col">
					<h1>Delivery Requests</h1>
				</div>

				<SearchBar onSearch={searchHandle} />
			</div>
			<hr />
			<DeliveryRequestDataGrid
				isLoading={isLoading}
				rows={deliveryRequests}
				total={total}
				pagination={pagination}
				onPaginationChange={handlePaginationChange}
				filterModel={filterModel}
				onFilterModelChange={handleFilterModelChange}
			/>
		</>
	);
}
