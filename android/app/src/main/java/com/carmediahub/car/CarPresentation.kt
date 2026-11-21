package com.carmediahub.car

import android.app.Presentation
import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.util.Log
import android.view.Display
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.ui.PlayerView
import com.carmediahub.media.AutomotiveExoPlayerEngine

/**
 * Real Android Presentation rendered directly onto the vehicle head-unit VirtualDisplay.
 * Hosts:
 * 1. Hardware PlayerView attached to Media3 ExoPlayer for zero-lag local video playback.
 * 2. CarOttWebView for YouTube, Hotstar, Netflix, Prime Video, Zee5, and custom URL browsing.
 * 3. In-car touch-friendly overlay controls (Back, Forward, Refresh, Source, Resolution).
 */
@OptIn(UnstableApi::class)
class CarPresentation(
    outerContext: Context,
    display: Display
) : Presentation(outerContext, display) {

    private val TAG = "CarPresentation"

    lateinit var rootContainer: FrameLayout
        private set
    lateinit var playerView: PlayerView
        private set
    lateinit var webView: CarOttWebView
        private set
    private lateinit var overlayControlBar: LinearLayout
    private lateinit var statusText: TextView

    enum class DisplayMode {
        VIDEO_PLAYER,
        OTT_WEB_BROWSER
    }

    var currentMode: DisplayMode = DisplayMode.VIDEO_PLAYER
        private set

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window?.addFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED)

        rootContainer = FrameLayout(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.BLACK)
        }

        // 1. Hardware PlayerView for Local & Direct Media
        playerView = PlayerView(context).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            useController = false
            player = AutomotiveExoPlayerEngine.getInstance(context).getPlayerInstance()
        }
        rootContainer.addView(playerView)

        // 2. Hardware CarOttWebView for Web OTT & Custom URLs
        webView = CarOttWebView(context).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            visibility = View.GONE
        }
        rootContainer.addView(webView)

        // 3. Floating In-Car Overlay Control Bar
        buildOverlayControlBar()
        rootContainer.addView(overlayControlBar)

        setContentView(rootContainer)
        Log.i(TAG, "CarPresentation created and initialized on external vehicle display.")
    }

    private fun buildOverlayControlBar() {
        overlayControlBar = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.argb(180, 15, 23, 42))
            setPadding(16, 8, 16, 8)
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM
            )
        }

        // Back Button
        val backBtn = createButton("◀ Back") {
            if (currentMode == DisplayMode.OTT_WEB_BROWSER && webView.canGoBack()) {
                webView.goBack()
            } else {
                switchToMode(DisplayMode.VIDEO_PLAYER)
            }
        }
        overlayControlBar.addView(backBtn)

        // Forward Button
        val fwdBtn = createButton("Forward ▶") {
            if (webView.canGoForward()) webView.goForward()
        }
        overlayControlBar.addView(fwdBtn)

        // Reload Button
        val reloadBtn = createButton("↻ Reload") {
            if (currentMode == DisplayMode.OTT_WEB_BROWSER) webView.reload()
        }
        overlayControlBar.addView(reloadBtn)

        // Source Switcher (Video vs Web)
        val modeBtn = createButton("⚡ Mode") {
            val next = if (currentMode == DisplayMode.VIDEO_PLAYER) DisplayMode.OTT_WEB_BROWSER else DisplayMode.VIDEO_PLAYER
            switchToMode(next)
        }
        overlayControlBar.addView(modeBtn)

        // User-Agent Switcher
        val uaBtn = createButton("🌐 UA") {
            webView.toggleUserAgent()
        }
        overlayControlBar.addView(uaBtn)

        // Status Label
        statusText = TextView(context).apply {
            text = "CarMediaHub by Rajesh Patadiya"
            setTextColor(Color.WHITE)
            textSize = 11f
            typeface = Typeface.DEFAULT_BOLD
            setPadding(16, 0, 0, 0)
        }
        overlayControlBar.addView(statusText)
    }

    private fun createButton(text: String, onClick: () -> Unit): TextView {
        return TextView(context).apply {
            this.text = text
            setTextColor(Color.WHITE)
            textSize = 12f
            typeface = Typeface.DEFAULT_BOLD
            setBackgroundColor(Color.argb(220, 30, 41, 59))
            setPadding(20, 12, 20, 12)
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            lp.setMargins(6, 0, 6, 0)
            layoutParams = lp
            setOnClickListener { onClick() }
        }
    }

    fun switchToMode(mode: DisplayMode) {
        this.currentMode = mode
        if (mode == DisplayMode.VIDEO_PLAYER) {
            playerView.visibility = View.VISIBLE
            webView.visibility = View.GONE
            statusText.text = "Local Video Theater"
        } else {
            playerView.visibility = View.GONE
            webView.visibility = View.VISIBLE
            statusText.text = "OTT Web Browser (${webView.currentUaMode})"
        }
        Log.i(TAG, "Switched car presentation mode to $mode")
    }

    fun loadWebUrl(url: String, uaMode: CarOttWebView.UserAgentMode = CarOttWebView.UserAgentMode.DESKTOP) {
        switchToMode(DisplayMode.OTT_WEB_BROWSER)
        webView.setUserAgent(uaMode)
        webView.loadUrl(url)
        statusText.text = "Streaming: $url"
    }

    fun injectWebControl(action: String) {
        when (action.lowercase()) {
            "back" -> if (webView.canGoBack()) webView.goBack()
            "forward" -> if (webView.canGoForward()) webView.goForward()
            "reload", "refresh" -> webView.reload()
            "desktop" -> webView.setUserAgent(CarOttWebView.UserAgentMode.DESKTOP)
            "mobile" -> webView.setUserAgent(CarOttWebView.UserAgentMode.MOBILE)
            "tv" -> webView.setUserAgent(CarOttWebView.UserAgentMode.ANDROID_TV)
        }
    }
}
