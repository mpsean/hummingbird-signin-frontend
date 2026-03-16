#!/usr/bin/env sh

set -e

echo 'Cleaning up Jenkins workspace artifacts from legacy preview-based delivery.'

if [ -f .pidfile ]; then
	PID="$(cat .pidfile)"
	if kill -0 "${PID}" 2>/dev/null; then
		kill "${PID}"
	fi
	rm -f .pidfile
fi

docker logout >/dev/null 2>&1 || true
echo 'Cleanup completed.'
