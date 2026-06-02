// Bibliothèque principale de l'application Tauri.
// Pas de commandes Rust pour l'instant : tout le métier est dans le frontend React.
// Cette structure permet d'ajouter des commandes natives (accès fichiers, etc.) sans refonte.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("Erreur au lancement de l'application MAS Tablette");
}
