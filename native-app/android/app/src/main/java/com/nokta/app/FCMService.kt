package com.nokta.app

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class FCMService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        val intent = PendingIntent.getActivity(this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
        nm.notify(System.currentTimeMillis().toInt(), NotificationCompat.Builder(this, "messages")
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(message.notification?.title ?: "Nokta")
            .setContentText(message.notification?.body)
            .setContentIntent(intent)
            .setAutoCancel(true).build())
    }
}
