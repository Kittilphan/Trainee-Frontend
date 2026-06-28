import React from 'react';
import { Outlet } from 'react-router-dom';

import useScrollPosition from '../../hooks/useScrollPosition';

import NavigationMenu from './NavigationMenu';
import BackToTop from '../BackToTop';
import Title from './Title';
import UserLogonButton from './UserLogonButton';
import Style from './index.module.css';

export default function Layout() {
	const [menuOpened, setMenuOpened] = React.useState(false);
	const { scrollPositionPercent } = useScrollPosition();
	return (
		<>
			<div className={Style.header}>
				<div className={Style.navigationTop}>
					<div
						className={[Style.menuToggle, menuOpened === true ? Style.menuTransform : ''].join(' ')}
						onClick={(e) => setMenuOpened(!menuOpened)}>
						<span></span>
						<span></span>
						<span></span>
					</div>
					<Title />
					<div className="d-flex flex-grow-1 justify-content-end">
						<UserLogonButton />
					</div>
				</div>
				<div
					style={{
						width: `${Math.round(scrollPositionPercent)}%`,
						height: `4px`,
						backgroundColor: `var(--color-app-green)`
					}}></div>
			</div>
			<NavigationMenu isActive={menuOpened} callback={() => setMenuOpened(false)} />
			<div className={Style.container}>
				<Outlet />
			</div>
			<BackToTop />
		</>
	);
}
