package com.nokta.app

import android.Manifest
import android.app.AlertDialog
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.*
import android.widget.EditText
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import android.webkit.JavascriptInterface
import com.google.firebase.messaging.FirebaseMessaging
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class MainActivity : ComponentActivity() {
    inner class NoktalBridge {
        @JavascriptInterface
        fun registerPushToken(authToken: String, userId: String) {
            registerFcmToken(authToken, userId)
        }
    }
    private lateinit var webView: WebView
    private val prefs by lazy { getSharedPreferences("nokta", MODE_PRIVATE) }
    private val permissions = buildList {
        add(Manifest.permission.CAMERA)
        add(Manifest.permission.RECORD_AUDIO)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) add(Manifest.permission.POST_NOTIFICATIONS)
    }.toTypedArray()
    private val requestPermissions = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {}

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        webView = findViewById<WebView>(R.id.webview).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            addJavascriptInterface(NoktalBridge(), "NoktaAndroid")
            webViewClient = WebViewClient()
            webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest) {
                    request.grant(request.resources)
                }
            }
        }
        if (permissions.any { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }) {
            requestPermissions.launch(permissions)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(NotificationChannel("messages", "Messages", NotificationManager.IMPORTANCE_HIGH))
        }
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })
        prefs.getString("serverUrl", null)?.let { webView.loadUrl(it) } ?: promptServerUrl()
    }

    private fun promptServerUrl() {
        val input = EditText(this).apply { hint = "https://"; setText("https://") }
        AlertDialog.Builder(this).setTitle("Enter Nokta server URL").setView(input)
            .setPositiveButton("OK") { _, _ ->
                val url = input.text.toString().trimEnd('/')
                validateAndLoadServer(url)
            }
            .setNegativeButton("Cancel") { _, _ -> finish() }.show()
    }

    private fun validateAndLoadServer(url: String) {
        thread {
            try {
                val conn = URL("$url/api/nokta").openConnection() as HttpURLConnection
                conn.connectTimeout = 5000
                conn.readTimeout = 5000
                val response = conn.inputStream.bufferedReader().readText()
                conn.disconnect()
                if (response.contains("\"app\":\"nokta\"")) {
                    runOnUiThread {
                        prefs.edit().putString("serverUrl", url).apply()
                        webView.loadUrl(url)
                    }
                } else throw Exception("Invalid server")
            } catch (e: Exception) {
                runOnUiThread {
                    AlertDialog.Builder(this).setTitle("Error")
                        .setMessage("Invalid Nokta server. Please check the URL and try again.")
                        .setPositiveButton("OK") { _, _ -> promptServerUrl() }.show()
                }
            }
        }
    }

    private fun registerFcmToken(authToken: String, userId: String) {
        FirebaseMessaging.getInstance().token.addOnSuccessListener { fcmToken ->
            val serverUrl = prefs.getString("serverUrl", null) ?: return@addOnSuccessListener
            thread {
                try {
                    val url = URL("$serverUrl/api/collections/device_tokens/records")
                    val conn = url.openConnection() as HttpURLConnection
                    conn.requestMethod = "POST"
                    conn.setRequestProperty("Content-Type", "application/json")
                    conn.setRequestProperty("Authorization", authToken)
                    conn.doOutput = true
                    conn.outputStream.write("""{"token":"$fcmToken","platform":"android","user":"$userId"}""".toByteArray())
                    val code = conn.responseCode
                    Log.d("Nokta", "FCM token registration: $code")
                    conn.disconnect()
                } catch (e: Exception) {
                    Log.e("Nokta", "Failed to register FCM token", e)
                }
            }
        }
    }
}
