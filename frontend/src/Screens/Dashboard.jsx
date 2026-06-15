import SpotifyIcon from '../Assets/spotify.png';
import YouTubeIcon from '../Assets/youtube.png';
import { useEffect, useState } from 'react';

export default function Dashboard() {
	const [spotifyConnected, setSpotifyConnected] = useState(
		localStorage.getItem('loggedIn') === 'true',
	);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);

		if (params.get('spotify') === 'connected') {
			localStorage.setItem('loggedIn', 'true');
			setSpotifyConnected(true);

			window.history.replaceState({}, '', '/dashboard');
		}
	}, []);

	function connectSpotify() {
		window.location.href = '/api/spotify/start';
	}

	async function logoutSpotify() {
		try {
			await fetch('/api/spotify/logout');

			localStorage.removeItem('loggedIn');
			setSpotifyConnected(false);
		} catch (err) {
			console.error(err);
		}
	}

	return (
		<div style={styles.page}>
			{spotifyConnected ?
				<button
					onClick={logoutSpotify}
					style={styles.logoutButton}>
					<div style={styles.buttonContent}>
						<img
							src={SpotifyIcon}
							alt='Spotify'
							style={styles.icon}
						/>

						<span style={styles.logoutButtonText}>Log Out of Spotify</span>
					</div>
				</button>
			:	<button
					onClick={connectSpotify}
					style={styles.button}>
					<div style={styles.buttonContent}>
						<img
							src={SpotifyIcon}
							alt='Spotify'
							style={styles.icon}
						/>

						<span style={styles.buttonText}>Connect Spotify</span>
					</div>
				</button>
			}

			<hr style={styles.line} />

			<p>Coming Soon!!!</p>

			<button
				disabled
				style={{
					...styles.button,
					...styles.youtubeButton,
					marginTop: 16,
				}}>
				<div style={styles.buttonContent}>
					<img
						src={YouTubeIcon}
						alt='YouTube'
						style={styles.youtubeIcon}
					/>

					<span style={styles.youtubeButtonText}>Continue with YouTube</span>
				</div>
			</button>
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

	button: {
		display: 'block',
		width: 'clamp(100px, 30%, 400px)',
		padding: 12,
		background: '#1DB954',
		color: 'white',
		border: 'none',
		borderRadius: 10,
		cursor: 'pointer',
	},

	logoutButton: {
		display: 'block',
		width: 'clamp(100px, 30%, 400px)',
		padding: 12,
		background: '#d32f2f',
		color: 'white',
		border: 'none',
		borderRadius: 10,
		cursor: 'pointer',
		boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
		transition: 'all 0.2s ease',
	},

	buttonContent: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '12px',
	},

	line: {
		width: '30%',
		border: '1px solid #ffffff',
		margin: '16px 0',
	},

	icon: {
		width: 'clamp(20px, 3vw, 40px)',
		height: 'clamp(20px, 3vw, 40px)',
	},

	buttonText: {
		color: '#000000',
		fontSize: 'clamp(9px, 2vw, 32px)',
		marginLeft: 8,
		verticalAlign: 'middle',
		textShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
	},

	logoutButtonText: {
		color: '#ffffff',
		fontSize: 'clamp(9px, 2vw, 32px)',
		fontWeight: 'bold',
		textShadow: '0px 1px 3px rgba(0,0,0,0.4)',
	},

	youtubeButton: {
		background: '#ffffff',
		opacity: 0.7,
		cursor: 'not-allowed',
	},

	youtubeIcon: {
		width: 'clamp(20px, 3vw, 130px)',
		height: 'clamp(20px, 2vw, 40px)',
	},

	youtubeButtonText: {
		color: '#090909',
		fontSize: 'clamp(8px, 2vw, 26px)',
		verticalAlign: 'middle',
		textShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
	},
};
