#!/usr/bin/env bash

[ -e dist ] || mkdir dist

npm run js && npm run js-min && npm run css && npm run css-min