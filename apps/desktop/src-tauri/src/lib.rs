use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

/// Tracks file paths that the user explicitly selected via native dialogs.
/// Only paths in this set can be written to by `write_file_to_path`.
struct AllowedPaths(Mutex<HashSet<String>>);

/// Register a path returned by the native save dialog.
/// Must be called by the frontend after the user picks a save location.
#[tauri::command]
fn register_dialog_path(state: tauri::State<'_, AllowedPaths>, path: String) {
    state.0.lock().unwrap().insert(path);
}

/// Write content to a file path that was previously registered via dialog.
/// Rejects any path not in the allowed set.
#[tauri::command]
fn write_file_to_path(
    state: tauri::State<'_, AllowedPaths>,
    path: String,
    content: String,
) -> Result<(), String> {
    // Validate the path was selected by the user via native dialog
    let allowed = state.0.lock().unwrap();
    if !allowed.contains(&path) {
        return Err("Path not authorized. File must be selected via the save dialog.".into());
    }
    drop(allowed); // Release lock before I/O

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
        .manage(AllowedPaths(Mutex::new(HashSet::new())))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            write_file_to_path,
            file_exists,
            register_dialog_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
