# <flipping-tile>
The flipping-tile component can be used for any game that requires flippable cards or tiles with different motifs on the front and backside. For example, in a Poker or Memory application.

## Public methods

### `flipTile()`
Calling this method will toggle the state of the flipping-tile by setting or removing the `flipped` attribute.

### `HideAndDeactivate()`
Sets the tile to be both hidden and deactivated.

### `SetSize(width, height)`
Sets the size of the tile, ensuring that the width/height properties and the width/height set in the CSS element are always the same.

## Attributes

### `flipped`
This attribute determines whether the front or backside of the tile is visible. Calling the public method `flipTile()` will toggle the state of the flipping-tile by setting or removing this attribute.

Default value: none (the component will be instantiated with the front facing up.)

### `backsideColor`
Setting this attribute to a color value such as `#FFFF00` or `rgb(255, 255, 0)` will change the color of the card's backside. This attribute currently needs to be set before inserting the flipping-tile into the DOM.

Default value: `yellow`.

### `backsideImage`
Setting this attribute to a color value such as `#FFFF00` or `rgb(255, 255, 0)` will change the color of the card's backside. This attribute currently needs to be set before inserting the flipping-tile into the DOM.

Default value: `lnu-symbol.png`.

## Events

### `tileflip`
Dispatched whenever the tile is flipped by calling the `flipTile()` method. The event includes a string stating which side is now up along with the innerHTML of the element. This is mainly intended for bug tracking - the user will need to add `console.log(event.detail)` to the `tileflip` event listener to print the message to the console.
