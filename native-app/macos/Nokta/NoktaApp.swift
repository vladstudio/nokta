import SwiftUI
import UserNotifications

@main
struct NoktaApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @AppStorage("serverUrl") private var serverUrl = ""

    var body: some Scene {
        WindowGroup {
            ContentView()
                .frame(minWidth: 400, minHeight: 300)
        }
        .windowStyle(.hiddenTitleBar)
        .commands {
            CommandGroup(replacing: .newItem) {}
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate, UNUserNotificationCenterDelegate {
    var statusItem: NSStatusItem?
    var normalIcon: NSImage?
    var unreadIcon: NSImage?

    func applicationDidFinishLaunching(_ notification: Notification) {
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
            button.action = #selector(statusItemClicked)
            button.target = self
            button.sendAction(on: [.leftMouseUp, .rightMouseUp])
        }
    }

    @objc private func statusItemClicked(_ sender: NSStatusBarButton) {
        let event = NSApp.currentEvent!
        if event.type == .rightMouseUp {
            showContextMenu()
        } else {
            NSApp.windows.first?.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
        }
    }

    private func showContextMenu() {
        let menu = NSMenu()
        menu.addItem(NSMenuItem(title: "Open Nokta", action: #selector(openWindow), keyEquivalent: ""))

        let loginItem = NSMenuItem(title: "Start on Login", action: #selector(toggleLoginItem), keyEquivalent: "")
        loginItem.state = isLoginItemEnabled() ? .on : .off
        menu.addItem(loginItem)

        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Change Server", action: #selector(changeServer), keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Quit", action: #selector(quitApp), keyEquivalent: "q"))

        statusItem?.menu = menu
        statusItem?.button?.performClick(nil)
        statusItem?.menu = nil
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

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        [.banner, .badge, .sound]
    }
}

import ServiceManagement

extension Notification.Name {
    static let setUnreadStatus = Notification.Name("setUnreadStatus")
    static let serverUrlChanged = Notification.Name("serverUrlChanged")
}
