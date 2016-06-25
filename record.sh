#!/bin/bash
perf record -F 99 -p `pgrep -n node` -g -- sleep 30

SOURCENAME="out.nodestacks$RANDOM"
SOURCEPATH="/src/$SOURCENAME"

perf script > $SOURCEPATH
cd /src/FlameGraph
./stackcollapse-perf.pl < $SOURCEPATH | ./flamegraph.pl --colors js > "../public/$SOURCENAME.svg"