package com.carmediahub.media

import android.app.PendingIntent
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.session.LibraryResult
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaSession
import androidx.media3.session.SessionCommand
import androidx.media3.session.SessionResult
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture

/**
 * Media3 MediaLibraryService for Android Auto head-unit media browser
 * and steering wheel controls (Next, Previous, Play/Pause).
 */
class CompanionMediaService : MediaLibraryService() {

    private val TAG = "CompanionMediaService"
    private var mediaLibrarySession: MediaLibrarySession? = null

    override fun onCreate() {
        super.onCreate()
        val sessionActivityIntent = Intent(this, CompanionMediaService::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, sessionActivityIntent, PendingIntent.FLAG_IMMUTABLE
        )

        val player = androidx.media3.exoplayer.ExoPlayer.Builder(applicationContext).build()
        val callback = object : MediaLibrarySession.Callback {
            override fun onCustomCommand(
                session: MediaSession,
                controller: MediaSession.ControllerInfo,
                customCommand: SessionCommand,
                args: Bundle
            ): ListenableFuture<SessionResult> {
                return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
            }

            override fun onGetLibraryRoot(
                session: MediaLibrarySession,
                controller: MediaSession.ControllerInfo,
                params: LibraryParams?
            ): ListenableFuture<LibraryResult<MediaItem>> {
                val rootItem = MediaItem.Builder().setMediaId("ROOT").build()
                return Futures.immediateFuture(LibraryResult.ofItem(rootItem, params))
            }
        }

        mediaLibrarySession = MediaLibrarySession.Builder(this, player, callback)
            .setSessionActivity(pendingIntent)
            .build()
        Log.i(TAG, "CompanionMediaService created.")
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaLibrarySession? {
        return mediaLibrarySession
    }

    override fun onDestroy() {
        mediaLibrarySession?.run {
            player.release()
            release()
            mediaLibrarySession = null
        }
        super.onDestroy()
    }
}
