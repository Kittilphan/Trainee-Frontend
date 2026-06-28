import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';
import CustomToolbar from '../CustomToolbar';
import { useFontSize } from '../../../../contexts/FontSizeProvider';
import BadgeDeliveryStatus from '../../../BadgeStatus/DeliveryStatus';
import renderContent from '../../../../utils/renderContent';

export default function DeliveryRequestDataGrid({
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
			field: 'status',
			headerName: 'Status',
			width: 110,
			type: 'singleSelect',
			valueOptions: [
				{ value: 0, label: 'New', color: 'gray' },
				{ value: 3, label: 'Issue', color: 'blue' },
				{ value: 1, label: 'Done', color: 'green' },
				{ value: 2, label: 'Cancel', color: 'red' }
			],
			renderCell: (params) => (
				<div className="h-100 d-flex align-items-center justify-content-center">
					<BadgeDeliveryStatus status={params.value} />
				</div>
			)
		},
		{
			field: 'deliveryAt',
			headerName: 'Delivery At',
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
			field: 'customer',
			headerName: 'Customer',
			width: 200,
			type: 'string',
			valueGetter: (value) => value?.alias || value?.name,
			renderCell: (params) => <div className="text-truncate" dangerouslySetInnerHTML={renderContent(params.value)} />
		},
		{
			field: 'project',
			headerName: 'Project',
			width: 400,
			flex: 1,
			type: 'string',
			valueGetter: (value) => value?.projectName,
			renderCell: (params) => <div className="text-truncate" dangerouslySetInnerHTML={renderContent(params.value)} />
		},
		{
			field: 'xoNumbers',
			headerName: 'XO Number',
			width: 150,
			type: 'actions',
			renderCell: (params) => (
				<ul className="w-100">
					{params.row.xoNumbers?.map((xoNumber, index) => (
						<li key={index} className="text-start mt-3 border-bottom">
							<span className="small-dot bg-secondary me-2 mb-1"></span>
							{xoNumber || ' -'}
						</li>
					))}
				</ul>
			)
		},
		{ field: 'wipNumber', headerName: 'WIP Number', width: 150, type: 'string' },

		{
			field: 'saleOwner',
			headerName: 'Sale Owner',
			width: 110,
			type: 'strings'
		},
		{
			field: 'createdBy',
			headerName: 'Created by',
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
			width: 120,
			type: 'date',
			valueFormatter: (value) => new Date(value).toLocaleDateString('en-GB')
		},

		{
			field: 'Action',
			headerName: 'Action',
			width: 150,
			type: 'actions',
			renderCell: (params) => (
				<Link to={`/delivery-requests/${params.row._id}`}>
					<IconButton color="secondary">
						<SearchIcon />
					</IconButton>
				</Link>
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
							updatedBy: false,
							wipId: false,
							updatedAt: false
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
					}
				}}
			/>
		</div>
	);
}
