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

TYPE=${1}

########################################
# Build test extension
########################################

rm -rf ../testextension testextension
cp -r ../extension testextension
cp ../test/messagers/* testextension/js/
/usr/bin/python test_manifest.py
mv testextension ../
