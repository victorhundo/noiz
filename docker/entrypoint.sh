#!/bin/bash
cd /app

npm install
ng serve --host 0.0.0.0 --disable-host-check
tail -f /dev/null
