use tauri::{menu::{CheckMenuItem, Menu, MenuItem}, tray::TrayIconBuilder, Manager};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_store::StoreExt;
use std::process::Command;

fn prompt_for_url() -> Option<String> {
    let output = Command::new("osascript")
        .args(["-e", r#"text returned of (display dialog "Enter your Nokta server URL:" default answer "https://" with title "Nokta Setup")"#])
        .output().ok()?;
    if output.status.success() {
        let url = String::from_utf8_lossy(&output.stdout).trim().trim_end_matches('/').to_string();
        if !url.is_empty() && url != "https://" { Some(url) } else { None }
    } else { None }
}

const STORE_KEY: &str = "server_url";

#[tauri::command]
fn get_server_url(app: tauri::AppHandle) -> Option<String> {
    app.store("config.json").ok()?.get(STORE_KEY).and_then(|v| v.as_str().map(String::from))
}

#[tauri::command]
fn set_server_url(app: tauri::AppHandle, url: String) {
    if let Ok(store) = app.store("config.json") {
        let _ = store.set(STORE_KEY, serde_json::json!(url));
        let _ = store.save();
    }
}

#[tauri::command]
fn load_chat(app: tauri::AppHandle, url: String) {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.navigate(url.parse().unwrap());
    }
}

fn setup_tray(app: &tauri::App) -> tauri::Result<()> {
    let autostart = app.autolaunch();
    let is_enabled = autostart.is_enabled().unwrap_or(false);

    let open = MenuItem::with_id(app, "open", "Open Nokta", true, None::<&str>)?;
    let autostart_item = CheckMenuItem::with_id(app, "autostart", "Start on Login", true, is_enabled, None::<&str>)?;
    let forget = MenuItem::with_id(app, "forget", "Forget Server", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &autostart_item, &forget, &quit])?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "open" => { let _ = app.get_webview_window("main").map(|w| w.show()); }
            "autostart" => {
                let mgr = app.autolaunch();
                if mgr.is_enabled().unwrap_or(false) { let _ = mgr.disable(); } else { let _ = mgr.enable(); }
                if let Some(item) = app.menu().and_then(|m| m.get("autostart")) {
                    let _ = item.as_check_menuitem().map(|c| c.set_checked(mgr.is_enabled().unwrap_or(false)));
                }
            }
            "forget" => {
                if let Ok(store) = app.store("config.json") { let _ = store.delete(STORE_KEY); let _ = store.save(); }
                if let Some(url) = prompt_for_url() {
                    set_server_url(app.clone(), url.clone());
                    if let Some(w) = app.get_webview_window("main") {
                        let _ = w.navigate(url.parse().unwrap());
                        let _ = w.show();
                    }
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .build(app)?;
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
        .invoke_handler(tauri::generate_handler![get_server_url, set_server_url, load_chat])
        .setup(|app| {
            setup_tray(app)?;
            let win = app.get_webview_window("main").unwrap();

            let url = get_server_url(app.handle().clone()).or_else(|| {
                let u = prompt_for_url()?;
                set_server_url(app.handle().clone(), u.clone());
                Some(u)
            });

            if let Some(url) = url {
                let _ = win.navigate(url.parse().unwrap());
            }
            Ok(())
        })
        .on_window_event(|win, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = win.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error running app");
}
