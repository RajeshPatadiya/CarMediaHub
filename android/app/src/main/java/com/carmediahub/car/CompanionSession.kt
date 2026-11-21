package com.carmediahub.car

import android.content.Intent
import android.content.res.Configuration
import androidx.car.app.Screen
import androidx.car.app.Session
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner

/**
 * Manages the Android Auto session lifecycle and day/night mode adaptation.
 */
class CompanionSession : Session(), DefaultLifecycleObserver {

    companion object {
        @Volatile
        var isSessionActive: Boolean = false
            private set
    }

    private var currentScreen: MediaSurfaceScreen? = null

    init {
        lifecycle.addObserver(this)
    }

    override fun onCreateScreen(intent: Intent): Screen {
        val screen = MediaSurfaceScreen(carContext)
        this.currentScreen = screen
        return screen
    }

    override fun onCarConfigurationChanged(newConfiguration: Configuration) {
        super.onCarConfigurationChanged(newConfiguration)
        val isDarkMode = (newConfiguration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
        currentScreen?.onDayNightModeChanged(isDarkMode)
    }

    override fun onStart(owner: LifecycleOwner) {
        isSessionActive = true
    }

    override fun onStop(owner: LifecycleOwner) {
        isSessionActive = false
    }

    override fun onDestroy(owner: LifecycleOwner) {
        isSessionActive = false
        currentScreen = null
    }
}
