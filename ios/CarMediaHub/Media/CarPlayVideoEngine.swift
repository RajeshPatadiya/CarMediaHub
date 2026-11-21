import AVFoundation
import UIKit
import MediaPlayer

/**
 * Zero-lag video engine for CarPlay external projection.
 * Leverages hardware VideoToolbox decoding via AVPlayer and CALayer/CAMetalLayer.
 * Integrates real MPNowPlayingInfoCenter and MPRemoteCommandCenter for head-unit controls.
 */
class CarPlayVideoEngine: NSObject {

    static let shared = CarPlayVideoEngine()

    private var player: AVPlayer?
    private var playerLayer: AVPlayerLayer?
    private var resumeStore: [String: Double] = [:]
    private var currentUrl: URL?
    private var currentTitle: String = "CarMediaHub Stream"
    private var isPlaying = false
    var activeQueue: [[String: Any]] = []

    private override init() {
        super.init()
        setupAudioSession()
        setupRemoteCommands()
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

    private func setupRemoteCommands() {
        let commandCenter = MPRemoteCommandCenter.shared()
        commandCenter.playCommand.isEnabled = true
        commandCenter.playCommand.addTarget { [weak self] _ in
            self?.play()
            return .success
        }
        commandCenter.pauseCommand.isEnabled = true
        commandCenter.pauseCommand.addTarget { [weak self] _ in
            self?.pause()
            return .success
        }
        commandCenter.togglePlayPauseCommand.isEnabled = true
        commandCenter.togglePlayPauseCommand.addTarget { [weak self] _ in
            self?.togglePlayPause()
            return .success
        }
        commandCenter.nextTrackCommand.isEnabled = true
        commandCenter.nextTrackCommand.addTarget { [weak self] _ in
            self?.skipNext()
            return .success
        }
        commandCenter.previousTrackCommand.isEnabled = true
        commandCenter.previousTrackCommand.addTarget { [weak self] _ in
            self?.skipPrevious()
            return .success
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
        playerLayer = nil
    }

    func loadMedia(url: URL, title: String = "CarMediaHub Stream", streamType: String = "local") {
        saveCurrentPosition()
        self.currentUrl = url
        self.currentTitle = title

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
        updateNowPlaying()
    }

    private func loadDefaultMedia() {
        if let sample = URL(string: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4") {
            loadMedia(url: sample, title: "Automotive Showcase Video")
        }
    }

    func play() {
        player?.play()
        isPlaying = true
        updateNowPlaying()
    }

    func pause() {
        player?.pause()
        isPlaying = false
        saveCurrentPosition()
        updateNowPlaying()
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
        updateNowPlaying()
    }

    func skipPrevious() {
        guard let current = player?.currentTime() else { return }
        let prev = CMTimeSubtract(current, CMTime(seconds: 15, preferredTimescale: 600))
        player?.seek(to: prev)
        updateNowPlaying()
    }

    func setPreferredResolution(_ height: Int) {
        player?.currentItem?.preferredMaximumResolution = CGSize(width: height == 1080 ? 1920 : 1280, height: height)
    }

    private func updateNowPlaying() {
        var info: [String: Any] = [
            MPMediaItemPropertyTitle: currentTitle,
            MPMediaItemPropertyArtist: "CarMediaHub by Rajesh Patadiya",
            MPNowPlayingInfoPropertyPlaybackRate: isPlaying ? 1.0 : 0.0
        ]
        if let time = player?.currentTime().seconds {
            info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = time
        }
        if let dur = player?.currentItem?.duration.seconds, !dur.isNaN {
            info[MPMediaItemPropertyPlaybackDuration] = dur
        }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }

    private func saveCurrentPosition() {
        guard let url = currentUrl, let time = player?.currentTime().seconds else { return }
        resumeStore[url.absoluteString] = time
    }
}
