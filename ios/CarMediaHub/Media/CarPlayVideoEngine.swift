import AVFoundation
import UIKit

/**
 * Zero-lag video engine for CarPlay external projection.
 * Leverages hardware VideoToolbox decoding via AVPlayer and CALayer/CAMetalLayer.
 */
class CarPlayVideoEngine: NSObject {

    static let shared = CarPlayVideoEngine()

    private var player: AVPlayer?
    private var playerLayer: AVPlayerLayer?
    private var resumeStore: [String: Double] = [:]
    private var currentUrl: URL?
    private var isPlaying = false

    private override init() {
        super.init()
        setupAudioSession()
    }

    private func setupAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playback, mode: .moviePlayback, options: [.duckOthers])
            try audioSession.setActive(true)
        } catch {
            print("[CarPlayVideoEngine] Audio session setup error: \(error)")
        }
    }

    func attachLayer(to view: UIView) {
        let layer = AVPlayerLayer(player: player)
        layer.videoGravity = .resizeAspect
        layer.frame = view.bounds
        view.layer.addSublayer(layer)
        self.playerLayer = layer

        if currentUrl == nil {
            loadDefaultMedia()
        }
    }

    func detachLayer() {
        playerLayer?.removeFromSuperlayer()
        playerLayer = null
    }

    func loadMedia(url: URL, streamType: String = "local") {
        saveCurrentPosition()
        self.currentUrl = url

        let asset = AVURLAsset(url: url)
        let playerItem = AVPlayerItem(asset: asset)
        // Tune buffer for wireless projection (anti-lag 3.0s buffer)
        playerItem.preferredForwardBufferDuration = 3.0

        if player == nil {
            player = AVPlayer(playerItem: playerItem)
            playerLayer?.player = player
        } else {
            player?.replaceCurrentItem(with: playerItem)
        }

        if let savedTime = resumeStore[url.absoluteString] {
            player?.seek(to: CMTime(seconds: savedTime, preferredTimescale: 600))
        }

        play()
    }

    private func loadDefaultMedia() {
        if let sample = URL(string: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4") {
            loadMedia(url: sample)
        }
    }

    func play() {
        player?.play()
        isPlaying = true
    }

    func pause() {
        player?.pause()
        isPlaying = false
        saveCurrentPosition()
    }

    func togglePlayPause() {
        if isPlaying {
            pause()
        } else {
            play()
        }
    }

    func skipNext() {
        guard let current = player?.currentTime() else { return }
        let next = CMTimeAdd(current, CMTime(seconds: 15, preferredTimescale: 600))
        player?.seek(to: next)
    }

    func skipPrevious() {
        guard let current = player?.currentTime() else { return }
        let prev = CMTimeSubtract(current, CMTime(seconds: 15, preferredTimescale: 600))
        player?.seek(to: prev)
    }

    func setPreferredResolution(_ height: Int) {
        player?.currentItem?.preferredMaximumResolution = CGSize(width: height == 1080 ? 1920 : 1280, height: height)
    }

    private func saveCurrentPosition() {
        guard let url = currentUrl, let time = player?.currentTime().seconds else { return }
        resumeStore[url.absoluteString] = time
    }
}
