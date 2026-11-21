package com.carmediahub.car

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.util.AttributeSet
import android.util.Log
import android.view.View
import android.webkit.CookieManager
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * Dedicated Hardware-Accelerated WebView for the Car Presentation layer.
 * Supports:
 * - Widevine EME / DRM permissions (PermissionRequest.RESOURCE_PROTECTED_MEDIA_ID)
 * - Persistent CookieManager & WebStorage for login session retention (YouTube, Hotstar, Netflix, Prime Video, Zee5)
 * - Per-site User-Agent toggle (Desktop, Mobile, TV)
 * - HTML5 Fullscreen video hooks
 */
class CarOttWebView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : WebView(context, attrs, defStyleAttr) {

    private val TAG = "CarOttWebView"

    enum class UserAgentMode {
        DESKTOP,
        MOBILE,
        ANDROID_TV
    }

    private val UA_DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    private val UA_MOBILE = "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36"
    private val UA_TV = "Mozilla/5.0 (Linux; Android 12; BRAVIA 4K Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Leanback"

    var currentUaMode: UserAgentMode = UserAgentMode.DESKTOP
        private set

    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null

    init {
        initWebView()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun initWebView() {
        setLayerType(View.LAYER_TYPE_HARDWARE, null)
        isFocusable = true
        isFocusableInTouchMode = true

        val s = settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.databaseEnabled = true
        s.mediaPlaybackRequiresUserGesture = false
        s.allowFileAccess = true
        s.allowContentAccess = true
        s.useWideViewPort = true
        s.loadWithOverviewMode = true
        s.setSupportZoom(true)
        s.builtInZoomControls = true
        s.displayZoomControls = false
        s.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        s.cacheMode = WebSettings.LOAD_DEFAULT

        setUserAgent(UserAgentMode.DESKTOP)

        // Configure persistent CookieManager
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(this, true)
        cookieManager.flush()

        webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                Log.d(TAG, "Page started loading: $url")
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                Log.d(TAG, "Page finished loading: $url")
                CookieManager.getInstance().flush()
            }
        }

        webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                Log.i(TAG, "WebChromeClient onPermissionRequest: ${request.resources.joinToString()}")
                // Auto-grant EME Widevine DRM protected media permission
                request.grant(request.resources)
            }

            override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
                Log.i(TAG, "Entering HTML5 Fullscreen Video Mode on car screen")
                customView = view
                customViewCallback = callback
            }

            override fun onHideCustomView() {
                Log.i(TAG, "Exiting HTML5 Fullscreen Video Mode")
                customViewCallback?.onCustomViewHidden()
                customView = null
                customViewCallback = null
            }
        }
    }

    fun setUserAgent(mode: UserAgentMode) {
        this.currentUaMode = mode
        settings.userAgentString = when (mode) {
            UserAgentMode.DESKTOP -> UA_DESKTOP
            UserAgentMode.MOBILE -> UA_MOBILE
            UserAgentMode.ANDROID_TV -> UA_TV
        }
        Log.i(TAG, "Updated Car WebView User-Agent to $mode")
    }

    fun toggleUserAgent() {
        val next = when (currentUaMode) {
            UserAgentMode.DESKTOP -> UserAgentMode.MOBILE
            UserAgentMode.MOBILE -> UserAgentMode.ANDROID_TV
            UserAgentMode.ANDROID_TV -> UserAgentMode.DESKTOP
        }
        setUserAgent(next)
        reload()
    }
}
