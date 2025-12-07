import SwiftUI
import WebKit

struct NoktaWebView: UIViewRepresentable {
    let serverUrl: String

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.userContentController.add(context.coordinator, name: "NoktaiOS")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.uiDelegate = context.coordinator
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true

        if let url = URL(string: serverUrl) {
            webView.load(URLRequest(url: url))
        }
        context.coordinator.webView = webView
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    class Coordinator: NSObject, WKScriptMessageHandler, WKUIDelegate, WKNavigationDelegate {
        weak var webView: WKWebView?
        private var tokenObserver: Any?

        override init() {
            super.init()
            tokenObserver = NotificationCenter.default.addObserver(forName: .apnsTokenReceived, object: nil, queue: .main) { [weak self] notification in
                if let token = notification.object as? String { self?.sendTokenToWeb(token) }
            }
        }

        deinit { if let observer = tokenObserver { NotificationCenter.default.removeObserver(observer) } }

        private let sharedDefaults = UserDefaults(suiteName: "group.com.nokta.app")

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "NoktaiOS", let body = message.body as? [String: String],
                  let authToken = body["authToken"], let userId = body["userId"] else { return }
            sharedDefaults?.set(authToken, forKey: "authToken")
            sharedDefaults?.set(userId, forKey: "userId")
            sharedDefaults?.set(UserDefaults.standard.string(forKey: "serverUrl"), forKey: "serverUrl")
            if let apnsToken = UserDefaults.standard.string(forKey: "apnsToken") {
                registerToken(apnsToken: apnsToken, authToken: authToken, userId: userId)
            }
        }

        private func sendTokenToWeb(_ token: String) {
            webView?.evaluateJavaScript("window.noktaApnsToken = '\(token)'", completionHandler: nil)
        }

        private func registerToken(apnsToken: String, authToken: String, userId: String) {
            guard let serverUrl = UserDefaults.standard.string(forKey: "serverUrl"),
                  let url = URL(string: "\(serverUrl)/api/collections/device_tokens/records") else { return }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
            request.httpBody = try? JSONSerialization.data(withJSONObject: ["token": apnsToken, "platform": "ios", "user": userId])
            URLSession.shared.dataTask(with: request).resume()
        }

    }
}
