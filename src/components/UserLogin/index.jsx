import React, { useState, useRef, useEffect } from 'react';
import Style from './style.module.css';

import { Navigate } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import useQuery from '../../hooks/useQuery';

import loginBG from '../../assets/images/loginBG.webp';

export default function UserLogin({ redirectUrl = {} }) {
	const query = useQuery();
	const { userLogin, user } = useAuth();
	const [inputUsername, setUsername] = useState('');
	const [inputPassword, setPassword] = useState('');
	const [remember, setRemember] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		const username = localStorage.getItem('username');
		if (username) {
			setUsername(username);
			setRemember(true);
		}
	}, []);

	function handleInputUsername(e) {
		setUsername(e.target.value);
	}

	function handleInputPassword(e) {
		setPassword(e.target.value);
	}

	function handleLogin(e) {
		e.preventDefault();
		if (remember) {
			localStorage.setItem('username', inputUsername);
		} else {
			localStorage.removeItem('username');
		}
		userLogin({
			username: inputUsername,
			password: inputPassword,
			redirectLogonURL: redirectUrl
		});
	}

	if (user && user?.isLoggedIn === true) {
		if (!query.has('force')) return <Navigate to={redirectUrl || '/'} replace={true} />;
	}

	return (
		<div className={Style.containerLogin100}>
			<div className={Style.wrapLogin100}>
				<form className={`${Style.login100Form} validate-form`} onSubmit={handleLogin}>
					<span className={`${Style.login100FormTitle}`}>Login to continue</span>

					<label
						className={`${Style.wrapInput100} ${Style.validateInput}`}
						data-validate="Valid email is required: ex@abc.xyz">
						<input
							className={`${Style.input100}`}
							type="text"
							name="username"
							value={inputUsername}
							onChange={handleInputUsername}
						/>
						<span className={`${Style.focusInput100}`}></span>
						<span className={`${Style.labelInput100}`}>Username</span>
					</label>

					<label className={`${Style.wrapInput100} ${Style.validateInput}`} data-validate="Password is required">
						<input
							className={`${Style.input100}`}
							type={showPassword ? 'text' : 'password'}
							name="pass"
							value={inputPassword}
							onChange={handleInputPassword}
						/>
						<span className={`${Style.focusInput100}`}></span>
						<span className={`${Style.labelInput100}`}>Password</span>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className={Style.showPasswordBtn}
							aria-label="Toggle password visibility">
							{showPassword ? 'Hide' : 'Show'}
						</button>
					</label>

					<div className={`${Style.flexSbM} w-100 pt-1 pb-4`}>
						<div className={`${Style.contact100FormCheckbox}`}>
							<input
								className={`${Style.inputCheckbox100}`}
								id="ckb1"
								type="checkbox"
								name="remember"
								checked={remember}
								onChange={() => setRemember(!remember)}
							/>
							<label className={`${Style.labelCheckbox100}`} htmlFor="ckb1">
								Remember me
							</label>
						</div>

						{/* <div>
              <a href="#" className={`${Style.txt1}`}>
                Forgot Password?
              </a>
            </div> */}
					</div>

					<div className={`${Style.containerLogin100FormBtn}`}>
						<button type="submit" className={`${Style.login100FormBtn}`}>
							Login
						</button>
					</div>
				</form>

				<div className={`${Style.login100More} `} style={{ backgroundImage: `url(${loginBG})` }}></div>
			</div>
		</div>
	);
}
