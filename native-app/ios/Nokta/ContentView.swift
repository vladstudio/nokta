import SwiftUI

struct ContentView: View {
    @AppStorage("serverUrl") private var serverUrl = ""
    @State private var showingServerPrompt = false
    @State private var urlInput = ""
    @State private var validationError = ""
    @State private var isValidating = false

    var body: some View {
        Group {
            if serverUrl.isEmpty {
                serverPromptView
            } else {
                NoktaWebView(serverUrl: serverUrl)
                    .ignoresSafeArea()
            }
        }
        .onAppear { showingServerPrompt = serverUrl.isEmpty }
    }

    private var serverPromptView: some View {
        VStack(spacing: 20) {
            Text("Nokta").font(.largeTitle).bold()
            TextField("Server URL", text: $urlInput)
                .textFieldStyle(.roundedBorder)
                .autocapitalization(.none)
                .keyboardType(.URL)
                .padding(.horizontal, 40)
            if !validationError.isEmpty {
                Text(validationError).foregroundColor(.red).font(.caption)
            }
            Button(action: validateServer) {
                if isValidating {
                    ProgressView()
                } else {
                    Text("Connect").frame(minWidth: 120)
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(urlInput.isEmpty || isValidating)
        }
    }

    private func validateServer() {
        isValidating = true
        validationError = ""
        var url = urlInput.trimmingCharacters(in: .whitespacesAndNewlines)
        if !url.hasPrefix("http") { url = "https://\(url)" }
        guard let apiUrl = URL(string: "\(url)/api/nokta") else {
            validationError = "Invalid URL"
            isValidating = false
            return
        }
        URLSession.shared.dataTask(with: apiUrl) { data, _, error in
            DispatchQueue.main.async {
                isValidating = false
                if let error { validationError = error.localizedDescription; return }
                guard let data, let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      json["app"] as? String == "nokta" else {
                    validationError = "Invalid Nokta server"
                    return
                }
                serverUrl = url
            }
        }.resume()
    }
}
