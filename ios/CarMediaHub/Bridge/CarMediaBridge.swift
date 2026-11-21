import Foundation
import React

/**
 * Objective-C / Swift Bridge exposing the native CarPlay & AVFoundation engine
 * to the React Native JavaScript layer.
 */
@objc(CarMediaBridge)
class CarMediaBridge: NSObject {

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    func playLocalVideo(_ uri: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            if let url = URL(string: uri) {
                CarPlayVideoEngine.shared.loadMedia(url: url, streamType: "local")
                resolve(true)
            } else {
                reject("INVALID_URI", "Malformed URI provided", nil)
            }
        }
    }

    @objc
    func loadStream(_ urlString: String, streamType: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            if let url = URL(string: urlString) {
                CarPlayVideoEngine.shared.loadMedia(url: url, streamType: streamType)
                resolve(true)
            } else {
                reject("INVALID_URL", "Malformed URL provided", nil)
            }
        }
    }

    @objc
    func syncQueue(_ items: NSArray, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(true)
    }

    @objc
    func startNavigation(_ lat: Double, lng: Double, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(true)
    }

    @objc
    func pausePlayback(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            CarPlayVideoEngine.shared.pause()
            resolve(true)
        }
    }

    @objc
    func resumePlayback(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            CarPlayVideoEngine.shared.play()
            resolve(true)
        }
    }

    @objc
    func skipNext(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            CarPlayVideoEngine.shared.skipNext()
            resolve(true)
        }
    }

    @objc
    func skipPrevious(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            CarPlayVideoEngine.shared.skipPrevious()
            resolve(true)
        }
    }

    @objc
    func setVideoResolution(_ height: Double, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            CarPlayVideoEngine.shared.setPreferredResolution(Int(height))
            resolve(true)
        }
    }

    @objc
    func getCarConnectionStatus(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let isConnected = (CarPlaySceneDelegate.shared?.carWindow != nil)
        let dict: [String: Any] = [
            "isCarPlayConnected": isConnected,
            "isAndroidAutoConnected": false
        ]
        resolve(dict)
    }
}
