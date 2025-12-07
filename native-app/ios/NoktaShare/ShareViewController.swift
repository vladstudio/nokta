import UIKit
import UniformTypeIdentifiers

class ShareViewController: UIViewController {
    private var chats: [[String: Any]] = []
    private var selectedChat: String?
    private var sharedFiles: [(Data, String, String)] = [] // (data, filename, mimeType)
    private let tableView = UITableView()
    private let sendButton = UIButton(type: .system)
    private let activityIndicator = UIActivityIndicatorView(style: .medium)

    private var serverUrl: String { UserDefaults(suiteName: "group.com.nokta.app")?.string(forKey: "serverUrl") ?? "" }
    private var authToken: String { UserDefaults(suiteName: "group.com.nokta.app")?.string(forKey: "authToken") ?? "" }
    private var userId: String { UserDefaults(suiteName: "group.com.nokta.app")?.string(forKey: "userId") ?? "" }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        loadSharedFiles()
        loadChats()
    }

    private func setupUI() {
        view.backgroundColor = .systemBackground
        navigationItem.leftBarButtonItem = UIBarButtonItem(barButtonSystemItem: .cancel, target: self, action: #selector(cancel))
        title = "Share to Nokta"

        sendButton.setTitle("Send", for: .normal)
        sendButton.isEnabled = false
        sendButton.addTarget(self, action: #selector(send), for: .touchUpInside)
        navigationItem.rightBarButtonItem = UIBarButtonItem(customView: sendButton)

        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        tableView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(tableView)
        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    private func loadSharedFiles() {
        guard let items = extensionContext?.inputItems as? [NSExtensionItem] else { return }
        let group = DispatchGroup()
        for item in items {
            for provider in item.attachments ?? [] {
                for type in [UTType.image, UTType.movie, UTType.data] {
                    if provider.hasItemConformingToTypeIdentifier(type.identifier) {
                        group.enter()
                        provider.loadItem(forTypeIdentifier: type.identifier) { [weak self] item, _ in
                            defer { group.leave() }
                            guard let url = item as? URL, let data = try? Data(contentsOf: url) else { return }
                            let mime = type == .image ? "image/jpeg" : type == .movie ? "video/mp4" : "application/octet-stream"
                            self?.sharedFiles.append((data, url.lastPathComponent, mime))
                        }
                        break
                    }
                }
            }
        }
    }

    private func loadChats() {
        guard !serverUrl.isEmpty, !authToken.isEmpty else { return }
        var request = URLRequest(url: URL(string: "\(serverUrl)/api/collections/chats/records?filter=participants.id='\(userId)'&expand=participants&sort=-last_message_at")!)
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        URLSession.shared.dataTask(with: request) { [weak self] data, _, _ in
            guard let data, let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let items = json["items"] as? [[String: Any]] else { return }
            DispatchQueue.main.async {
                self?.chats = items
                self?.tableView.reloadData()
            }
        }.resume()
    }

    @objc private func cancel() { extensionContext?.completeRequest(returningItems: nil) }

    @objc private func send() {
        guard let chatId = selectedChat, !sharedFiles.isEmpty else { return }
        sendButton.isEnabled = false
        let group = DispatchGroup()
        for (data, filename, mime) in sharedFiles {
            group.enter()
            uploadFile(chatId: chatId, data: data, filename: filename, mimeType: mime) { group.leave() }
        }
        group.notify(queue: .main) { [weak self] in self?.extensionContext?.completeRequest(returningItems: nil) }
    }

    private func uploadFile(chatId: String, data: Data, filename: String, mimeType: String, completion: @escaping () -> Void) {
        let boundary = UUID().uuidString
        var request = URLRequest(url: URL(string: "\(serverUrl)/api/collections/messages/records")!)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")

        var body = Data()
        let type = mimeType.hasPrefix("image") ? "image" : mimeType.hasPrefix("video") ? "video" : "file"
        for (key, value) in ["chat": chatId, "sender": userId, "type": type, "content": filename] {
            body.append("--\(boundary)\r\nContent-Disposition: form-data; name=\"\(key)\"\r\n\r\n\(value)\r\n".data(using: .utf8)!)
        }
        body.append("--\(boundary)\r\nContent-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\nContent-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body

        URLSession.shared.dataTask(with: request) { _, _, _ in completion() }.resume()
    }

    private func chatName(_ chat: [String: Any]) -> String {
        guard let expand = chat["expand"] as? [String: Any],
              let participants = expand["participants"] as? [[String: Any]] else { return "Chat" }
        let others = participants.filter { ($0["id"] as? String) != userId }
        return others.compactMap { $0["name"] as? String }.joined(separator: ", ")
    }
}

extension ShareViewController: UITableViewDelegate, UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int { chats.count }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
        let chat = chats[indexPath.row]
        cell.textLabel?.text = chatName(chat)
        cell.accessoryType = (chat["id"] as? String) == selectedChat ? .checkmark : .none
        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        selectedChat = chats[indexPath.row]["id"] as? String
        sendButton.isEnabled = selectedChat != nil
        tableView.reloadData()
    }
}
