package com.carmediahub.car

import android.content.Context
import android.graphics.Rect
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.os.SystemClock
import android.util.Log
import android.view.MotionEvent
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
 * Screen rendering live automotive content directly onto the head-unit Surface
 * using an Android VirtualDisplay and Presentation layer.
 * Forwards all head-unit touch events (onClick, onScroll, onFling) as real MotionEvent
 * injections into the projected CarPresentation views.
 */
class MediaSurfaceScreen(carContext: CarContext) : Screen(carContext), SurfaceCallback {

    private val TAG = "MediaSurfaceScreen"
    private val playerEngine = AutomotiveExoPlayerEngine.getInstance(carContext)
    private val navEngine = AutomotiveNavigationEngine.getInstance(carContext)
    private val displayManager = carContext.getSystemService(Context.DISPLAY_SERVICE) as DisplayManager

    private var virtualDisplay: VirtualDisplay? = null
    private var carPresentation: CarPresentation? = null
    private var activeSurface: Surface? = null
    private var isPlaying = true
    private var isSplitScreen = true
    private var is1080p = true

    private var lastTouchX = 400f
    private var lastTouchY = 300f

    companion object {
        @Volatile
        var activePresentation: CarPresentation? = null
            private set
    }

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

        // 2. Video vs Web Mode Switcher
        val sourceAction = Action.Builder()
            .setTitle(carContext.getString(R.string.action_source))
            .setOnClickListener {
                carPresentation?.let { p ->
                    val next = if (p.currentMode == CarPresentation.DisplayMode.VIDEO_PLAYER)
                        CarPresentation.DisplayMode.OTT_WEB_BROWSER
                    else
                        CarPresentation.DisplayMode.VIDEO_PLAYER
                    p.switchToMode(next)
                } ?: playerEngine.cycleVideoSource()
                invalidate()
            }
            .build()
        actionStripBuilder.addAction(sourceAction)

        // 3. Resolution Toggle (720p / 1080p)
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
    // SurfaceCallback Lifecycle & VirtualDisplay Presentation
    // =========================================================================

    override fun onSurfaceAvailable(surfaceContainer: SurfaceContainer) {
        val surface = surfaceContainer.surface ?: return
        val dpi = if (surfaceContainer.dpi > 0) surfaceContainer.dpi else 160
        val width = if (surfaceContainer.width > 0) surfaceContainer.width else 1280
        val height = if (surfaceContainer.height > 0) surfaceContainer.height else 720

        Log.i(TAG, "Head-unit Surface acquired: ${width}x${height} @ ${dpi}dpi. Creating VirtualDisplay.")
        this.activeSurface = surface

        try {
            // Create real Android VirtualDisplay projecting to the vehicle head unit Surface
            val flags = DisplayManager.VIRTUAL_DISPLAY_FLAG_PRESENTATION or DisplayManager.VIRTUAL_DISPLAY_FLAG_PUBLIC
            val vd = displayManager.createVirtualDisplay(
                "CarHeadUnitDisplay",
                width,
                height,
                dpi,
                surface,
                flags
            )
            this.virtualDisplay = vd

            // Create and show real Presentation on the external display
            val presentation = CarPresentation(carContext, vd.display)
            presentation.show()
            this.carPresentation = presentation
            activePresentation = presentation

            // Also attach raw surface to ExoPlayer hardware decoder for fallback
            playerEngine.attachSurface(surface)
            navEngine.attachSurface(surface)

            Log.i(TAG, "CarPresentation successfully attached and visible on external vehicle display.")
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing VirtualDisplay/Presentation: ${e.message}", e)
            playerEngine.attachSurface(surface)
        }
    }

    override fun onVisibleAreaChanged(visibleArea: Rect) {
        Log.d(TAG, "Head-unit visible display area: $visibleArea")
        playerEngine.updateDisplayBounds(visibleArea)
        navEngine.updateDisplayBounds(visibleArea)
    }

    override fun onStableAreaChanged(stableArea: Rect) {
        Log.d(TAG, "Head-unit stable safe area: $stableArea")
    }

    override fun onSurfaceDestroyed(surfaceContainer: SurfaceContainer) {
        Log.i(TAG, "Head-unit Surface destroyed. Tearing down VirtualDisplay and Presentation.")
        try {
            carPresentation?.dismiss()
            carPresentation = null
            activePresentation = null

            virtualDisplay?.release()
            virtualDisplay = null

            playerEngine.detachSurface()
            navEngine.detachSurface()
            this.activeSurface = null
        } catch (e: Exception) {
            Log.e(TAG, "Error releasing Presentation/VirtualDisplay: ${e.message}", e)
        }
    }

    // =========================================================================
    // Touch & Rotary Event Injection into Presentation View Hierarchy
    // =========================================================================

    override fun onClick(x: Float, y: Float) {
        Log.d(TAG, "Injecting Car Touch Click MotionEvent at ($x, $y)")
        lastTouchX = x
        lastTouchY = y

        carPresentation?.let { p ->
            val now = SystemClock.uptimeMillis()
            val downEvent = MotionEvent.obtain(now, now, MotionEvent.ACTION_DOWN, x, y, 0)
            p.dispatchTouchEvent(downEvent)
            downEvent.recycle()

            val upEvent = MotionEvent.obtain(now, now + 50, MotionEvent.ACTION_UP, x, y, 0)
            p.dispatchTouchEvent(upEvent)
            upEvent.recycle()
        } ?: togglePlayPause()
    }

    override fun onScroll(distanceX: Float, distanceY: Float) {
        carPresentation?.let { p ->
            val now = SystemClock.uptimeMillis()
            lastTouchX -= distanceX
            lastTouchY -= distanceY
            val moveEvent = MotionEvent.obtain(now, now, MotionEvent.ACTION_MOVE, lastTouchX, lastTouchY, 0)
            p.dispatchTouchEvent(moveEvent)
            moveEvent.recycle()
        } ?: navEngine.handleMapPan(distanceX, distanceY)
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
