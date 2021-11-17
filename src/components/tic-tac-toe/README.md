# <pwd-application>
The `pwd-application` component is a single-page application representing a Personal Web Desktop. Similar to the desktop environment of an operating system, a number of sub-applications called `pwd-app` can be run within the main pwd-application. Icons for pwd-apps are displayed in the dock section at the bottom of the application. Clicking an icon will create an instance of the `pwd-window` component an run the pwd-app inside it.
The entire pwd-application can easily be restarted by clicking the reset button in the bottom right corner. Each pwd-app can also be restarted by clicking the reset button in its window header.

## Installing pwd-apps
PWD-apps are easily installed by doing the following:
1. Copy the app's folder into the main application's 'components' folder
2. Update the pwd-app-list.js file to include an import-statement for the pwd-app, as well as adding the pwd-app folder's name to the 'pwdApps' array. This array also determines the order of the pwd-app icons in the dock.

## Public methods

### `SetSize(width, height)`
Just like setting the `size` attribute, calling the `SetSize` method sets the width and height of the component. The `width` and `height` arguments should be in pixels.

## Attributes

### `size`
Sets the width and height of the component, in pixels. The value should be a pair of numbers separated by a comma, as in "800,600" or "800, 600".

Default value: `1280, 800`
