import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
// import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import BadgeCardStatus from '../../../BadgeStatus';
import { Link } from 'react-router-dom';
import CustomToolbar from '../CustomToolbar';
import { useFontSize } from '../../../../contexts/FontSizeProvider';
import renderContent from '../../../../utils/renderContent';

export default function ProjectDataGrid({
	isLoading,
	rows,
	total,
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
			field: 'state',
			headerName: 'State',
			width: 110,
			type: 'singleSelect',
			valueOptions: [
				{ value: 0, label: 'New' },
				{ value: 1, label: 'Proposing' },
				{ value: 2, label: 'Implementing' },
				{ value: 3, label: 'Done' },
				{ value: 4, label: 'Cancelled' }
			],
			renderCell: (params) => (
				<div className="h-100 d-flex align-items-center justify-content-center">
					<BadgeCardStatus status={params.value} />
				</div>
			)
		},
		{
			field: 'customer',
			headerName: 'Customer',
			width: 250,
			type: 'string',
			renderCell: (params) => (
				<div>
					<span dangerouslySetInnerHTML={renderContent(params.value?.alias || params.value?.name)} />
					{params.row.customerIsTemp ? <span className="ms-2 badge text-bg-danger"> TEMP</span> : <></>}
				</div>
			)
		},

		{
			field: 'projectName',
			headerName: 'Project Name',
			width: 250,
			// flex: 1,
			type: 'string',
			renderCell: (params) => (
				<Link className="underline-on-hover" style={{ fontSize: 'inherit' }} to={`/projects/${params.row._id}`}>
					<span dangerouslySetInnerHTML={renderContent(params.value)} />
				</Link>
			)
		},
		{
			field: 'description',
			headerName: 'Project Description',
			width: 300,
			flex: 1,
			type: 'string',
			renderCell: (params) => <span dangerouslySetInnerHTML={renderContent(params.value)} />
		},
		{
			field: 'countWIPs',
			headerName: 'WIP(s)',
			width: 120,
			type: 'number',
			renderCell: (params) => (
				<div className={` text-end ${params.row.countWIPs > 0 ? '' : 'text-mute opacity-25'} `}>
					{params.row.countWIPs}
				</div>
			)
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
			width: 110,
			type: 'date',
			valueFormatter: (value) => new Date(value).toLocaleDateString('en-GB')
		},
		{
			field: 'lastUpdatedBy',
			headerName: 'Updated by',
			width: 110,
			type: 'strings'
		},
		{
			field: 'lastUpdatedAt',
			headerName: 'Updated at',
			width: 110,
			type: 'date',
			valueFormatter: (value) => new Date(value).toLocaleDateString('en-GB')
		},
		{
			field: 'Action',
			headerName: 'Action',
			width: 100,
			type: 'actions',
			renderCell: (params) => (
				<div className="d-flex">
					{/* <Link to={`/projects/${params.row._id}/update-header`}>
						<IconButton color="primary">
							<EditIcon />
						</IconButton>
					</Link> */}
					<Link to={`/projects/${params.row._id}`}>
						<IconButton color="secondary">
							<SearchIcon />
						</IconButton>
					</Link>
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
				components={{ Toolbar: () => <CustomToolbar /> }}
				pageSize={pagination.limit}
				pageSizeOptions={[10, 25, 100]}
				initialState={{
					pagination: {
						paginationModel: { pageSize: pagination.limit, page: pagination.page - 1 }
					},
					columns: {
						columnVisibilityModel: {
							createdBy: false,
							lastUpdatedBy: false
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
				sx={{
					'& .MuiDataGrid-root': {
						fontSize: fontSize
					},
					'& .MuiDataGrid-columnHeaders': {
						fontSize: fontSize - 2
					},
					'& .MuiDataGrid-cell': {
						fontSize: fontSize
					}
				}}
			/>
		</div>
	);
}
