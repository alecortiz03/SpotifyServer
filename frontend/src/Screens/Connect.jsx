import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Connect() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');

	const navigate = useNavigate();

	async function login() {
		try {
			const res = await fetch(
				`/api/login/${encodeURIComponent(username)}/${encodeURIComponent(password)}`,
			);

			const data = await res.json();

			if (!data.valid) {
				setMessage('Invalid username or password.');
				return;
			}

			localStorage.setItem('appLoggedIn', 'true');
			localStorage.setItem('username', username);

			navigate('/dashboard');
		} catch (err) {
			console.error(err);
			setMessage('Could not reach server.');
		}
	}

	return (
		<div style={styles.page}>
			<h1>IT TV ONE</h1>

			<p>Enter Login Credentials to connect to IT TV ONE</p>

			<input
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				type='text'
				placeholder='Username'
				style={styles.input}
			/>

			<input
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				type='password'
				placeholder='Password'
				style={styles.input}
			/>

			<button
				onClick={login}
				style={styles.button}>
				Login
			</button>

			<button
				onClick={() => {
					setUsername('');
					setPassword('');
					setMessage('');
				}}
				style={{
					...styles.button,
					marginTop: 16,
					background: '#888888',
				}}>
				Clear
			</button>

			{message && <p>{message}</p>}
		</div>
	);
}

const styles = {
	page: {
		minHeight: '100vh',
		width: '100%',
		background: '#121212',
		color: 'white',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		fontFamily: 'Arial',
	},

	input: {
		fontSize: 24,
		padding: 12,
		borderRadius: 10,
		marginBottom: 16,
		width: '80vw',
		border: 'none',
		outline: 'none',
	},

	button: {
		display: 'block',
		width: '85vw',
		fontSize: 24,
		padding: 12,
		background: '#1DB954',
		color: 'white',
		border: 'none',
		borderRadius: 10,
		cursor: 'pointer',
	},
};
