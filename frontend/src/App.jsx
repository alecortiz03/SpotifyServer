import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Connect from './Screens/Connect';
import Dashboard from './Screens/Dashboard';

function ProtectedRoute({ children }) {
	const loggedIn = localStorage.getItem('appLoggedIn') === 'true';

	return loggedIn ? children : (
			<Navigate
				to='/connect'
				replace
			/>
		);
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path='/'
					element={
						<Navigate
							to='/connect'
							replace
						/>
					}
				/>

				<Route
					path='/connect'
					element={<Connect />}
				/>

				<Route
					path='/dashboard'
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>

				<Route
					path='*'
					element={
						<Navigate
							to='/connect'
							replace
						/>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}
