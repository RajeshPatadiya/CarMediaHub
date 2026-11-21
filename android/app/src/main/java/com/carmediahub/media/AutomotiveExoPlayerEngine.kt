package com.carmediahub.media

import android.content.Context
import android.content.SharedPreferences
import android.graphics.Rect
import android.media.AudioAttributes as AndroidAudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.net.Uri
import android.os.Build
import android.util.Log
import android.view.Surface
import androidx.annotation.OptIn
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.DefaultRenderersFactory
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.mediacodec.MediaCodecSelector
import com.carmediahub.drm.WidevineDrmManager

/**
 * High-performance hardware-accelerated video playback engine
 * powered by AndroidX Media3 ExoPlayer for automotive projection.
 */
@OptIn(UnstableApi::class)
class AutomotiveExoPlayerEngine private constructor(private val context: Context) : Player.Listener {

    private val TAG = "AutomotiveExoPlayerEngine"
    private val PREFS_KEY = "car_media_resume_store"
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_KEY, Context.MODE_PRIVATE)

    private var exoPlayer: ExoPlayer? = null
    private var audioManager: AudioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var audioFocusRequest: AudioFocusRequest? = null
    private var hasAudioFocus = false
    private var currentMediaUri: Uri? = null
    private var surface: Surface? = null

    companion object {
        @Volatile
        private var instance: AutomotiveExoPlayerEngine? = null

        fun getInstance(context: Context): AutomotiveExoPlayerEngine {
            return instance ?: synchronized(this) {
                instance ?: AutomotiveExoPlayerEngine(context.applicationContext).also { instance = it }
            }
        }
    }

    fun getPlayerInstance(): ExoPlayer? {
        return exoPlayer
    }

    init {
        initPlayer()
        initAudioFocus()
    }

    private fun initPlayer() {
        // Hardware-accelerated codecs prioritized via MediaCodec
        val renderersFactory = DefaultRenderersFactory(context).apply {
            setExtensionRendererMode(DefaultRenderersFactory.EXTENSION_RENDERER_MODE_PREFER)
            setMediaCodecSelector(MediaCodecSelector.DEFAULT)
            setEnableDecoderFallback(true)
        }

        // Low-latency LoadControl optimized for automotive projection (tight buffer against wireless lag)
        val loadControl = DefaultLoadControl.Builder()
            .setBufferDurationsMs(
                /* minBufferMs = */ 2500,
                /* maxBufferMs = */ 5000,
                /* bufferForPlaybackMs = */ 1000,
                /* bufferForPlaybackAfterRebufferMs = */ 2000
            )
            .setPrioritizeTimeOverSizeThresholds(true)
            .build()

        val audioAttributes = AudioAttributes.Builder()
            .setUsage(C.USAGE_MEDIA)
            .setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)
            .build()

        val player = ExoPlayer.Builder(context, renderersFactory)
            .setLoadControl(loadControl)
            .setAudioAttributes(audioAttributes, false)
            .build()

        player.addListener(this)
        this.exoPlayer = player
        Log.i(TAG, "Automotive ExoPlayer initialized.")
    }

    fun attachSurface(surface: Surface) {
        this.surface = surface
        exoPlayer?.setVideoSurface(surface)
        Log.i(TAG, "Attached surface to ExoPlayer.")
        if (currentMediaUri == null) {
            loadDefaultSample()
        }
    }

    fun detachSurface() {
        this.surface = null
        exoPlayer?.clearVideoSurface()
        Log.i(TAG, "Detached surface from ExoPlayer.")
    }

    fun updateDisplayBounds(bounds: Rect) {}

    fun loadLocalVideo(uri: Uri) {
        loadMedia(uri, isLocal = true)
    }

    fun loadStream(uri: Uri, streamType: String) {
        when (streamType.lowercase()) {
            "hotstar" -> {
                val testDrmLicense = "https://proxy.uat.widevine.com/proxy?video_id=2015_tears&provider=widevine_test"
                val drmConfig = WidevineDrmManager.createDrmConfiguration(testDrmLicense)
                val mediaItem = MediaItem.Builder()
                    .setUri(uri)
                    .setDrmConfiguration(drmConfig)
                    .build()
                playMediaItem(mediaItem, uri.toString())
            }
            "youtube", "hls" -> {
                val mediaItem = MediaItem.Builder()
                    .setUri(uri)
                    .setMimeType(MimeTypes.APPLICATION_M3U8)
                    .build()
                playMediaItem(mediaItem, uri.toString())
            }
            else -> {
                loadMedia(uri, isLocal = false)
            }
        }
    }

    private fun loadMedia(uri: Uri, isLocal: Boolean) {
        val mediaItem = MediaItem.Builder().setUri(uri).build()
        playMediaItem(mediaItem, uri.toString())
    }

    private fun playMediaItem(mediaItem: MediaItem, uriString: String) {
        saveCurrentPosition()
        currentMediaUri = Uri.parse(uriString)
        val resumePos = prefs.getLong(uriString, 0L)

        exoPlayer?.let { player ->
            player.setMediaItem(mediaItem, resumePos)
            player.prepare()
            requestAudioFocusAndPlay()
        }
    }

    fun play() {
        requestAudioFocusAndPlay()
    }

    fun pause() {
        exoPlayer?.playWhenReady = false
        abandonAudioFocus()
        saveCurrentPosition()
    }

    fun skipNext() {
        val next = (exoPlayer?.currentPosition ?: 0) + 15000
        exoPlayer?.seekTo(next)
    }

    fun skipPrevious() {
        val prev = kotlin.math.max(0L, (exoPlayer?.currentPosition ?: 0) - 15000)
        exoPlayer?.seekTo(prev)
    }

    fun setPreferredResolution(height: Int) {
        exoPlayer?.let { player ->
            val params = player.trackSelectionParameters
                .buildUpon()
                .setMaxVideoSize(if (height == 1080) 1920 else 1280, height)
                .build()
            player.trackSelectionParameters = params
            Log.i(TAG, "Preferred resolution set to ${height}p")
        }
    }

    fun cycleVideoSource() {
        val sampleUri = Uri.parse("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
        loadLocalVideo(sampleUri)
    }

    private fun loadDefaultSample() {
        val sampleUri = Uri.parse("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
        loadLocalVideo(sampleUri)
    }

    // Audio Focus Handling with Automatic Ducking
    private val audioFocusChangeListener = AudioManager.OnAudioFocusChangeListener { focus ->
        when (focus) {
            AudioManager.AUDIOFOCUS_GAIN -> {
                hasAudioFocus = true
                exoPlayer?.volume = 1.0f
                if (exoPlayer?.playWhenReady == false) {
                    exoPlayer?.playWhenReady = true
                }
            }
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> {
                // Navigation instruction speaking - Duck volume to 20%
                Log.d(TAG, "Audio focus duck: volume -> 0.2")
                exoPlayer?.volume = 0.2f
            }
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> {
                // Phone call or emergency alert - Pause
                exoPlayer?.playWhenReady = false
            }
            AudioManager.AUDIOFOCUS_LOSS -> {
                hasAudioFocus = false
                pause()
            }
        }
    }

    private fun initAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val playbackAttrs = AndroidAudioAttributes.Builder()
                .setUsage(AndroidAudioAttributes.USAGE_MEDIA)
                .setContentType(AndroidAudioAttributes.CONTENT_TYPE_MOVIE)
                .build()

            audioFocusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                .setAudioAttributes(playbackAttrs)
                .setAcceptsDelayedFocusGain(true)
                .setOnAudioFocusChangeListener(audioFocusChangeListener)
                .build()
        }
    }

    private fun requestAudioFocusAndPlay() {
        val result = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioFocusRequest?.let { audioManager.requestAudioFocus(it) } ?: AudioManager.AUDIOFOCUS_REQUEST_FAILED
        } else {
            @Suppress("DEPRECATION")
            audioManager.requestAudioFocus(audioFocusChangeListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN)
        }

        if (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
            hasAudioFocus = true
            exoPlayer?.playWhenReady = true
        }
    }

    private fun abandonAudioFocus() {
        if (hasAudioFocus) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                audioFocusRequest?.let { audioManager.abandonAudioFocusRequest(it) }
            } else {
                @Suppress("DEPRECATION")
                audioManager.abandonAudioFocus(audioFocusChangeListener)
            }
            hasAudioFocus = false
        }
    }

    private fun saveCurrentPosition() {
        val uri = currentMediaUri?.toString() ?: return
        val pos = exoPlayer?.currentPosition ?: 0L
        val dur = exoPlayer?.duration ?: 0L
        if (dur > 0 && pos > (dur * 0.95).toLong()) {
            prefs.edit().remove(uri).apply()
        } else {
            prefs.edit().putLong(uri, pos).apply()
        }
    }
}
