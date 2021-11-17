/**
 * The pwd-memory web component module.
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

/**
 * Define template.
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    :host {
      margin: 0;
      padding: 0;
      top: 0;
    }
    #pwd-app {
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
  <div id="pwd-app">
  </div>
`

/**
 * Define custom element.
 */
customElements.define('pwd-memory',
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

      /* Set up general pwd-app properties */
      this._pwdApp = this.shadowRoot.querySelector('#pwd-app')
      this.name = 'Memory'
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
      this.currentState.InitiateGame(this.gameType)
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
     * Attributes to monitor for changes.
     *
     * @returns {string[]} A string array of attributes to monitor.
     */
    static get observedAttributes () {
      return []
    }

    /**
     * Sets the size of the app, ensuring that the width/height properties and
     * the width/height set in the CSS element are always the same.
     *
     * @param {number} width - The app's width in pixels.
     * @param {number} height - The app's height in pixels.
     */
    SetSize (width, height) {
      this.width = width
      this.height = height
      this._styleSize.textContent = `#pwd-app {
        width: ` + this.width + `px;
        height: ` + this.height + `px;
      }`
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {

    }

    /**
     * Called when observed attribute(s) changes.
     *
     * @param {string} name - The attribute's name.
     * @param {*} oldValue - The old value.
     * @param {*} newValue - The new value.
     */
    attributeChangedCallback (name, oldValue, newValue) {

    }

    /**
     * Called after the element has been removed from the DOM.
     */
    disconnectedCallback () {

    }
  }
)
