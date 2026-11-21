import UIKit
import CarPlay
import MapKit

/**
 * Primary CarPlay Scene Delegate managing the vehicle head-unit connection lifecycle.
 * Hosts the root UIWindow (CPWindow) for zero-lag hardware video rendering and MapKit navigation.
 */
class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate, CPMapTemplateDelegate {

    static var shared: CarPlaySceneDelegate?
    var interfaceController: CPInterfaceController?
    var carWindow: CPWindow?

    private var mapTemplate: CPMapTemplate?
    private var isPlaying = true
    private var is1080p = true

    func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didConnect interfaceController: CPInterfaceController,
        to window: CPWindow
    ) {
        CarPlaySceneDelegate.shared = self
        self.interfaceController = interfaceController
        self.carWindow = window

        // Configure the CarPlay UIWindow with our native automotive split controller
        let rootVC = UIViewController()
        rootVC.view.backgroundColor = .black

        // Attach the zero-lag AVPlayerLayer / Metal layer
        CarPlayVideoEngine.shared.attachLayer(to: rootVC.view)
        window.rootViewController = rootVC

        // Build the root CPMapTemplate
        let mapTemplate = CPMapTemplate()
        mapTemplate.mapDelegate = self
        self.mapTemplate = mapTemplate

        // Configure CarPlay interactive control buttons
        let playPauseBtn = CPMapButton { [weak self] _ in
            self?.togglePlayback()
        }
        playPauseBtn.image = UIImage(systemName: isPlaying ? "pause.fill" : "play.fill")

        let resBtn = CPMapButton { [weak self] _ in
            self?.toggleResolution()
        }
        resBtn.image = UIImage(systemName: "tv.fill")

        mapTemplate.mapButtons = [playPauseBtn, resBtn]
        interfaceController.setRootTemplate(mapTemplate, animated: true, completion: nil)
    }

    func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didDisconnectInterfaceController interfaceController: CPInterfaceController
    ) {
        CarPlayVideoEngine.shared.detachLayer()
        self.interfaceController = nil
        self.carWindow = nil
        CarPlaySceneDelegate.shared = nil
    }

    private func togglePlayback() {
        isPlaying = !isPlaying
        if isPlaying {
            CarPlayVideoEngine.shared.play()
        } else {
            CarPlayVideoEngine.shared.pause()
        }
        updateButtons()
    }

    private func toggleResolution() {
        is1080p = !is1080p
        CarPlayVideoEngine.shared.setPreferredResolution(is1080p ? 1080 : 720)
    }

    private func updateButtons() {
        guard let mapTemplate = self.mapTemplate else { return }
        let playPauseBtn = CPMapButton { [weak self] _ in
            self?.togglePlayback()
        }
        playPauseBtn.image = UIImage(systemName: isPlaying ? "pause.fill" : "play.fill")

        let resBtn = CPMapButton { [weak self] _ in
            self?.toggleResolution()
        }
        resBtn.image = UIImage(systemName: "tv.fill")
        mapTemplate.mapButtons = [playPauseBtn, resBtn]
    }
}
