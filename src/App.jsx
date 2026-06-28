import React from 'react';
import './App.css';

import AuthProvider from './contexts/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import AllUsersProvider from './contexts/AllUsersProvider';
import { FontSizeProvider } from './contexts/FontSizeProvider';

function App() {
	return (
		<AuthProvider>
			<FontSizeProvider>
				<ErrorBoundary>
					<AllUsersProvider>
						<Layout />
					</AllUsersProvider>
				</ErrorBoundary>
			</FontSizeProvider>
		</AuthProvider>
	);
}

export default App;
