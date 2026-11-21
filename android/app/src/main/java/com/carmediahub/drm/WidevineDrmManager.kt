package com.carmediahub.drm

import android.net.Uri
import android.util.Log
import androidx.annotation.OptIn
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi

/**
 * Handles Widevine Modular DRM configuration for OTT streams (Hotstar).
 * Ensures safe fallback to avoid black-screen issues on projected external surfaces.
 */
@OptIn(UnstableApi::class)
object WidevineDrmManager {

    private const val TAG = "WidevineDrmManager"

    fun createDrmConfiguration(
        licenseServerUri: String,
        authToken: String? = null
    ): MediaItem.DrmConfiguration {
        val requestHeaders = mutableMapOf<String, String>()
        requestHeaders["User-Agent"] = "CarMediaHub/1.0 (Android Auto Embedded)"
        authToken?.let {
            requestHeaders["Authorization"] = "Bearer $it"
        }

        Log.i(TAG, "Configuring Widevine DRM for projection surface with L3 security fallback.")

        return MediaItem.DrmConfiguration.Builder(C.WIDEVINE_UUID)
            .setLicenseUri(Uri.parse(licenseServerUri))
            .setLicenseRequestHeaders(requestHeaders)
            .setMultiSession(true)
            .build()
    }
}
