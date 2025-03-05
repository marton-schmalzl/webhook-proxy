# Development notes

## Constraints & Assumptions

The app is designed to handle multiple endpoints, relaying messages unchanged. It currently only supports POST requests, but can be easily expanded to support other HTTP verbs. Two types of messages are supported: ones that require immediate answers, and ones that do not. Internal errors can't be easily mitigated in case of messages requiring immediate answers other than failing gracefully and making sure it shows up at error log level, so most of the work was focused on messages that do not require immediate answer. For those, a hard coded response is returned, in a real world application a more sophisticated approach might be necessary. After that they are transferred to a message queue, where a configurable number of attempts are made to deliver the message, and then it is dropped. In a real world scenario storing these messages and delivering them once the internal service is back online (for example separating the internal services into distinct queues and only consuming from them when the internal service succeds a health-check, letting undeliverable messages sit in queue), with considerations of potential chrashloops due to overwhelming requsts after restart. The current solution can be easily modify to infinitely requeue failed messages, but that could lead to infinite loops.

With a high number of requests / second, an async solution is preferable, but any other bottleneck can have a great performance impact (i.e. becoming IO bound due to logging). Currently a single app handles putting messages on the queue and consuming them, ideally this would be split in two parts, so recieving messages can continue even if internal relays fall behind temporarily. Doing so would also allow them to be scaled independently.

## Observability

The app uses winston for logging, currently only configured for console output, but can be easily expanded to work well with monitoring soutions like Datadog, Grafana etc. The log levels are set so an "error" level log is only produced, if a request delivery is completely failed (i.e. if an internal request fails, but there are some retries still availeble, only a "warn" level error is logged)

## Configuration

There is currently only a development config included, for actual deployment seperate config files can be created and loaded according to environment variables.
