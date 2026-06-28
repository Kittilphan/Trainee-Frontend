import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CustomToolbar from '../CustomToolbar';
import { useFontSize } from '../../../../contexts/FontSizeProvider';
import renderContent from '../../../../utils/renderContent';

export default function CustomerDataGrid({
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

	const formatAccNumber = (value) => {
		return value ? value : '- - - - - - - -';
	};

	const columns = [
		{
			field: 'accNumber',
			headerName: 'Account Number',
			width: 100,
			type: 'string',
			valueFormatter: (value) => formatAccNumber(value)
		},
		{ field: 'isTemp', headerName: 'Is Temp?', width: 80, type: 'boolean' },
		{
			field: 'alias',
			headerName: 'Alias',
			width: 180,
			type: 'string',
			renderCell: (params) => <span dangerouslySetInnerHTML={renderContent(params.value)} />
		},
		{
			field: 'name',
			headerName: 'Name',
			minWidth: 200,
			flex: 1,
			type: 'string',
			renderCell: (params) => (
				<div className="underline-on-hover text-truncate" onClick={() => onClicked(params.row._id, 'update')}>
					<span dangerouslySetInnerHTML={renderContent(params.value)} />
					{params.row.isTemp ? <span className="ms-2 badge text-bg-danger"> TEMP</span> : <></>}
				</div>
			)
		},
		{
			field: 'countProjects',
			headerName: 'Total Project(s)',
			width: 100,
			type: 'number',
			renderCell: (params) => (
				<div className={` text-end ${params.row.countProjects > 0 ? '' : 'text-mute opacity-25'} `}>
					{params.row.countProjects}
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
			width: 100,
			type: 'date',
			valueFormatter: (value) => new Date(value).toLocaleDateString('en-GB')
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
			width: 100,
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
					<IconButton onClick={() => onClicked(params.row._id, 'update')} color="primary">
						<EditIcon />
					</IconButton>
					<IconButton onClick={() => onClicked(params.row._id, 'view')} color="secondary">
						<SearchIcon />
					</IconButton>
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
