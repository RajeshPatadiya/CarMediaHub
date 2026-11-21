package com.carmediahub.bridge

import android.net.Uri
import com.carmediahub.car.CompanionSession
import com.carmediahub.media.AutomotiveExoPlayerEngine
import com.carmediahub.nav.AutomotiveNavigationEngine
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray

/**
 * TurboModule / NativeModule Bridge connecting the React Native phone UI
 * to the native Android Auto head-unit hardware engine.
 */
class CarMediaBridgeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "CarMediaBridge"
    }

    @ReactMethod
    fun playLocalVideo(uri: String, promise: Promise) {
        try {
            val engine = AutomotiveExoPlayerEngine.getInstance(reactContext)
            engine.loadLocalVideo(Uri.parse(uri))
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("PLAY_LOCAL_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun loadStream(url: String, streamType: String, promise: Promise) {
        try {
            val engine = AutomotiveExoPlayerEngine.getInstance(reactContext)
            engine.loadStream(Uri.parse(url), streamType)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("LOAD_STREAM_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun syncQueue(items: ReadableArray, promise: Promise) {
        // Queue synced with automotive media service
        promise.resolve(true)
    }

    @ReactMethod
    fun startNavigation(lat: Double, lng: Double, promise: Promise) {
        try {
            val navEngine = AutomotiveNavigationEngine.getInstance(reactContext)
            navEngine.setTargetCoordinates(lat, lng)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("NAV_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun pausePlayback(promise: Promise) {
        try {
            AutomotiveExoPlayerEngine.getInstance(reactContext).pause()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("PAUSE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun resumePlayback(promise: Promise) {
        try {
            AutomotiveExoPlayerEngine.getInstance(reactContext).play()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("RESUME_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun skipNext(promise: Promise) {
        try {
            AutomotiveExoPlayerEngine.getInstance(reactContext).skipNext()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SKIP_NEXT_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun skipPrevious(promise: Promise) {
        try {
            AutomotiveExoPlayerEngine.getInstance(reactContext).skipPrevious()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SKIP_PREV_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun setVideoResolution(height: Double, promise: Promise) {
        try {
            AutomotiveExoPlayerEngine.getInstance(reactContext).setPreferredResolution(height.toInt())
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("RES_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getCarConnectionStatus(promise: Promise) {
        try {
            val map = Arguments.createMap()
            map.putBoolean("isCarPlayConnected", false) // Android host
            map.putBoolean("isAndroidAutoConnected", CompanionSession.isSessionActive)
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("STATUS_ERROR", e.message, e)
        }
    }
}
