#!/bin/bash
perf record -F 99 -p `pgrep -n node` -g -- sleep 30
perf script > /src/out.nodestacks01
cd /src/FlameGraph
./stackcollapse-perf.pl < ../out.nodestacks01 | ./flamegraph.pl --colors js > ../out.nodestacks01.svg