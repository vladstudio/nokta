package com.nokta.app

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.OpenableColumns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import org.json.JSONArray
import org.json.JSONObject
import java.io.DataOutputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class ShareActivity : ComponentActivity() {
    private val prefs by lazy { getSharedPreferences("nokta", MODE_PRIVATE) }
    private var selectedChat: JSONObject? = null
    private var sharedUris = mutableListOf<Uri>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_share)

        val serverUrl = prefs.getString("serverUrl", null)
        val authToken = prefs.getString("authToken", null)
        if (serverUrl == null || authToken == null) {
            Toast.makeText(this, "Please login to Nokta first", Toast.LENGTH_LONG).show()
            finish(); return
        }

        sharedUris = getSharedUris()
        if (sharedUris.isEmpty()) { finish(); return }

        findViewById<TextView>(R.id.btnCancel).setOnClickListener { finish() }
        findViewById<TextView>(R.id.btnSend).setOnClickListener { sendFiles() }

        loadChats(serverUrl, authToken)
    }

    @Suppress("DEPRECATION")
    private fun getSharedUris(): MutableList<Uri> {
        val uris = mutableListOf<Uri>()
        when (intent?.action) {
            Intent.ACTION_SEND -> {
                val uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
                    intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
                else intent.getParcelableExtra(Intent.EXTRA_STREAM)
                uri?.let { uris.add(it) }
            }
            Intent.ACTION_SEND_MULTIPLE -> {
                val list = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
                    intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM, Uri::class.java)
                else intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM)
                list?.let { uris.addAll(it) }
            }
        }
        return uris
    }

    private fun loadChats(serverUrl: String, authToken: String) {
        val userId = prefs.getString("userId", "") ?: ""
        thread {
            try {
                val url = URL("$serverUrl/api/collections/chats/records?filter=participants.id%3F%3D'$userId'&expand=participants&sort=-last_message_at")
                val conn = (url.openConnection() as HttpURLConnection).apply {
                    setRequestProperty("Authorization", authToken)
                }
                val response = conn.inputStream.bufferedReader().readText()
                conn.disconnect()
                val chats = JSONObject(response).getJSONArray("items")
                runOnUiThread { setupChatList(chats, userId) }
            } catch (e: Exception) {
                runOnUiThread { Toast.makeText(this, "Failed to load chats", Toast.LENGTH_SHORT).show(); finish() }
            }
        }
    }

    private fun setupChatList(chats: JSONArray, userId: String) {
        val chatList = findViewById<RecyclerView>(R.id.chatList)
        val emptyState = findViewById<TextView>(R.id.emptyState)
        if (chats.length() == 0) {
            chatList.visibility = View.GONE
            emptyState.visibility = View.VISIBLE
            return
        }
        chatList.layoutManager = LinearLayoutManager(this)
        chatList.adapter = ChatAdapter(chats, userId) { chat ->
            selectedChat = chat
            findViewById<TextView>(R.id.btnSend).isEnabled = true
            (chatList.adapter as ChatAdapter).notifyDataSetChanged()
        }
    }

    private fun sendFiles() {
        val chat = selectedChat ?: return
        val serverUrl = prefs.getString("serverUrl", null) ?: return
        val authToken = prefs.getString("authToken", null) ?: return
        val userId = prefs.getString("userId", "") ?: ""
        val chatId = chat.getString("id")

        findViewById<TextView>(R.id.btnSend).isEnabled = false
        findViewById<TextView>(R.id.title).text = "Sending..."
        findViewById<ProgressBar>(R.id.progress).visibility = View.VISIBLE

        thread {
            try {
                for (uri in sharedUris) {
                    val mimeType = contentResolver.getType(uri) ?: "*/*"
                    val type = when {
                        mimeType.startsWith("image/") -> "image"
                        mimeType.startsWith("video/") -> "video"
                        else -> "file"
                    }
                    uploadFile(serverUrl, authToken, chatId, userId, uri, type)
                }
                runOnUiThread { Toast.makeText(this, "Sent!", Toast.LENGTH_SHORT).show(); finish() }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this, "Failed to send", Toast.LENGTH_SHORT).show()
                    findViewById<TextView>(R.id.btnSend).isEnabled = true
                    findViewById<ProgressBar>(R.id.progress).visibility = View.GONE
                }
            }
        }
    }

    private fun uploadFile(serverUrl: String, authToken: String, chatId: String, userId: String, uri: Uri, type: String) {
        val boundary = "----NoktaBoundary${System.currentTimeMillis()}"
        val fileName = getFileName(uri)
        val conn = (URL("$serverUrl/api/collections/messages/records").openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            doOutput = true
            setRequestProperty("Authorization", authToken)
            setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
        }
        DataOutputStream(conn.outputStream).use { out ->
            fun field(name: String, value: String) {
                out.writeBytes("--$boundary\r\nContent-Disposition: form-data; name=\"$name\"\r\n\r\n$value\r\n")
            }
            field("chat", chatId)
            field("sender", userId)
            field("type", type)
            field("content", fileName)
            out.writeBytes("--$boundary\r\nContent-Disposition: form-data; name=\"file\"; filename=\"$fileName\"\r\nContent-Type: ${contentResolver.getType(uri)}\r\n\r\n")
            contentResolver.openInputStream(uri)?.copyTo(out)
            out.writeBytes("\r\n--$boundary--\r\n")
        }
        if (conn.responseCode !in 200..299) throw Exception("Upload failed: ${conn.responseCode}")
        conn.disconnect()
    }

    private fun getFileName(uri: Uri): String {
        contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                val idx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (idx >= 0) return cursor.getString(idx)
            }
        }
        return uri.lastPathSegment ?: "file"
    }

    inner class ChatAdapter(
        private val chats: JSONArray,
        private val userId: String,
        private val onSelect: (JSONObject) -> Unit
    ) : RecyclerView.Adapter<ChatAdapter.VH>() {
        inner class VH(v: View) : RecyclerView.ViewHolder(v)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
            VH(LayoutInflater.from(parent.context).inflate(R.layout.item_chat, parent, false))

        override fun getItemCount() = chats.length()

        override fun onBindViewHolder(holder: VH, position: Int) {
            val chat = chats.getJSONObject(position)
            val name = getChatName(chat)
            val isSelected = chat.getString("id") == selectedChat?.getString("id")
            holder.itemView.findViewById<TextView>(R.id.name).text = name
            holder.itemView.findViewById<TextView>(R.id.avatar).text = name.take(1).uppercase()
            holder.itemView.findViewById<ImageView>(R.id.checkmark).visibility = if (isSelected) View.VISIBLE else View.GONE
            holder.itemView.findViewById<View>(R.id.container).isSelected = isSelected
            holder.itemView.setOnClickListener { onSelect(chat) }
        }

        private fun getChatName(chat: JSONObject): String {
            val name = chat.optString("name", "")
            if (name.isNotEmpty()) return name
            val expand = chat.optJSONObject("expand") ?: return "Chat"
            val participants = expand.optJSONArray("participants") ?: return "Chat"
            for (i in 0 until participants.length()) {
                val p = participants.getJSONObject(i)
                if (p.getString("id") != userId) {
                    return p.optString("name", p.optString("email", "Chat"))
                }
            }
            return "Chat"
        }
    }
}
