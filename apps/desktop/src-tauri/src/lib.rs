use std::fs;
use std::path::PathBuf;

/// Write content to an arbitrary file path (selected via native dialog).
/// The path must come from the frontend after user interaction with the save dialog.
#[tauri::command]
fn write_file_to_path(path: String, content: String) -> Result<(), String> {
    let path = PathBuf::from(&path);

    // Ensure parent directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

/// Check if a file exists at the given path.
#[tauri::command]
fn file_exists(path: String) -> bool {
    PathBuf::from(&path).exists()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![write_file_to_path, file_exists])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
