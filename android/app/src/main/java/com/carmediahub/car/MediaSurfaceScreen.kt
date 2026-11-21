package com.carmediahub.car

import android.graphics.Rect
import android.util.Log
import android.view.Surface
import androidx.car.app.AppManager
import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.SurfaceCallback
import androidx.car.app.SurfaceContainer
import androidx.car.app.model.Action
import androidx.car.app.model.ActionStrip
import androidx.car.app.model.Template
import androidx.car.app.navigation.model.NavigationTemplate
import com.carmediahub.R
import com.carmediahub.media.AutomotiveExoPlayerEngine
import com.carmediahub.nav.AutomotiveNavigationEngine

/**
 * Screen that binds the vehicle head-unit projection Surface
 * to hardware-accelerated Media3 ExoPlayer and Map rendering.
 */
class MediaSurfaceScreen(carContext: CarContext) : Screen(carContext), SurfaceCallback {

    private val TAG = "MediaSurfaceScreen"
    private val playerEngine = AutomotiveExoPlayerEngine.getInstance(carContext)
    private val navEngine = AutomotiveNavigationEngine.getInstance(carContext)

    private var activeSurface: Surface? = null
    private var isPlaying = true
    private var isSplitScreen = true
    private var is1080p = true

    init {
        carContext.getCarService(AppManager::class.java).setSurfaceCallback(this)
    }

    override fun onGetTemplate(): Template {
        val actionStripBuilder = ActionStrip.Builder()

        // 1. Play / Pause Action
        val playPauseAction = Action.Builder()
            .setTitle(if (isPlaying) carContext.getString(R.string.action_pause) else carContext.getString(R.string.action_play))
            .setOnClickListener {
                togglePlayPause()
            }
            .build()
        actionStripBuilder.addAction(playPauseAction)

        // 2. Video Source Switcher
        val sourceAction = Action.Builder()
            .setTitle(carContext.getString(R.string.action_source))
            .setOnClickListener {
                playerEngine.cycleVideoSource()
                invalidate()
            }
            .build()
        actionStripBuilder.addAction(sourceAction)

        // 3. Resolution Toggle (720p / 1080p for wireless latency mitigation)
        val resAction = Action.Builder()
            .setTitle(if (is1080p) "1080p HD" else "720p Eco")
            .setOnClickListener {
                is1080p = !is1080p
                playerEngine.setPreferredResolution(if (is1080p) 1080 else 720)
                invalidate()
            }
            .build()
        actionStripBuilder.addAction(resAction)

        // 4. Split-Screen Toggle
        val splitAction = Action.Builder()
            .setTitle(if (isSplitScreen) "Split" else "Full")
            .setOnClickListener {
                isSplitScreen = !isSplitScreen
                invalidate()
            }
            .build()
        actionStripBuilder.addAction(splitAction)

        val navTemplateBuilder = NavigationTemplate.Builder()
            .setActionStrip(actionStripBuilder.build())

        if (isSplitScreen) {
            val routingInfo = navEngine.getRoutingInfo()
            navTemplateBuilder.setNavigationInfo(routingInfo)
        }

        return navTemplateBuilder.build()
    }

    // =========================================================================
    // SurfaceCallback Lifecycle (Head-Unit Hardware Surface)
    // =========================================================================

    override fun onSurfaceAvailable(surfaceContainer: SurfaceContainer) {
        Log.i(TAG, "Head-unit projection Surface acquired: ${surfaceContainer.surface}")
        this.activeSurface = surfaceContainer.surface
        activeSurface?.let { surface ->
            playerEngine.attachSurface(surface)
            navEngine.attachSurface(surface)
        }
    }

    override fun onVisibleAreaChanged(visibleArea: Rect) {
        Log.d(TAG, "Head-unit visible area: $visibleArea")
        playerEngine.updateDisplayBounds(visibleArea)
        navEngine.updateDisplayBounds(visibleArea)
    }

    override fun onStableAreaChanged(stableArea: Rect) {
        Log.d(TAG, "Head-unit stable area: $stableArea")
    }

    override fun onSurfaceDestroyed(surfaceContainer: SurfaceContainer) {
        Log.i(TAG, "Head-unit projection Surface destroyed.")
        playerEngine.detachSurface()
        navEngine.detachSurface()
        this.activeSurface = null
    }

    // =========================================================================
    // Low-Latency Automotive Input Gestures (Rotary & Touch)
    // =========================================================================

    override fun onClick(x: Float, y: Float) {
        Log.d(TAG, "Touch click at ($x, $y)")
        togglePlayPause()
    }

    override fun onScroll(distanceX: Float, distanceY: Float) {
        navEngine.handleMapPan(distanceX, distanceY)
    }

    override fun onFling(velocityX: Float, velocityY: Float) {
        if (kotlin.math.abs(velocityX) > 1000f) {
            if (velocityX > 0) playerEngine.skipPrevious() else playerEngine.skipNext()
        }
    }

    override fun onScale(focusX: Float, focusY: Float, scaleFactor: Float) {
        navEngine.handleMapZoom(scaleFactor)
    }

    private fun togglePlayPause() {
        isPlaying = !isPlaying
        if (isPlaying) playerEngine.play() else playerEngine.pause()
        invalidate()
    }

    fun onDayNightModeChanged(isDarkMode: Boolean) {
        navEngine.setNightMode(isDarkMode)
        invalidate()
    }
}
