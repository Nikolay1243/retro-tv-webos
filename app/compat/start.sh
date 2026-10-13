#!/bin/sh
set -eu
APP=/media/developer/apps/usr/palm/applications/com.retro.decades.tv
DATA=/media/developer/retro-tv-compat
[ "$(id -u)" = 0 ] || { echo 'Rooted Homebrew Channel required' >&2; exit 1; }
mkdir -p "$DATA"
# Replace only this app's previous compatibility process, retaining preferences.
if [ -f "$DATA/daemon.pid" ]; then
  PID=$(cat "$DATA/daemon.pid")
  case "$PID" in ''|*[!0-9]*) ;; *)
    if [ -r "/proc/$PID/cmdline" ]; then
      CMD=$(tr '\000' ' ' < "/proc/$PID/cmdline")
      case "$CMD" in *"$DATA/daemon.js"*|*"$APP/compat/daemon.js"*) kill "$PID" 2>/dev/null || true ;; esac
    fi
  ;; esac
fi
# Older releases started the separately copied helper at boot.
HOOK=/var/lib/webosbrew/init.d/retro-tv-controls.sh
if [ -f "$HOOK" ] && grep -q '/media/developer/retro-tv-compat' "$HOOK"; then rm "$HOOK"; fi
RETRO_DATA_DIR="$DATA" nohup /usr/bin/node "$APP/compat/daemon.js" >> "$DATA/daemon.log" 2>&1 < /dev/null &
PID=$!
echo "$PID" > "$DATA/daemon.pid"
sleep 1
kill -0 "$PID"
echo RETRO_HELPER_STARTED
