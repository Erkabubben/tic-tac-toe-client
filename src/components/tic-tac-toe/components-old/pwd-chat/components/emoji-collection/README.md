# <emoji-collection>
The emoji-collection component displays a collection of emojis inside a div-element, that can be shown or hidden by calling the public ToggleDisplay() method. When the user selects an emoji, a custom 'emoji' event is dispatched with the emoji's hexadecimal reference number as its Detail.

## Adding new emojis
Emojis are stored by their hexadecimal reference numbers in the emojis.js file - add new objects to the emojis-array to create new categories.
The objects in the array consists of two properties: 'name' and 'content'. Name is the name of the category, and content is the hexadecimal codes of the included emojis.

## Public methods

### `ToggleDisplay()`
Used to hide or show the emoji-collection, by applying or removing a display: none CSS rule. Intended to be called from a button 'click' event.

## Events

### `emoji`
Dispatched whenever the user selects an emoji from the collection by clicking it. Contains the emoji's hexadecimal reference number as Detail.
