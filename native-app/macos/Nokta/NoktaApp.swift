import SwiftUI
import UserNotifications
import ServiceManagement

@main
struct NoktaApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup("Nokta") {
            ContentView()
                .frame(minWidth: 400, minHeight: 300)
                .background(WindowAccessor())
        }
        .commands {
            CommandGroup(replacing: .newItem) {}
        }
    }
}

struct WindowAccessor: NSViewRepresentable {
    func makeNSView(context: Context) -> NSView {
        let view = NSView()
        DispatchQueue.main.async {
            if let window = view.window {
                window.delegate = WindowDelegate.shared
                window.setFrameAutosaveName("NoktaMainWindow")
            }
        }
        return view
    }
    func updateNSView(_ nsView: NSView, context: Context) {}
}

class WindowDelegate: NSObject, NSWindowDelegate {
    static let shared = WindowDelegate()

    func windowShouldClose(_ sender: NSWindow) -> Bool {
        sender.orderOut(nil)
        return false
    }
}

class AppDelegate: NSObject, NSApplicationDelegate, UNUserNotificationCenterDelegate, NSMenuDelegate {
    var statusItem: NSStatusItem?
    var normalIcon: NSImage?
    var unreadIcon: NSImage?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSWindow.allowsAutomaticWindowTabbing = false
        UNUserNotificationCenter.current().delegate = self
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { _, _ in }
        setupMenuBar()

        NotificationCenter.default.addObserver(forName: .setUnreadStatus, object: nil, queue: .main) { [weak self] notification in
            if let hasUnread = notification.object as? Bool {
                self?.updateTrayIcon(hasUnread: hasUnread)
            }
        }
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        if !flag {
            NSApp.windows.first?.makeKeyAndOrderFront(nil)
        }
        return true
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        false
    }

    private func setupMenuBar() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)

        if let button = statusItem?.button {
            normalIcon = NSImage(named: "icon-black")
            normalIcon?.size = NSSize(width: 18, height: 18)
            normalIcon?.isTemplate = true

            unreadIcon = NSImage(named: "icon-black-unread")
            unreadIcon?.size = NSSize(width: 18, height: 18)
            unreadIcon?.isTemplate = true

            button.image = normalIcon
        }

        updateMenu()
    }

    private func updateMenu() {
        let menu = NSMenu()
        menu.delegate = self

        menu.addItem(NSMenuItem(title: "Open Nokta", action: #selector(openWindow), keyEquivalent: ""))

        let loginItem = NSMenuItem(title: "Start on Login", action: #selector(toggleLoginItem), keyEquivalent: "")
        loginItem.state = isLoginItemEnabled() ? .on : .off
        menu.addItem(loginItem)

        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Change Server", action: #selector(changeServer), keyEquivalent: ""))
        menu.addItem(NSMenuItem(title: "Quit", action: #selector(quitApp), keyEquivalent: "q"))

        statusItem?.menu = menu
    }

    @objc private func openWindow() {
        NSApp.windows.first?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc private func toggleLoginItem() {
        do {
            if isLoginItemEnabled() {
                try SMAppService.mainApp.unregister()
            } else {
                try SMAppService.mainApp.register()
            }
        } catch {
            print("Failed to toggle login item: \(error)")
        }
    }

    private func isLoginItemEnabled() -> Bool {
        SMAppService.mainApp.status == .enabled
    }

    @objc private func changeServer() {
        UserDefaults.standard.removeObject(forKey: "serverUrl")
        NotificationCenter.default.post(name: .serverUrlChanged, object: nil)
        openWindow()
    }

    @objc private func quitApp() {
        NSApp.terminate(nil)
    }

    private func updateTrayIcon(hasUnread: Bool) {
        statusItem?.button?.image = hasUnread ? unreadIcon : normalIcon
    }

    func menuWillOpen(_ menu: NSMenu) {
        if let loginItem = menu.item(withTitle: "Start on Login") {
            loginItem.state = isLoginItemEnabled() ? .on : .off
        }
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        [.banner, .badge, .sound]
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        if let chatId = response.notification.request.content.userInfo["chatId"] as? String {
            NotificationCenter.default.post(name: .navigateToChat, object: chatId)
        }
        openWindow()
    }
}

extension Notification.Name {
    static let setUnreadStatus = Notification.Name("setUnreadStatus")
    static let serverUrlChanged = Notification.Name("serverUrlChanged")
    static let navigateToChat = Notification.Name("navigateToChat")
}
