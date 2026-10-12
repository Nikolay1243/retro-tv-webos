#!/bin/sh
# Rooted webOS TV compatibility helper, scoped to com.retro.decades.tv.
DIR=/media/developer/retro-tv-compat
if [ -f "$DIR/daemon.pid" ]; then
  PID=$(cat "$DIR/daemon.pid")
  if [ -r "/proc/$PID/cmdline" ] && tr '\000' ' ' < "/proc/$PID/cmdline" | grep -q "$DIR/daemon.js"; then exit 0; fi
fi
nohup /usr/bin/node "$DIR/daemon.js" >> "$DIR/daemon.log" 2>&1 < /dev/null &
echo $! > "$DIR/daemon.pid"
