import SwiftUI
import WebKit
import UserNotifications

struct NoktaWebView: NSViewRepresentable {
    let serverUrl: String

    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.mediaTypesRequiringUserActionForPlayback = []
        config.userContentController.add(context.coordinator, name: "NoktaMac")

        let prefs = WKWebpagePreferences()
        prefs.allowsContentJavaScript = true
        config.defaultWebpagePreferences = prefs

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.uiDelegate = context.coordinator
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        context.coordinator.webView = webView

        if let url = URL(string: serverUrl) {
            webView.load(URLRequest(url: url))
        }
        return webView
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    class Coordinator: NSObject, WKScriptMessageHandler, WKUIDelegate, WKNavigationDelegate {
        weak var webView: WKWebView?
        private var observer: NSObjectProtocol?

        override init() {
            super.init()
            observer = NotificationCenter.default.addObserver(forName: .navigateToChat, object: nil, queue: .main) { [weak self] notification in
                if let chatId = notification.object as? String {
                    self?.webView?.evaluateJavaScript("window.location.hash = '/chat/\(chatId)'")
                }
            }
        }

        deinit { if let observer { NotificationCenter.default.removeObserver(observer) } }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "NoktaMac", let body = message.body as? [String: Any] else { return }

            if let action = body["action"] as? String {
                switch action {
                case "setUnreadStatus":
                    if let hasUnread = body["hasUnread"] as? Bool {
                        NotificationCenter.default.post(name: .setUnreadStatus, object: hasUnread)
                    }
                case "showNotification":
                    if let title = body["title"] as? String, let notifBody = body["body"] as? String {
                        showNotification(title: title, body: notifBody, chatId: body["chatId"] as? String)
                    }
                default:
                    break
                }
            }
        }

        private func showNotification(title: String, body: String, chatId: String?) {
            let content = UNMutableNotificationContent()
            content.title = title
            content.body = body
            content.sound = .default
            if let chatId { content.userInfo = ["chatId": chatId] }

            let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
            UNUserNotificationCenter.current().add(request)
        }

        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = navigationAction.request.url {
                NSWorkspace.shared.open(url)
            }
            return nil
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if let url = navigationAction.request.url, navigationAction.navigationType == .linkActivated {
                if url.host != webView.url?.host {
                    NSWorkspace.shared.open(url)
                    decisionHandler(.cancel)
                    return
                }
            }
            decisionHandler(.allow)
        }

        func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
            let panel = NSOpenPanel()
            panel.allowsMultipleSelection = parameters.allowsMultipleSelection
            panel.canChooseDirectories = parameters.allowsDirectories
            panel.canChooseFiles = true

            panel.begin { result in
                completionHandler(result == .OK ? panel.urls : nil)
            }
        }
    }
}
