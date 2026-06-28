import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './fonts.css';
import './index.css';

import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import SuspenseLoading from './components/SuspenseLoading';
import ProtectedRoute from './components/ProtectedRoute/index';
import ErrorPage from './components/ErrorPage';
import { ProjectList, ProjectCreate, ProjectView, ProjectHeaderUpdate, ProjectDetailUpdate } from './routes/Project';

import { DeliveryRequestList, DeliveryRequestView } from './routes/DeliveryRequest';

import { CustomerList } from './routes/Customer';
import { VendorList } from './routes/Vendor';
import { XOList } from './routes/xo';

import { WIPCreate, WIPView, WIPUpdate } from './routes/WIP/index.js';

import { Dashboard } from './routes/Dashboard/index.js';

import Home from './routes/Home';
import UserLoginForm from './routes/User/Login';
import UserLogoutForm from './routes/User/Logout';

import { ROLES } from './constants/users.js';
import { setupInterceptors } from './controllers/API.js';

const publicURL = import.meta.env.VITE_PUBLIC_URL || 'webui';

function ScrollToTop() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		setupInterceptors(navigate, location);
	}, [navigate]);

	React.useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return;
}

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter basename={publicURL}>
			<ScrollToTop />
			<SuspenseLoading>
				<Routes>
					<Route path={`/`} element={<App />}>
						<Route
							index
							element={
								<ProtectedRoute requiredRoles={[ROLES.USER]}>
									<Home />
								</ProtectedRoute>
							}
						/>
						<Route path={`projects`}>
							<Route
								path={`new`}
								element={
									<ProtectedRoute requiredRoles={[ROLES.SALE]}>
										<ProjectCreate />
									</ProtectedRoute>
								}
							/>
							<Route
								path={`:projectId/update-header`}
								element={
									<ProtectedRoute
										requiredRoles={[
											ROLES.SALE,
											ROLES.INFRA_PRESALE,
											ROLES.INFRA_PRESALE_LEADER,
											ROLES.CABLING_PRESALE,
											ROLES.CABLING_PRESALE_LEADER,
											ROLES.DATA_CENTER_PRESALE,
											ROLES.DATA_CENTER_PRESALE_LEADER,
											ROLES.PROJECT_MANAGER_LEADER
										]}>
										<ProjectHeaderUpdate />
									</ProtectedRoute>
								}
							/>
							<Route
								path={`:projectId/update-detail`}
								element={
									<ProtectedRoute
										requiredRoles={[
											ROLES.INFRA_PRESALE,
											ROLES.INFRA_PRESALE_LEADER,
											ROLES.CABLING_PRESALE,
											ROLES.CABLING_PRESALE_LEADER,
											ROLES.DATA_CENTER_PRESALE,
											ROLES.DATA_CENTER_PRESALE_LEADER
										]}>
										<ProjectDetailUpdate />
									</ProtectedRoute>
								}
							/>
							<Route
								path={`:projectId`}
								element={
									<ProtectedRoute>
										<ProjectView />
									</ProtectedRoute>
								}
							/>
							<Route
								path={`:projectId/wip-create`}
								element={
									<ProtectedRoute requiredRoles={[ROLES.SALE]}>
										<WIPCreate />
									</ProtectedRoute>
								}
							/>
							<Route
								path={`:projectId/wip/:wipId`}
								element={
									<ProtectedRoute>
										<WIPView />
									</ProtectedRoute>
								}
							/>
							<Route
								path={`:projectId/wip/:wipId/update-wip`}
								element={
									<ProtectedRoute
										requiredRoles={[
											ROLES.SALE,
											ROLES.INFRA_ENGINEER,
											ROLES.CABLING_ENGINEER,
											ROLES.DATA_CENTER_ENGINEER,
											ROLES.PROJECT_MANAGER
										]}>
										<WIPUpdate />
									</ProtectedRoute>
								}
							/>
							<Route
								index
								element={
									<ProtectedRoute>
										<ProjectList />
									</ProtectedRoute>
								}
							/>
						</Route>
						<Route path={`customers`}>
							<Route
								index
								element={
									<ProtectedRoute requiredRoles={[ROLES.SALE]}>
										<CustomerList />
									</ProtectedRoute>
								}
							/>
						</Route>
						<Route path={`vendors`}>
							<Route
								index
								element={
									<ProtectedRoute requiredRoles={[ROLES.SALE]}>
										<VendorList />
									</ProtectedRoute>
								}
							/>
						</Route>
						<Route path={`xo`}>
							<Route
								index
								element={
									<ProtectedRoute>
										<XOList />
									</ProtectedRoute>
								}
							/>
						</Route>
						<Route path={`dashboard`}>
							<Route
								index
								element={
									<ProtectedRoute
										requiredRoles={[
											ROLES.SALE,
											ROLES.INFRA_PRESALE,
											ROLES.INFRA_ENGINEER,
											ROLES.CABLING,
											ROLES.DATA_CENTER,
											ROLES.INFRA_PRESALE_LEADER,
											ROLES.INFRA_ENGINEER_LEADER,
											ROLES.CABLING_PRESALE_LEADER,
											ROLES.CABLING_ENGINEER_LEADER,
											ROLES.DATA_CENTER_PRESALE_LEADER,
											ROLES.DATA_CENTER_ENGINEER_LEADER
										]}>
										<Dashboard />
									</ProtectedRoute>
								}
							/>
						</Route>
						<Route path={`delivery-requests`}>
							<Route path={`:deliveryRequestId`} element={<DeliveryRequestView />} />
							<Route index element={<DeliveryRequestList />} />
						</Route>
					</Route>
					<Route path={`user`}>
						<Route path={`login`} element={<UserLoginForm />} />
						<Route path={`logout`} element={<UserLogoutForm />} />
					</Route>
					<Route
						path="*"
						element={
							<div className="error-page">
								<ErrorPage
									error={(() => {
										const error = new Error(`Requested location not found: ${window.location.href}`);
										error.httpCode = 404;
										return error;
									})()}
								/>
								<div className="d-flex gap-4 py-4">
									<button onClick={() => window.location.reload()}>Retry again</button>
									<button onClick={() => window.history.back()}>Back</button>
								</div>
							</div>
						}
					/>
				</Routes>
			</SuspenseLoading>
		</BrowserRouter>
	</React.StrictMode>
);
