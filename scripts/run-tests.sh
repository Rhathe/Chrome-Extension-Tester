#!/usr/bin/env bash

set -e

########################################
# Set current directory and undo on exit
########################################

CURRENT_DIR=`dirname $0`
pushd ${CURRENT_DIR}

function reset_current_directory {
  popd
}
trap reset_current_directory EXIT


#################################################
# Unpack arguments
#################################################

XVFB=${1}
TYPE=${2:-all}

########################################
# Run tests
########################################

bash build.sh

# Host the stubs
cd ../test/stubs/
/usr/bin/python ../../scripts/server.py > /dev/null 2>&1 &
SERVER_PID=$!
trap 'kill -9 $SERVER_PID' INT TERM EXIT ERR

cd ../

# Clean up files from server
CURRENT_DIR=`pwd`
trap "rm -rf ${CURRENT_DIR}/stubs/requests" EXIT

if [[ -n $XVFB ]]; then
  export DISPLAY=":1"
fi

if [[ $TYPE =~ (unit|all) ]]; then
  echo 'Running unit tests'
  ../node_modules/karma/bin/karma start karma.conf.js
fi

if [[ $TYPE =~ (integration|all) ]]; then
  echo 'Running mocked integration tests'
  ../node_modules/protractor/bin/protractor protractor.conf --suite integration
fi
