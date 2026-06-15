use tower_http::{
    cors::{Any, CorsLayer},
    services::{ServeDir, ServeFile},
};

use axum::{
    extract::{Path, Query, State},
    response::{Html, Redirect},
    routing::get,
    Router,
};

use serde::{Deserialize, Serialize};

use std::{
    net::SocketAddr,
    sync::{Arc, Mutex},
};

#[derive(Clone)]
struct AppState {
    access_token: Arc<Mutex<Option<String>>>,
}

#[derive(Deserialize)]
struct SpotifyCallback {
    code: String,
}

#[derive(Deserialize)]
struct SpotifyTokenResponse {
    access_token: String,
}

#[derive(Serialize)]
struct TokenStatus {
    access_token: Option<String>,
}

#[derive(Serialize)]
struct LoginResponse {
    valid: bool,
    connected: bool,
}

pub async fn start_spotify_server() {
    let state = AppState {
        access_token: Arc::new(Mutex::new(None)),
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/login/{username}/{password}", get(login))
        .route("/api/spotify/start", get(start_spotify_login))
        .route("/api/spotify/callback", get(spotify_callback))
        .route("/api/spotify/token", get(get_token))
        .route("/api/spotify/logout", get(logout))
        .fallback_service(
            ServeDir::new("frontend/dist")
                .not_found_service(ServeFile::new("frontend/dist/index.html")),
        )
        .layer(cors)
        .with_state(state);

    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse()
        .expect("PORT must be a number");

    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    println!("Server listening on http://{}", addr);
    println!("Spotify callback: {}/api/spotify/callback", get_base_url());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind server");

    axum::serve(listener, app)
        .await
        .expect("Server crashed");
}

async fn login(
    Path((username, password)): Path<(String, String)>,
    State(state): State<AppState>,
) -> axum::Json<LoginResponse> {
    let valid = username == get_admin_username() && password == get_admin_password();
    let connected = state.access_token.lock().unwrap().is_some();

    axum::Json(LoginResponse { valid, connected })
}

async fn start_spotify_login() -> Redirect {
    let redirect_uri = format!("{}/api/spotify/callback", get_base_url());

    let scopes = [
        "streaming",
        "user-read-email",
        "user-read-private",
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing",
    ]
    .join(" ");

    let spotify_url = format!(
        "https://accounts.spotify.com/authorize?client_id={}&response_type=code&redirect_uri={}&scope={}",
        get_client_id(),
        encode_uri_component(&redirect_uri),
        encode_uri_component(&scopes)
    );

    Redirect::to(&spotify_url)
}

async fn spotify_callback(
    State(state): State<AppState>,
    Query(query): Query<SpotifyCallback>,
) -> Result<Redirect, Html<String>> {
    let redirect_uri = format!("{}/api/spotify/callback", get_base_url());

    let body = format!(
        "grant_type=authorization_code&code={}&redirect_uri={}&client_id={}&client_secret={}",
        encode_uri_component(&query.code),
        encode_uri_component(&redirect_uri),
        encode_uri_component(&get_client_id()),
        encode_uri_component(&get_client_secret())
    );

    let client = reqwest::Client::new();

    let response = client
        .post("https://accounts.spotify.com/api/token")
        .header("Content-Type", "application/x-www-form-urlencoded")
        .body(body)
        .send()
        .await;

    let Ok(response) = response else {
        return Err(Html("<h1>Spotify token request failed</h1>".to_string()));
    };

    if !response.status().is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown Spotify error".to_string());

        return Err(Html(format!(
            "<h1>Spotify token request failed</h1><pre>{}</pre>",
            error_text
        )));
    }

    let token_result = response.json::<SpotifyTokenResponse>().await;

    let Ok(token) = token_result else {
        return Err(Html("<h1>Could not read Spotify token</h1>".to_string()));
    };

    *state.access_token.lock().unwrap() = Some(token.access_token);

    Ok(Redirect::to("/dashboard?spotify=connected"))
}

async fn get_token(State(state): State<AppState>) -> axum::Json<TokenStatus> {
    axum::Json(TokenStatus {
        access_token: state.access_token.lock().unwrap().clone(),
    })
}

async fn logout(State(state): State<AppState>) -> Html<String> {
    *state.access_token.lock().unwrap() = None;

    Html(
        r#"
        <h1>Spotify Logged Out</h1>
        <p>You can now connect a different Spotify account.</p>
        "#
        .to_string(),
    )
}

fn get_admin_username() -> String {
    std::env::var("ADMIN_USERNAME")
        .expect("ADMIN_USERNAME must be set")
}

fn get_admin_password() -> String {
    std::env::var("ADMIN_PASSWORD")
        .expect("ADMIN_PASSWORD must be set")
}

fn get_base_url() -> String {
    std::env::var("PUBLIC_BASE_URL")
        .expect("PUBLIC_BASE_URL must be set")
}

fn get_client_id() -> String {
    std::env::var("SPOTIFY_CLIENT_ID")
        .expect("SPOTIFY_CLIENT_ID must be set")
}

fn get_client_secret() -> String {
    std::env::var("SPOTIFY_CLIENT_SECRET")
        .expect("SPOTIFY_CLIENT_SECRET must be set")
}

fn encode_uri_component(input: &str) -> String {
    input
        .replace("%", "%25")
        .replace(" ", "%20")
        .replace(":", "%3A")
        .replace("/", "%2F")
        .replace("?", "%3F")
        .replace("#", "%23")
        .replace("[", "%5B")
        .replace("]", "%5D")
        .replace("@", "%40")
        .replace("!", "%21")
        .replace("$", "%24")
        .replace("&", "%26")
        .replace("'", "%27")
        .replace("(", "%28")
        .replace(")", "%29")
        .replace("*", "%2A")
        .replace("+", "%2B")
        .replace(",", "%2C")
        .replace(";", "%3B")
        .replace("=", "%3D")
}