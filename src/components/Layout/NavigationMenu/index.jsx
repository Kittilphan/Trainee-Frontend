import React from 'react';
import { NavLink } from 'react-router-dom';
import Style from './style.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faBriefcase,
	faBuilding,
	faHome,
	faFile,
	faAddressBook,
	faBook,
	faChartLine
} from '@fortawesome/free-solid-svg-icons';
import ProtectedComponent from '../../ProtectedComponent';
import { ROLES } from '../../../constants/users';

export default function NavigationMenu({ isActive, callback }) {
	if (!callback) callback = () => {};
	return (
		<>
			<div className={[Style.navigationMenu, isActive ? Style.active : ''].join(' ')} onClickCapture={callback}>
				<ul>
					<li>
						<NavLink to={`/`} onClick={callback}>
							<FontAwesomeIcon icon={faHome} className={Style.icon} fixedWidth />
							Home
						</NavLink>
					</li>
					<li>
						<NavLink to={`/projects`} onClick={callback}>
							<FontAwesomeIcon icon={faBriefcase} className={Style.icon} fixedWidth />
							Projects
						</NavLink>
					</li>
					<ProtectedComponent requiredRoles={[ROLES.SALE]}>
						<li>
							<NavLink to={`/customers`} onClick={callback}>
								<FontAwesomeIcon icon={faBuilding} className={Style.icon} fixedWidth />
								Customers
							</NavLink>
						</li>
						<li>
							<NavLink to={`/vendors`} onClick={callback}>
								<FontAwesomeIcon icon={faAddressBook} className={Style.icon} fixedWidth />
								Vendors
							</NavLink>
						</li>
					</ProtectedComponent>
					<li>
						<NavLink to={`/xo`} onClick={callback}>
							<FontAwesomeIcon icon={faFile} className={Style.icon} fixedWidth />
							XO Lists
						</NavLink>
					</li>
					<li>
						<NavLink to={`/delivery-requests`} onClick={callback}>
							<FontAwesomeIcon icon={faBook} className={Style.icon} fixedWidth />
							Delivery Request List
						</NavLink>
					</li>

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
						<li>
							<NavLink to={`/dashboard`} onClick={callback}>
								<FontAwesomeIcon icon={faChartLine} className={Style.icon} fixedWidth /> Dashboard
							</NavLink>
						</li>
					</ProtectedComponent>
				</ul>
			</div>
		</>
	);
}
