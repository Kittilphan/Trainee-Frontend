import React from 'react';
import ActionCard from '../components/Common/Card/ActionCard/ActionCard';
import ProtectedComponent from '../components/ProtectedComponent';
import { ROLES } from '../constants/users';

export default function Home() {
	return (
		<>
			<h1>Home</h1>
			<hr />
			<div className="row">
				<ActionCard actionName={'Projects'} linkTo={'/projects'} />
				<ProtectedComponent requiredRoles={[ROLES.SALE]}>
					<ActionCard actionName={'Customers'} linkTo={'/customers'} />
					<ActionCard actionName={'Vendors'} linkTo={'/vendors'} />
				</ProtectedComponent>
				<ActionCard actionName={'XO List'} linkTo={'/xo'} />
				<ActionCard actionName={'Delivery Request List'} linkTo={'/delivery-requests'} />
				<ProtectedComponent
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
					<ActionCard actionName={'Dashboard'} linkTo={'/dashboard'} />
				</ProtectedComponent>
			</div>
		</>
	);
}
