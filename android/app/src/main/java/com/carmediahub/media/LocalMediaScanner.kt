package com.carmediahub.media

import android.content.ContentUris
import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.provider.MediaStore
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

/**
 * Scans real local video files on the device using Android MediaStore.
 * Zero mocks: queries real MP4, MKV, MOV, and WEBM video assets.
 */
object LocalMediaScanner {

    private const val TAG = "LocalMediaScanner"

    data class VideoItem(
        val id: String,
        val title: String,
        val uri: String,
        val durationMs: Long,
        val sizeBytes: Long,
        val mimeType: String,
        val dateAdded: Long
    )

    fun scanVideos(context: Context): List<VideoItem> {
        val videoList = mutableListOf<VideoItem>()
        val collection: Uri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI

        val projection = arrayOf(
            MediaStore.Video.Media._ID,
            MediaStore.Video.Media.TITLE,
            MediaStore.Video.Media.DISPLAY_NAME,
            MediaStore.Video.Media.DURATION,
            MediaStore.Video.Media.SIZE,
            MediaStore.Video.Media.MIME_TYPE,
            MediaStore.Video.Media.DATE_ADDED
        )

        val selection = "${MediaStore.Video.Media.MIME_TYPE} LIKE ? OR ${MediaStore.Video.Media.MIME_TYPE} LIKE ? OR ${MediaStore.Video.Media.MIME_TYPE} LIKE ?"
        val selectionArgs = arrayOf("video/mp4", "video/x-matroska", "video/quicktime")
        val sortOrder = "${MediaStore.Video.Media.DATE_ADDED} DESC"

        try {
            val cursor: Cursor? = context.contentResolver.query(
                collection,
                projection,
                null, // query all video mime types
                null,
                sortOrder
            )

            cursor?.use {
                val idColumn = it.getColumnIndexOrThrow(MediaStore.Video.Media._ID)
                val titleColumn = it.getColumnIndexOrThrow(MediaStore.Video.Media.TITLE)
                val nameColumn = it.getColumnIndexOrThrow(MediaStore.Video.Media.DISPLAY_NAME)
                val durationColumn = it.getColumnIndexOrThrow(MediaStore.Video.Media.DURATION)
                val sizeColumn = it.getColumnIndexOrThrow(MediaStore.Video.Media.SIZE)
                val mimeColumn = it.getColumnIndexOrThrow(MediaStore.Video.Media.MIME_TYPE)
                val dateColumn = it.getColumnIndexOrThrow(MediaStore.Video.Media.DATE_ADDED)

                while (it.moveToNext()) {
                    val id = it.getLong(idColumn)
                    val title = it.getString(titleColumn) ?: it.getString(nameColumn) ?: "Untitled Video"
                    val duration = it.getLong(durationColumn)
                    val size = it.getLong(sizeColumn)
                    val mime = it.getString(mimeColumn) ?: "video/mp4"
                    val dateAdded = it.getLong(dateColumn)

                    val contentUri: Uri = ContentUris.withAppendedId(
                        MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                        id
                    )

                    videoList.add(
                        VideoItem(
                            id = id.toString(),
                            title = title,
                            uri = contentUri.toString(),
                            durationMs = duration,
                            sizeBytes = size,
                            mimeType = mime,
                            dateAdded = dateAdded
                        )
                    )
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error scanning MediaStore videos: ${e.message}", e)
        }

        Log.i(TAG, "Scanned ${videoList.size} real local videos from MediaStore.")
        return videoList
    }

    fun toWritableArray(videos: List<VideoItem>): WritableArray {
        val array = Arguments.createArray()
        for (v in videos) {
            val map: WritableMap = Arguments.createMap()
            map.putString("id", v.id)
            map.putString("title", v.title)
            map.putString("uri", v.uri)
            map.putDouble("duration", v.durationMs.toDouble() / 1000.0)
            map.putDouble("size", v.sizeBytes.toDouble())
            map.putString("mimeType", v.mimeType)
            map.putString("streamType", "local")
            array.pushMap(map)
        }
        return array
    }
}
