# Desktop Environment

Ascend OS simulates a complete windowed operating system environment.

## Window Manager

- **Spawning**: Windows are fixed 600x450, centered with a 30px cascade offset (resets when no windows remain).
- **Cascading**: If multiple windows are opened, they cascade (offset by 30px) to ensure titles are visible.
- **Z-Index**: Clicking or focusing a window brings it to the front, starting from 100.
- **Single-instance**: Core Settings, System Help, and Personalization reuse the existing window instead of opening duplicates.
- **Controls**:
  - **Minimize**: Hides the window to the taskbar.
  - **Close**: Terminates the application instance.
  - **Drag**: Windows can be dragged by their title bar.
  - **Maximize**: Disabled.

## Taskbar

- **Start Menu**: Provides access to installed applications (Ascend OS v1.0.4 build 8821). Right-click a Start Menu entry to pin it to the desktop.
- **Window List**: Shows active windows. Clicking a button focuses or restores the window. Right-click offers Restore/Minimize and Close.
- **System Tray**: Displays ASCEND-NET and a real-time HH:MM clock.

## Desktop Shortcuts

- **Grid System**: Icons snap to a hidden grid (96x112px cells).
- **Context Menu**: Right-click shortcuts to Open or Delete them.
- **Pinning**: Applications can be pinned to the desktop via the Start Menu context menu.

## Personalization

- **Wallpapers**: Users can upload custom images to replace the default animated background void.
- **Storage**: Images are converted to Base64 and stored in the browser's Local Storage.
- **Persistence**: Wallpaper settings persist across reloads and Ascension cycles.
- **Constraints**: File size is limited (approx 3MB) to ensure game state save integrity.

## Notification System

- **Toast Notifications**: Non-intrusive alerts appear in the bottom-right corner.
- **Types**: Info, Success, Warning, and Error.
- **Behavior**: Notifications stack and auto-dismiss after 3 seconds.

## Aesthetics

- **Scanlines**: A CSS-based CRT scanline overlay.
- **Animated Background**: Subtle gradient shifts (`bg-animated`).
- **Font**: Use of 'JetBrains Mono' for terminal/code aesthetics and 'Inter' for UI elements.
