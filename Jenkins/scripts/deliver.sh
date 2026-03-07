#!/usr/bin/env sh

set -e

PREVIEW_PORT="${PREVIEW_PORT:-3000}"

echo 'The following "npm" command builds your Node.js/React application for'
echo 'production in the local "build" directory using Vite, correctly bundles'
echo 'React in production mode and optimizes the build for the best performance.'
set -x
npm run build
set +x

echo 'The following "npm" command serves your production build and makes the'
echo "application available for web browsing on port ${PREVIEW_PORT}."
echo 'The "npm run preview" command has a trailing ampersand so that the command runs'
echo 'as a background process (i.e. asynchronously). Otherwise, this command'
echo 'can pause running builds of CI/CD applications indefinitely. "npm run preview"'
echo 'is followed by another command that retrieves the process ID (PID) value'
echo 'of the previously run process and writes this value to'
echo 'the file ".pidfile".'
set -x
rm -f .pidfile
npm run preview -- --host 0.0.0.0 --port "${PREVIEW_PORT}" --strictPort &
sleep 1
if ! kill -0 "$!" 2>/dev/null; then
	echo "Preview server failed to start. Ensure port ${PREVIEW_PORT} is free." >&2
	exit 1
fi
echo $! > .pidfile
set +x

echo 'Now...'
echo "Visit http://localhost:${PREVIEW_PORT} to see your Node.js/React application in action."
