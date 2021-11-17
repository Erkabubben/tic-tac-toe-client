/**
 * The tic-tac-toe web component module.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 1.0.0
 */

import './components/nickname-state/index.js'
import './components/memory-state/index.js'
import './components/message-state/index.js'
import './components/highscore-state/index.js'

const pathToModule = import.meta.url
const imagesPath = new URL('./img/', pathToModule)
const componentsPath = new URL('./components/', pathToModule)

/**
 * Define template.
 */
const template = document.createElement('template')

/* The application uses style inheritance, so any CSS rules defined
   below will be passed to the sub-components. */
template.innerHTML = `
  <style>
    #main {
      background-image: url("` + imagesPath + `mosaic.jpg");
      position: relative;
      display: block;
      overflow: hidden;
    }
    h1, h2 {
      font-family: Verdana;
      text-align: center;
      color: black;
      margin: 16px;
      user-select: none;
    }
    #memory-question, #nickname-state, #memory-message, #memory-highscore {
      border-radius: 32px;
      background-color: #3399FF;
      border: 16px outset #336699;
      padding: 16px;
      width: min-width(480px);
      height: min-content;
    }

    div#alternatives {
      text-align: left;
    }
    button {
      background-color: rgba(0, 0, 0, 0);
      border: 6px outset #333333;
      font-family: Verdana;
      font-size: 1.25em;
      padding: 0.25em;
      margin: 12px;
      box-shadow: 1px 1px 1px black;
    }
    button:active {
      border: 6px outset #333333;
      transform: translate(1px, 1px);
      box-shadow: 0px 0px 0px black;
    }
    button:hover {
      background-color: #999999;
      border-color: #999999;
    }
    :host {
      margin: 0;
      padding: 0;
      top: 0;
    }
    #main {
      position: absolute;
    }
    #nickname-state, #memory-state, #message-state, #highscore-state {
      position: absolute;
      font-family: Verdana;
      padding: 0px;
      width: 100%;
      height: 100%;
      background-image: url("` + imagesPath + `wallpaper.jpg");
    }
    #message-state h2 {
      color: orange;
      text-align: center;
    }
    #highscore-state table {
      font-family: Verdana;
      font-size: 1.25em;
      margin: auto;
      user-select: none;
    }
    p, h1, h2 {
      user-select: none;
    }
  </style>
  <style id="size"></style>
  <div id="main">
  </div>
`

/**
 * Define custom element.
 */
customElements.define('tic-tac-toe',
  /**
   *
   */
  class extends HTMLElement {
    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element and
      // append the template to the shadow root.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

        this._pwdApp = this.shadowRoot.querySelector('#main')
        this.name = 'Tic Tac Toe'
        this._styleSize = this.shadowRoot.querySelector('style#size')
        this.width = 800
        this.height = 600
  
        this.SetSize(this.width, this.height)
  
        /* Set up app-specific properties */
        this.currentState = null
        this.userNickname = ''
        this.totalTime = 0
        this.gameType = ''

        /* Initiates the nickname state */
        this.DisplayNicknameState()
    }

    /**
     * Displays the start screen where the user is asked to input a nickname.
     */
     DisplayNicknameState () {
      /* Resets the user's total time and removes any previously displayed state or message */
      this.totalTime = 0
      if (this.currentState !== null) {
        this._pwdApp.removeChild(this.currentState)
      }
      /* Creates a new nickname screen with inherited CSS style */
      const nicknameState = document.createElement('nickname-state')
      nicknameState.InheritStyle(this.shadowRoot.querySelector('style'))
      nicknameState.setAttribute('nickname', this.userNickname)
      this.currentState = this._pwdApp.appendChild(nicknameState)
      /* Starts the game when a valid nickname has been submitted */
      this.currentState.addEventListener('nicknameSet', (e) => {
        this.userNickname = e.detail.nickname
        this.totalTime = 0
        this.gameType = e.detail.game
        this.DisplayMemoryGameState()
      })
    }

    /**
     * Displays in-game state.
     */
     DisplayMemoryGameState () {
      if (this.currentState !== null) {
        this._pwdApp.removeChild(this.currentState)
      }
      /* Creates a new Memory state with inherited CSS style */
      const memoryState = document.createElement('memory-state')
      memoryState.InheritStyle(this.shadowRoot.querySelector('style'))
      this.currentState = this._pwdApp.appendChild(memoryState)
      this.currentState.StartGameAPIGet(this.gameType)
      this.currentState.addEventListener('allpairsfound', (event) => {
        const message = [
          'Congratulations ' + this.userNickname + '!',
          'You finished the ' + this.gameType + ' difficulty ' + 'with ' + event.detail.mistakes + ' mistakes,',
          'at ' + (event.detail.time * 0.001) + ' seconds.'
        ]
        this.DisplayTimedMessage(message, 3000, (e) => { this.DisplayHighscoreState(event.detail.mistakes, event.detail.time) })
      })
    }

    /**
     * Creates and displays the highscore screen when the player has finished the game.
     *
     * @param {number} mistakes - The number of mismatches the player made during the game.
     * @param {number} time - The time it took for the player to finish the game, in milliseconds.
     */
    DisplayHighscoreState (mistakes, time) {
      this._pwdApp.removeChild(this.currentState)
      /* Create highscore screen */
      const highscoreState = document.createElement('highscore-state')
      highscoreState.setAttribute('name', this.userNickname)
      highscoreState.setAttribute('mistakes', mistakes)
      highscoreState.setAttribute('time', time)
      highscoreState.setAttribute('game', this.gameType)
      highscoreState.InheritStyle(this.shadowRoot.querySelector('style'))
      this.currentState = this._pwdApp.appendChild(highscoreState)
      /* Add event listener that sends the player back to the nickname screen
         after pressing enter or clicking the mouse */
      this.currentState.addEventListener('proceedfromhighscores', () => {
        this.DisplayNicknameState()
      })
    }

    /**
     * Displays a timed message and then calls a function after a set amount of milliseconds.
     *
     * @param {string} message - The message to be displayed.
     * @param {number} time - The time in milliseconds before the function will be called.
     * @param {Function} fn - The function to be called after the message has expired.
     */
    async DisplayTimedMessage (message, time, fn) {
      this._pwdApp.removeChild(this.currentState)
      /* Creates a new message screen with inherited CSS style */
      const messageState = document.createElement('message-state')
      messageState.setAttribute('limit', time)
      messageState.CreateMessageFromStringArray(message)
      messageState.InheritStyle(this.shadowRoot.querySelector('style'))
      this.currentState = this._pwdApp.appendChild(messageState)
      this.currentState.addEventListener('messagetimerzero', fn)
    }

    /**
     * Sets the size of the application, ensuring that the width/height
     * properties and the width/height set in the CSS element are always the same.
     *
     * @param {number} width - The application's width in pixels.
     * @param {number} height - The application's height in pixels.
     */
    SetSize (width, height) {
      this.width = width
      this.height = height
      this._styleSize.textContent =
      `#main {
        width: ` + width + `px;
        height: ` + height + `px;
      }`
    }

    /**
     * Allows for a HTML element to be dragged by the mouse, within the boundaries of
     * the parent element. Modified version of code found at:
     * https://www.w3schools.com/howto/howto_js_draggable.asp.
     *
     * @param {HTMLElement} elmnt - The element that should have drag functionality.
     */
    dragElement (elmnt) {
      let mouseDiffX = 0
      let mouseDiffY = 0
      const applicationWidth = this.width
      const applicationHeight = this.height

      if (elmnt.header != null) {
        // If present, the header is where you move the DIV from:
        elmnt.header.onmousedown = dragMouseDown
      } else {
        // Otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown
      }

      /**
       * Called when initiating the drag motion by clicking the element.
       * Sets up Event Listeners for the elementDrag and closeDragElement functions.
       *
       * @param {event} e - The 'mousedown' event.
       */
      function dragMouseDown (e) {
        e = e || window.event
        e.preventDefault()
        // Get the mouse cursor position at startup:
        mouseDiffX = e.clientX - elmnt.x
        mouseDiffY = e.clientY - elmnt.y
        document.onmouseup = closeDragElement
        // Call a function whenever the cursor moves:
        document.onmousemove = elementDrag
      }

      /**
       * Called whenever the mouse is moved while the element is set to being dragged.
       * The element will change position in relation to the mouse pointer, but will
       * not be moved outside the boundaries of its parent.
       *
       * @param {event} e - The 'mousemove' event.
       */
      function elementDrag (e) {
        e = e || window.event
        e.preventDefault()
        // Adjust to parent boundaries
        let x = e.clientX - mouseDiffX
        let y = e.clientY - mouseDiffY
        if (x + elmnt.width >= applicationWidth) {
          x = applicationWidth - elmnt.width
        }
        if (x < 0) {
          x = 0
        }
        if (y + elmnt.height >= applicationHeight) {
          y = applicationHeight - elmnt.height
        }
        if (y < 0) {
          y = 0
        }
        // Set the element's new position:
        elmnt.SetPosition(x, y)
      }

      /**
       * Removes the registered Event Listeners when the mouse button is released.
       */
      function closeDragElement () {
        // Stop moving when mouse button is released:
        document.onmouseup = null
        document.onmousemove = null
      }
    }

    /**
     * Attributes to monitor for changes.
     *
     * @returns {string[]} A string array of attributes to monitor.
     */
    static get observedAttributes () {
      return ['size']
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {}

    /**
     * Called when observed attribute(s) changes.
     *
     * @param {string} name - The attribute's name.
     * @param {*} oldValue - The old value.
     * @param {*} newValue - The new value.
     */
    attributeChangedCallback (name, oldValue, newValue) {
      if (name === 'size') {
        const xy = newValue.split(',')
        this.SetSize(xy[0], xy[1])
      }
    }

    /**
     * Called after the element has been removed from the DOM.
     */
    disconnectedCallback () {
      /* Clears any remaining event listeners when element is removed from DOM */
      clearInterval(this._clockUpdateInterval)
    }

    /**
     * Run the specified instance property
     * through the class setter.
     *
     * @param {string} prop - The property's name.
     */
    _upgradeProperty (prop) {
      if (Object.hasOwnProperty.call(this, prop)) {
        const value = this[prop]
        delete this[prop]
        this[prop] = value
      }
    }
  }
)
