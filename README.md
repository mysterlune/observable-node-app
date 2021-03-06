#Observable Runtime

This project explores some of the techniques described by Brendan Gregg and Yunong Xiao of Netflix. The main thrust of this project currently is:

* Provide an app that has some bad internal code
* A facility for producing a Flame Graph to help represent bottlenecks in the runtime

So far, the document that follows is largely a scattershot of notes taken from watching [this video](http://techblog.netflix.com/2015/12/debugging-nodejs-in-production.html).

Also, very [useful gist](https://gist.github.com/trevnorris/9616784) on the subject of recording perf events for a Node app.

##Introduction
In development, observable NodeJS application development is pretty easy. Developers can `console` in the development environment and see where errors are happening.

However, when the app is distributed to a cluster or is running parallel alongside hundreds of other instances, tracking the state of the app within the runtime is much more challenging.

Ways of observability in NodeJS runtime

* Logs
* Core Dumps
* REPL
* HTTP API

###Logs
Dump `node-vasync` result to logs.

###Core Dump
GDB dump, examine the heap, feed to DTrace.

###REPL
Write a REPL into your app so you can punch in and observe the runtime logging.

###HTTP API
Build an API into your app that exposes error data -- or any other data you wish to expose to your monitoring.

##Bunyan
`node-bunyan` is a logging utility that provides JSON

Some features of Bunyan:

* fixed logging levels
* extensible streams interface
* custom object support
* DTrace support

Bunyan [demo](https://youtu.be/kKj00HzElbk?t=1028) for observing pathology in running app.

##DTrace
Ported to BSD now, so runs on every MacOSX:

````
$> man dtrace
````

##Restify

Native Bunyan support:

Request Capture Stream: captures all logging records at all levels in array buffer in memory.

When `restify` hits an error, it dumps all the context logs to the error log.

Audit Logs: Logging not only of headers, body, etc., but also request handlers and associated duration of execution.

Scoped Child Loggers: In the context of a given request, a UUID is decorated with each execution throughout the request chain of handlers. So at any point, this is a "trace-id" that can be searched in logs.

## Flame Graphs

This post by [Brendan Gregg](http://www.brendangregg.com/blog/2014-09-17/node-flame-graphs-on-linux.html) helps create flame graphs on Linux systems.

And the killer walkthrough by Yunong [on yunong.io](http://yunong.io/2015/11/23/generating-node-js-flame-graphs). A modified version of the script is below.

````
# Sample CPU stack traces for the specified PID, at 99 Hertz, for 30 seconds:
perf record -F 99 -p `pgrep -n node` -g -- sleep 30

# Grab the FlameGraph utilities
git clone --depth 1 http://github.com/brendangregg/FlameGraph

# The business of running the recorded stack output through the aptly named `script` to
# produce a stack that `FlameGraph` can collapse to a graph
perf script > /src/out.nodestacks01
cd /src/FlameGraph
./stackcollapse-perf.pl < ../out.nodestacks01 | ./flamegraph.pl --colors js > ../out.nodestacks01.svg
````
