import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ProtectedComponent from '../../../ProtectedComponent';
import CustomToolbar from '../CustomToolbar';
import { useFontSize } from '../../../../contexts/FontSizeProvider';
import BadgeXOStatus from '../../../BadgeStatus/XOStatus';
import { ROLES } from '../../../../constants/users';
import ContentRenderer from '../../../ContentRenderer';

export default function XODataGrid({
	isLoading,
	rows,
	total,
	onClicked = () => {},
	pagination,
	onPaginationChange,
	filterModel,
	onFilterModelChange
}) {
	const { fontSize, setFontSize } = useFontSize();

	const handleFontSizeChange = (newSize) => {
		setFontSize(newSize);
	};

	const columns = [
		{
			field: 'stockReady',
			headerName: 'Stock Ready?',
			width: 110,
			type: 'singleSelect',
			valueOptions: [
				{ value: 3, label: 'Issue', color: 'blue' },
				{ value: 2, label: 'In Stock', color: 'green' },
				{ value: 1, label: 'Partial', color: 'orange' },
				{ value: 0, label: 'Waiting', color: 'gray' }
			],
			renderCell: (params) => (
				<div className="h-100 d-flex align-items-center justify-content-center">
					<BadgeXOStatus status={params.value} />
				</div>
			)
		},
		{
			field: 'xoNumber',
			headerName: 'XO Number',
			width: 150,
			type: 'string',
			renderCell: (params) => (
				<ProtectedComponent
					requiredRoles={[ROLES.ADMIN, ROLES.DELIVERY_ADMIN]}
					fallback={
						<div
							className="underline-on-hover"
							style={{ fontSize: 'inherit' }}
							onClick={() => onClicked(params.row._id, 'view')}>
							{params.value}
						</div>
					}>
					<div
						className="underline-on-hover"
						style={{ fontSize: 'inherit' }}
						onClick={() => onClicked(params.row._id, 'update')}>
						{params.value}
					</div>
				</ProtectedComponent>
			)
		},
		{
			field: 'vendor',
			headerName: 'Vendor',
			width: 120,
			type: 'string',
			renderCell: (params) => <ContentRenderer className="text-truncate" value={params.value} />
		},
		{
			field: 'filePO.remark',
			headerName: 'Confirmed Order Number',
			width: 180,
			type: 'string',
			renderCell: (params) => <ContentRenderer className="text-truncate" value={params.row.filePO?.remark || ''} />
		},
		{
			field: 'shipmentStatus.saleOrderNumber',
			headerName: 'Sale Order ID',
			width: 120,
			type: 'actions',
			flex: 1,
			renderCell: (params) => (
				<ul className="w-100">
					{params.row.shipmentStatus?.saleOrderNumber?.map((number, index) => (
						<li key={index} className="mt-3 text-end border-bottom">
							{number || ' -'}
						</li>
					))}
				</ul>
			)
		},
		{
			field: 'shipmentStatus.webOrderNumber',
			headerName: 'Web Order ID',
			width: 120,
			type: 'actions',
			flex: 1,
			renderCell: (params) => (
				<ul className="w-100">
					{params.row.shipmentStatus?.webOrderNumber?.map((number, index) => (
						<li key={index} className="mt-3 text-end border-bottom">
							{number || ' -'}
						</li>
					))}
				</ul>
			)
		},
		{
			field: 'shipmentStatus.subscriptionNumber',
			headerName: 'Subscription ID',
			width: 120,
			type: 'actions',
			flex: 1,
			renderCell: (params) => (
				<ul className="w-100">
					{params.row.shipmentStatus?.subscriptionNumber?.map((number, index) => (
						<li key={index} className="mt-3 text-end border-bottom">
							{number || ' -'}
						</li>
					))}
				</ul>
			)
		},
		{
			field: 'createdBy',
			headerName: 'Sale Owner',
			width: 110,
			type: 'strings'
		},
		{
			field: 'createdAt',
			headerName: 'Created at',
			width: 150,
			type: 'date',
			valueFormatter: (value) => {
				const date = new Date(value);
				return date.toLocaleString('en-GB', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				});
			}
		},
		{
			field: 'updatedBy',
			headerName: 'Updated by',
			width: 110,
			type: 'strings'
		},
		{
			field: 'updatedAt',
			headerName: 'Updated at',
			width: 150,
			type: 'date',
			valueFormatter: (value) => {
				const date = new Date(value);
				return date.toLocaleString('en-GB', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				});
			}
		},
		{
			field: 'Action',
			headerName: 'Action',
			width: 150,
			type: 'actions',
			renderCell: (params) => (
				<div className="d-flex">
					<ProtectedComponent
						requiredRoles={[ROLES.ADMIN, ROLES.DELIVERY_ADMIN]}
						fallback={
							<IconButton onClick={() => onClicked(params.row._id, 'view')} color="secondary">
								<SearchIcon />
							</IconButton>
						}>
						<IconButton onClick={() => onClicked(params.row._id, 'update')} color="primary">
							<EditIcon />
						</IconButton>
					</ProtectedComponent>
				</div>
			)
		}
	];

	return (
		<div className="w-100">
			<DataGrid
				rows={rows}
				columns={columns}
				getRowId={(row) => row._id}
				components={{ Toolbar: GridToolbar }}
				pageSize={pagination.limit}
				pageSizeOptions={[10, 25, 100]}
				initialState={{
					pagination: {
						paginationModel: { pageSize: pagination.limit, page: pagination.page - 1 }
					},
					columns: {
						columnVisibilityModel: {
							createdAt: false,
							createdBy: false,
							updatedBy: false
						}
					}
				}}
				slots={{ toolbar: () => <CustomToolbar onFontSizeChange={handleFontSizeChange} /> }}
				autoHeight
				filterModel={filterModel}
				onPaginationModelChange={onPaginationChange}
				onFilterModelChange={onFilterModelChange}
				rowCount={total}
				filterMode="server"
				paginationMode="server"
				loading={isLoading}
				getRowHeight={() => 'auto'}
				sx={{
					'& .MuiDataGrid-root': {
						fontSize: fontSize
					},
					'& .MuiDataGrid-columnHeaders': {
						fontSize: fontSize - 2
					},
					'& .MuiDataGrid-cell': {
						fontSize: fontSize,
						minHeight: '52px',
						display: 'flex',
						alignItems: 'center'
					},
					'& .MuiDataGrid-cell[data-field="shipmentStatus.saleOrderNumber"], & .MuiDataGrid-cell[data-field="shipmentStatus.webOrderNumber"], & .MuiDataGrid-cell[data-field="shipmentStatus.subscriptionNumber"]':
						{
							alignItems: 'flex-start',
							justifyContent: 'flex-start'
						}
				}}
			/>
		</div>
	);
}
