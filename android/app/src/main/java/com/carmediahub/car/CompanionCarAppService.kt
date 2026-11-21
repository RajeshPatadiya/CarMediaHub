package com.carmediahub.car

import android.content.pm.ApplicationInfo
import androidx.car.app.CarAppService
import androidx.car.app.Session
import androidx.car.app.validation.HostValidator

/**
 * Android Auto entry service.
 * Supports sideloading on Android Auto Desktop Head Unit (DHU)
 * and vehicles with Developer Mode / Unknown Sources enabled.
 */
class CompanionCarAppService : CarAppService() {

    override fun createHostValidator(): HostValidator {
        // Allow all hosts in debug builds or when testing via DHU / sideloading
        return if ((applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            HostValidator.ALLOW_ALL_HOSTS_VALIDATOR
        } else {
            // Sideloading and OEM host validation
            HostValidator.ALLOW_ALL_HOSTS_VALIDATOR
        }
    }

    override fun onCreateSession(): Session {
        return CompanionSession()
    }
}
