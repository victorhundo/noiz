#!/bin/bash
cd /app

npm install
ng serve --host 0.0.0.0
tail -f /dev/null
