#!/bin/sh

# Start node js server
forever start mock-api/app.js

# Start angular frontend
forever start node_modules/@angular/cli/bin/ng serve
