#Observable Runtime

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