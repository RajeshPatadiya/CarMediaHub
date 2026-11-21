import UIKit
import CarPlay

/**
 * Handles the CarPlay Dashboard multi-window widget scene
 * for simultaneous turn-by-turn navigation and playback controls.
 */
class CarPlayDashboardDelegate: UIResponder, CPTemplateApplicationDashboardSceneDelegate {

    var dashboardController: CPDashboardController?

    func templateApplicationDashboardScene(
        _ templateApplicationDashboardScene: CPTemplateApplicationDashboardScene,
        didConnect dashboardController: CPDashboardController,
        to window: UIWindow
    ) {
        self.dashboardController = dashboardController

        let playPauseBtn = CPDashboardButton(
            titleImages: [UIImage(systemName: "playpause.fill") ?? UIImage()],
            subtitle: "Media"
        ) { _ in
            CarPlayVideoEngine.shared.togglePlayPause()
        }

        dashboardController.shortcutButtons = [playPauseBtn]
    }

    func templateApplicationDashboardScene(
        _ templateApplicationDashboardScene: CPTemplateApplicationDashboardScene,
        didDisconnect dashboardController: CPDashboardController,
        to window: UIWindow
    ) {
        self.dashboardController = nil
    }
}
