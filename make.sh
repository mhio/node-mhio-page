#!/bin/sh

set -ue

rundir=$(cd -P -- "$(dirname -- "$0")" && printf '%s\n' "$(pwd -P)")
canonical="$rundir/$(basename -- "$0")"

if [ -n "${1:-}" ]; then
  cmd=$1
  shift
else
  cmd=build
fi

cd "$rundir"

###

build_test_docker(){
  docker pull selenium/standalone-chrome
  docker pull selenium/standalone-firefox
  cd test/fixture/selenium-stub
  docker build -t dply/selenium-standalone-stub:latest . 
  docker tag dply/selenium-standalone-stub:latest dply/selenium-standalone-stub:chrome
  docker tag dply/selenium-standalone-stub:latest dply/selenium-standalone-stub:firefox
}

run_docker_stop(){
  docker stop dply-selenium-standalone-chrome dply-selenium-standalone-firefox
  docker rm -f dply-selenium-standalone-chrome dply-selenium-standalone-firefox
}


###

run_help(){
  echo "Commands:"
  awk '/  ".*"/{ print "  "substr($1,2,length($1)-3) }' make.sh
}
set +x
case $cmd in
  "build")                  build_test_docker_stub "$@";;
  "build:test")             build_test_docker_stub "$@";;
  "build:test:docker")      build_test_docker_stub "$@";;
  "build:test:docker:stub") build_test_docker_stub "$@";;
  "stop")                   run_docker_stop "$@";; 
  "stop:docker")            run_docker_stop "$@";; 
  "stop:docker:stub")       run_docker_stop "$@";; 
  "watch")                  run_watch "$@";;

  '-h'|'--help'|'h'|'help') run_help;;
  *)                        $cmd "$@";;
esac

