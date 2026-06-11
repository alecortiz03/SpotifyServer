mod spotify_server;

#[tokio::main]
async fn main() {
    spotify_server::start_spotify_server().await;
}