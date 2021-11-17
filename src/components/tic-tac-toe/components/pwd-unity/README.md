# <pwd-unity>
The pwd-unity component takes a Unity WebGL build and displays it as an iframe element within a pwd-app. pwd-unity is intended for being used within the pwd-application component. Instructions on how to install pwd-unity in the main pwd-application can be found in the README.md file of pwd-application.
After installing pwd-unity in pwd-application, you need to follow the instructions below to install a Unity build in pwd-unity. Otherwise, all that will be displayed when opening the application is an empty pwd-window.

## Installing a Unity build in pwd-unity
1. Copy the build into the folder named "game" in the pwd-unity directory.
2. Change the 'name' property of the gameInfo object in game-info.js to the application name you want to display in the pwd-window header.
3. Replace 'img/icon.png' with an icon specific to the Unity build.