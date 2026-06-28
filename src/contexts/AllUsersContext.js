import React from 'react';

const AllUsersContext = React.createContext({
	isLoadingUser: true,
	getUserFilter: () => {}
});

export default AllUsersContext;
