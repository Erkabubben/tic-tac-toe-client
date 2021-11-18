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
const sfxPath = new URL('./audio/sfx/', pathToModule)
const musicPath = new URL('./audio/music/', pathToModule)

/**
 * Define template.
 */
const template = document.createElement('template')

/* The application uses style inheritance, so any CSS rules defined
   below will be passed to the sub-components. */
template.innerHTML = `
  <style>
    #main {
      background-image: url("${imagesPath}mosaic.jpg");
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
      background-image: url("${imagesPath}wallpaper.jpg");
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
  <div id="sound-effects"></div>
  <div id="music-tracks"></div>
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
        this.wins = 0
        this.losses = 0
        this.ties = 0
        this.score = 0

        const availableSoundEffects = [
          { name: 'confirm-beep-0', file: 'Light Drone Sound (button hover) 3.wav' },
          { name: 'confirm-beep-1', file: 'Light Drone Sound (button hover) 7.wav' },
          { name: 'confirm-beep-2', file: 'Light Drone Sound (button hover) 9.wav' },
          { name: 'confirm-beep-3', file: 'Light Drone Sound (button hover) 11.wav' }
        ]

        const availableMusicTracks = [
          { name: 'main-theme', file: 'Undergrowth (Loopable).mp3', volume: 0.5 },
        ]

        /* Set up audio */
        this.AudioSetup(availableSoundEffects, availableMusicTracks)

        /* Initiates the nickname state */
        this.DisplayNicknameState()
    }

    AudioSetup (availableSoundEffects, availableMusicTracks) {
      // Sets up a custom event listener that will play sounds on messages from sub-components
      this.addEventListener('playSFX', (event) => {
        this.PlaySound('sfx', event)
      })

      this.addEventListener('playMusic', (event) => {
        this.PlaySound('music', event)
      })

      function AddAudioElementsFromAvailableSoundsArray (containerSelector, basePath, array, type) {
        const soundsContainerElement = containerSelector
        array.forEach(element => {
          const newAudioElement = document.createElement('audio')
          newAudioElement.id = element.name
          newAudioElement.textContent = 'Your browser does not support the audio element.'
          if (element.volume) {
            newAudioElement.volume = element.volume
          }
          const newSourceElement = document.createElement('source')
          newSourceElement.setAttribute('src', basePath + element.file)
          newSourceElement.setAttribute('type', type)
          newAudioElement.appendChild(newSourceElement)
          soundsContainerElement.appendChild(newAudioElement)
        })
      }

      AddAudioElementsFromAvailableSoundsArray(
        this.shadowRoot.querySelector('#sound-effects'), sfxPath, availableSoundEffects, 'audio/wav')
      AddAudioElementsFromAvailableSoundsArray(
        this.shadowRoot.querySelector('#music-tracks'), musicPath, availableMusicTracks, 'audio/mp3')
    }

    PlaySound(type, event) {
      const selector = type == 'sfx' ? '#sound-effects audio#' : '#music-tracks audio#'
      const audioElement = this.shadowRoot.querySelector(selector + event.detail.name)
      console.log(event.detail.name)
      if (audioElement != null) {
        audioElement.fastSeek(0)
        audioElement.play()
      }
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
        this.wins = 0
        this.losses = 0
        this.ties = 0
        this.score = 0
        const selectedSoundEffect = this.getRndInteger(0, 4)
        this.dispatchEvent(new window.CustomEvent(
          'playSFX', { detail: { name: 'confirm-beep-' + selectedSoundEffect } }))
        //this.dispatchEvent(new window.CustomEvent(
        //  'playMusic', { detail: { name: 'main-theme' } }))
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
      this.currentState.StartGameAPIGet(
        { gameType: this.gameType, wins: this.wins, losses: this.losses, ties: this.ties } )
      this.currentState.addEventListener('playSFX', (event) => {
        this.PlaySound('sfx', event)
      })
      this.currentState.addEventListener('gameOver', (event) => {
        if (event.detail === 'PLAYER') {
          this.wins++
        } else if (event.detail === 'AI') {
          this.losses++
        } else {
          this.ties++
        }
        this.DisplayMemoryGameState()
        /*const message = [
          'Congratulations ' + this.userNickname + '!',
          'You finished the ' + this.gameType + ' difficulty ' + 'with ' + event.detail.mistakes + ' mistakes,',
          'at ' + (event.detail.time * 0.001) + ' seconds.'
        ]
        this.DisplayTimedMessage(message, 3000, (e) => { this.DisplayHighscoreState(event.detail.mistakes, event.detail.time) })*/
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

    getRndInteger(min, max) {
      return Math.floor(Math.random() * (max - min) ) + min;
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
