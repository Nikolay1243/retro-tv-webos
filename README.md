# Retro TV Decades — webOS 0.4.4

A personal launcher for rooted LG webOS TVs, tested on webOS TV 9.2.2. The app opens the original MyRetroTVs sites directly, with an app-scoped compatibility helper that adds TV controls through the TV's existing local web inspector. Video remains hosted by the original providers.

## Credits and original sites

The television experiences, video catalog, original TV artwork and decade sites are created by **[Joey Cato](https://www.joeycato.com/)**. Visit **[MyRetroTVs](https://www.myretrotvs.com/)** for the original project.

- [My50sTV](https://50s.myretrotvs.com/)
- [My60sTV](https://60s.myretrotvs.com/)
- [My70sTV](https://70s.myretrotvs.com/)
- [My80sTV](https://80s.myretrotvs.com/)
- [My90sTV](https://90s.myretrotvs.com/)
- [My00sTV](https://00s.myretrotvs.com/)

This independent webOS launcher adds remote controls, shared settings and a showroom menu. It is not an official MyRetroTVs app and is not affiliated with Joey Cato or LG. Original content continues to load from the original sites and their video providers. Support the creator through the links on MyRetroTVs.

![Showroom menu](https://raw.githubusercontent.com/Nikolay1243/retro-tv-webos/main/docs/showroom-v044.jpg)

## Using the app

- The showroom contains six TVs on two shelves. Select one with the Magic Remote pointer or arrows and OK.
- Remote number keys **5, 6, 7, 8, 9, 0** open the **50s, 60s, 70s, 80s, 90s, 2000s** respectively. Numbers on the remote select decades; the year buttons in settings select individual years.
- Each decade powers on automatically when its catalog and player are ready.
- **TV controls** appears while the pointer is visible. The **red** remote key also opens settings.
- Shared settings include fullscreen surround mode, auto channel switching, sound effects, glow, static overlay, noise level, shuffle and playlist mode. Settings are stored once on the TV and applied to every era.
- Sound effects, glow, shuffle and playlist show On/Off; noise shows Off or its level from 1–4.
- Fullscreen can include the TV surround or show only video. Automatic sizing reads the playing video's intrinsic dimensions and adjusts effect clipping; the manual aspect buttons have been removed.
- Play/Pause and the Play / pause settings button pause the current clip without triggering the site's replay handler.
- Channel-up/down events map to next/previous channel. Physical channel-button availability depends on whether webOS delivers these events to the app; arrow keys also change channels outside settings.
- Back first closes settings if open; otherwise it returns directly to the showroom, including from fullscreen. Back at the showroom exits.
- **Resume watching** opens the last era and clip. **Start app: Showroom / Resume watching** chooses launch behavior. Returning deliberately to the showroom does not immediately resume. A playback position is saved periodically and used when resuming a clip.

## Build and TV installation

Generated IPK packages are excluded from source control. Build from the repository root using the webOS CLI:

```sh
ares-package app -o .
ares-install --device YOUR_TV com.retro.decades.tv_0.4.4_all.ipk
ares-launch --device YOUR_TV com.retro.decades.tv
```

On rooted TVs, installation can also use the developer app installation Luna service over SSH.

The compatibility helper is separate from the IPK. It resides at `/media/developer/retro-tv-compat` on the TV. The existing webOSbrew startup hook `/var/lib/webosbrew/init.d/retro-tv-controls.sh` starts `daemon.js`. This rooted-TV setup and its existing inspector at `127.0.0.1:9998` are required for the added controls. Installing the IPK alone on an ordinary TV does not provide the helper features.

`daemon.js` verifies `PalmSystem.identifier` equals `com.retro.decades.tv` before attaching, permits only local debugger sockets, stores validated settings in `settings.json` atomically, and uses debugger bindings to share settings across origins. It forwards Back from the app's YouTube frames and uses debugger navigation to return reliably from HTTPS to the local showroom. It observes only that app's YouTube frame contexts to read `videoWidth` and `videoHeight`. No video is downloaded by the helper.

## Validation and limits

Hardware checks passed for number-key switching (5 and 6), automatic power-on, shared sound-effects state between 50s and 60s, live 4:3 and 16:9 dimension detection, pause/resume retaining the current clip, the channel-up event mapping, Back closing settings, startup resume restoring the clip, and the showroom layout with its new resume buttons. Physical channel buttons and all key models still need a user check; injected remote events were used for controlled validation. Reboot startup has been configured but not tested with a full reboot.

Picture sizing detects the encoded video dimensions. Black bars baked into the source video cannot be distinguished automatically. The helper depends on the current site shortcut handlers, YouTube event interface and TV inspector; upstream updates can require maintenance. Hiding static decorations reduces their presence but does not guarantee OLED burn-in prevention.

The original site blocks iframe embedding (`X-Frame-Options: SAMEORIGIN`, CSP `frame-ancestors 'self'`). Its content and TV images are attributed to Joey Cato / MyRetroTVs. This is an independent personal launcher; arrange permission before distributing under the original branding.

## Removal

Remove `/var/lib/webosbrew/init.d/retro-tv-controls.sh`, terminate only the Node process recorded in `/media/developer/retro-tv-compat/daemon.pid` after verifying its command line, and remove the helper directory. Relaunch the app to clear injected controls. Keep a copy of `settings.json` if preferences should be retained. App Back handling is configured for the helper.

## References

- https://www.myretrotvs.com/
- https://webostv.developer.lge.com/develop/guides/magic-remote
- https://webostv.developer.lge.com/develop/guides/back-button
- https://webostv.developer.lge.com/develop/guides/system-ui-visibility
- https://developers.google.com/youtube/iframe_api_reference

Version 0.4.4 replaces the placeholder launcher icons with a generated vintage CRT / test-pattern illustration in 80px and 130px sizes.

The showroom toolbar now contains **Resume watching** and **Global settings**. Global settings offers startup, automatic channel changes, shuffle, playlist, fullscreen startup/surround, sound effects, glow, static overlay and noise level. Settings save immediately for every decade. Red opens the menu; arrows/OK operate it; Back closes it without exiting the showroom. Menu updates and Back-to-close were verified on the TV.

Global settings now includes all 15 shared category filters, with On/Off controls and Select all. At least one category must remain selected. Saved choices are applied through the original category checkboxes when a decade is ready. Category availability varies by decade.

Category filters are applied before automatic power-on. Verified the 50s page loaded with the same four categories selected in Global settings. The settings bridge now accepts this app's webOS local origin (`file://com.retro.decades.tv-webos`), so showroom changes persist correctly.

The embedded player helper hides YouTube's central mobile play/pause graphic and desktop bezel animation, preventing a pause image from flashing during channel changes. App Play/Pause remains available.

Launcher icons now use new filenames `icon-retro-tv.png` and `largeIcon-retro-tv.png` to avoid reusing cached placeholder icon paths.

## Installing the compatibility helper

Copy the files from `compat/` into `/media/developer/retro-tv-compat` on the rooted TV. Make `start.sh` executable and run it. If the TV already uses webOSbrew startup hooks, copy `start.sh` to `/var/lib/webosbrew/init.d/retro-tv-controls.sh` and make that file executable as well. The helper requires the TV's existing Node.js runtime and web inspector on localhost port 9998. Settings are created on the TV; do not commit `settings.json`, logs, screenshots from debugger validation, or PID files.

## Artwork attribution

See [ATTRIBUTION.md](ATTRIBUTION.md) for image provenance and third-party credits. No third-party license or redistribution permission is implied by this repository. The original MyRetroTVs artwork remains the original creator's work.

Version 0.4.4 adds evenly spaced showroom wall panels with subtle groove and bevel highlights.

Wall panelling is limited to the shelving display area; the surrounding wall stays plain.
