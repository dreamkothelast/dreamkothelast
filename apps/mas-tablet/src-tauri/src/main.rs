// Masque la console Windows en mode release (déjà géré par Tauri avec windows_subsystem)
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    mas_tablet_lib::run()
}
