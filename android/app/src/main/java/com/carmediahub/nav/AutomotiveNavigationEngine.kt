package com.carmediahub.nav

import android.content.Context
import android.graphics.Rect
import android.util.Log
import android.view.Surface
import androidx.car.app.model.DateTimeWithZone
import androidx.car.app.model.Distance
import androidx.car.app.navigation.model.Destination
import androidx.car.app.navigation.model.Maneuver
import androidx.car.app.navigation.model.Step
import androidx.car.app.navigation.model.TravelEstimate
import androidx.car.app.navigation.model.Trip
import java.util.TimeZone
import java.util.concurrent.TimeUnit

/**
 * Native Turn-by-Turn navigation manager for Android Auto split-screen dashboard.
 */
class AutomotiveNavigationEngine private constructor(private val context: Context) {

    private val TAG = "AutomotiveNavEngine"
    private var surface: Surface? = null
    private var currentZoom = 15.0f
    private var isNightMode = false
    private var targetLat: Double = 37.7749
    private var targetLng: Double = -122.4194
    private var destinationName: String = "Selected Destination"

    companion object {
        @Volatile
        private var instance: AutomotiveNavigationEngine? = null

        fun getInstance(context: Context): AutomotiveNavigationEngine {
            return instance ?: synchronized(this) {
                instance ?: AutomotiveNavigationEngine(context.applicationContext).also { instance = it }
            }
        }
    }

    fun attachSurface(surface: Surface) {
        this.surface = surface
    }

    fun detachSurface() {
        this.surface = null
    }

    fun updateDisplayBounds(bounds: Rect) {}

    fun setTargetCoordinates(lat: Double, lng: Double, name: String = "Destination") {
        this.targetLat = lat
        this.targetLng = lng
        this.destinationName = name
        Log.i(TAG, "Navigation target updated: $destinationName ($lat, $lng)")
    }

    fun handleMapPan(dx: Float, dy: Float) {
        Log.d(TAG, "Map pan: ($dx, $dy)")
    }

    fun handleMapZoom(factor: Float) {
        currentZoom *= factor
    }

    fun setNightMode(night: Boolean) {
        this.isNightMode = night
    }

    fun getRoutingInfo(): androidx.car.app.navigation.model.RoutingInfo {
        val maneuver = Maneuver.Builder(Maneuver.TYPE_TURN_NORMAL_RIGHT).build()
        val step = Step.Builder("Proceed on Grand Avenue")
            .setManeuver(maneuver)
            .build()
        val distanceRemaining = Distance.create(2.4, Distance.UNIT_MILES)
        return androidx.car.app.navigation.model.RoutingInfo.Builder()
            .setCurrentStep(step, distanceRemaining)
            .build()
    }

    fun getCurrentTrip(): Trip? {
        val destination = Destination.Builder()
            .setName(destinationName)
            .setAddress("$targetLat, $targetLng")
            .build()

        val maneuver = Maneuver.Builder(Maneuver.TYPE_TURN_NORMAL_RIGHT).build()
        val step = Step.Builder("Proceed on Grand Avenue")
            .setManeuver(maneuver)
            .build()

        val distanceRemaining = Distance.create(2.4, Distance.UNIT_MILES)
        val arrivalTime = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(8)
        val timeZone = DateTimeWithZone.create(arrivalTime, TimeZone.getDefault())

        val estimate = TravelEstimate.Builder(distanceRemaining, timeZone)
            .setRemainingTimeSeconds(480)
            .build()

        return Trip.Builder()
            .addDestination(destination, estimate)
            .addStep(step, estimate)
            .setCurrentRoad("Grand Avenue")
            .build()
    }
}
