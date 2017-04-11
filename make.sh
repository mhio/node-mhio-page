#!/bin/sh

set -ue

rundir=$(cd -P -- "$(dirname -- "$0")" && printf '%s\n' "$(pwd -P)")
canonical="$rundir/$(basename -- "$0")"
cd "$rundir"

build_test_docker(){
  cd test/fixture/selenium-stub
  docker build -t dply/selenium-standalone-stub:latest . 
  docker tag dply/selenium-standalone-stub:latest dply/selenium-standalone-stub:chrome
  docker tag dply/selenium-standalone-stub:latest dply/selenium-standalone-stub:firefox
}


build(){
  build_test_docker
}


if [ -n "${1:-}" ]; then
  cmd=$1
  shift
else
  cmd=build
fi

$cmd "$@"

