# <countdown-timer>
The countdown-timer component is a simple component that either creates a timer that counts down to zero, or a stopwatch that displays the time that has passed since it was initiated. If used as a timer, it will dispatch a custom 'countdownzero' event when the countdown reaches zero.
The component can be inserted inside any text element to create a visual countdown as part of the text content. Font size and style of the countdown will be derived automatically from the parent element.

## Timer or stopwatch functionality
The component can be used either as a timer or a stopwatch. Set the attribute 'limit' to use it as a timer. By inserting it into a text element, the current time will be displayed.

## Public properties

### `counterCurrentTime`
The current time of the countdown-timer in milliseconds. If in timer mode, the property will return the remaining time of the countdown. If in stopwatch mode, it will return the time that has passed since the stopwatch was started.

## Attributes

### `limit`
By setting the 'limit' attribute, the component will be used as a timer counting down from the limit to zero. The limit is set in milliseconds, so a value of 5000 will make the countdown last for five seconds.

Default value: none (the component will be used as a stopwatch if no limit is set.)

## Events

### `countdownzero`
Dispatched when the timer reaches zero to notify external elements that the countdown has finished. No event is dispatched in stopwatch mode, but the current time can be read at any time from the public counterCurrentTime property.
