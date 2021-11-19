/**
 * The tic-tac-toe web component module.
 *
 * @author Erik Lindholm <eriklindholm87@hotmail.com>
 * @version 1.0.0
 */

import './components/nickname-state/index.js'
import './components/tic-tac-toe-state/index.js'
import './components/message-state/index.js'
import './components/highscore-state/index.js'

const pathToModule = import.meta.url
const imagesPath = new URL('./img/', pathToModule)
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
      background-image: url("${imagesPath}paper-bg.jpg");
      position: relative;
      display: block;
      overflow: hidden;
    }
    h1, h2 {
      font-family: "Lucida Handwriting", cursive;
      text-align: center;
      color: black;
      margin: 16px;
      user-select: none;
    }
    div#alternatives {
      text-align: left;
    }
    button {
      background-image: url("${imagesPath}square-paper-bg-0.jpg");
      border: 3px outset #999999;
      font-family: "Lucida Handwriting", cursive;
      color: black;
      font-size: 1.25em;
      padding: 0.25em;
      margin: 12px;
      box-shadow: 1px 1px 1px black;
    }
    button:active {
      transform: translate(1px, 1px);
      box-shadow: 0px 0px 0px black;
    }
    button:hover {
      background-color: #999999;
    }
    :host {
      margin: 0;
      padding: 0;
      top: 0;
    }
    #main {
      position: absolute;
    }
    #nickname-state, #tic-tac-toe-state, #message-state, #highscore-state {
      position: absolute;
      font-family: Verdana;
      padding: 0px;
      width: 100%;
      height: 100%;
      background-image: url("${imagesPath}paper-bg.jpg");
    }
    #message-state h2 {
      color: black;
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
    /* Animation code */
    @keyframes note-appear {
      from {
        opacity: 0.5;
        top: -500px;
        transform: translate(-50%, -50%) rotate(45deg)
      }
      to {
        opacity: 1.0;
        top: 50%;
        transform: translate(-50%, -50%) rotate(0deg)
      }
    }
    /* Element to apply animation to */
    .note-appear {
      animation-name: note-appear;
      animation-duration: 0.75s;
      animation-timing-function: ease-out;
    }
    /* Animation code */
    @keyframes note-disappear {
      from {
        opacity: 1.0;
        top: 50%;
        transform: translate(-50%, -50%) rotate(0deg)
      }
      to {
        opacity: 0.5;
        top: 1200px;
        transform: translate(-50%, -50%) rotate(-45deg)
      }
    }
    /* Element to apply animation to */
    .note-disappear {
      animation-name: note-disappear;
      animation-duration: 0.75s;
      animation-timing-function: ease-in;
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

      this._mainApp = this.shadowRoot.querySelector('#main')
      this.name = 'Tic Tac Toe'
      this._styleSize = this.shadowRoot.querySelector('style#size')
      this.width = 1280
      this.height = 720

      this.SetSize(this.width, this.height)

      /* Tic Tac Toe component properties */
      this.currentState = null
      this.userNickname = ''
      this.totalTime = 0
      this.gameType = ''
      this.wins = 0
      this.losses = 0
      this.ties = 0
      this.score = 0
      this.gameRoundsPlayed = 0

      // List of all sound effects and their paths within the 'audio/sfx' folder.
      const availableSoundEffects = [
        { name: 'confirm-beep-0', file: 'Light Drone Sound (button hover) 3.wav' },
        { name: 'confirm-beep-1', file: 'Light Drone Sound (button hover) 7.wav' },
        { name: 'confirm-beep-2', file: 'Light Drone Sound (button hover) 9.wav' },
        { name: 'confirm-beep-3', file: 'Light Drone Sound (button hover) 11.wav' },
        { name: 'win-0', file: 'Win sound 2.wav' },
        { name: 'win-1', file: 'Win sound 3.wav' },
        { name: 'win-2', file: 'Win sound 5.wav' },
        { name: 'win-3', file: 'Win sound 6.wav' },
        { name: 'lose-0', file: 'Debuff Downgrade 13.wav' },
        { name: 'lose-1', file: 'Debuff Downgrade 14.wav' },
        { name: 'lose-2', file: 'Debuff Downgrade 15.wav' },
        { name: 'lose-3', file: 'Debuff Downgrade 16.wav' },
        { name: 'tie', file: 'Error Sound 13.wav' },
        { name: 'all-win', file: 'Win sound 16.wav' },
        { name: 'all-lose', file: 'Lost sound 21.wav', volume: 0.15 }
      ]

      // List of all music tracks and their paths within the 'audio/music' folder.
      const availableMusicTracks = [
        { name: 'main-theme', file: 'Hoping Version 2 (Loopable).mp3', volume: 0.03, loop: true }
      ]

      this._musicIsPlaying = false

      // Set up audio.
      this.AudioSetup(availableSoundEffects, availableMusicTracks)

      /* Initiates the nickname state */
      this.DisplayNicknameState()
    }

    /**
     * Takes the arrays of sound effects and music tracks defined in the constructor
     * and sets up Audio and Source Elements based on their contents. Also sets up
     * Event listeners that allows audio to be played by dispatching the custom Events
     * 'playSFX' and 'playMusic'.
     *
     * @param {Array} availableSoundEffects - Array of sound effect names and file paths.
     * @param {Array} availableMusicTracks - Array of music track names and file paths.
     */
    AudioSetup (availableSoundEffects, availableMusicTracks) {
      // Sets up custom event listeners that will play audio on messages from sub-components.
      this.addEventListener('playSFX', (event) => { this.PlaySound('sfx', event) })
      this.addEventListener('playMusic', (event) => { this.PlaySound('music', event) })

      /**
       * Sets up Audio and Source elements as children of a specified container, based on the
       * contents of an array of sound objects.
       *
       * @param {HTMLElement} containerElement - The container element for the new Audio elements.
       * @param {URL} basePath - Path to the folder where the audio files are stored.
       * @param {Array} array - Array of sound objects.
       * @param {string} type - What to set the 'type' attribute of the Source elements to.
       */
      function AddAudioElementsFromAvailableSoundsArray (containerElement, basePath, array, type) {
        const soundsContainerElement = containerElement
        array.forEach(element => {
          const newAudioElement = document.createElement('audio')
          newAudioElement.id = element.name
          newAudioElement.textContent = 'Your browser does not support the audio element.'
          if (element.volume) {
            newAudioElement.volume = element.volume
          }
          if (element.loop) {
            newAudioElement.loop = element.loop
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

    /**
     * Takes the arrays of sound effects and music tracks defined in the constructor
     * and sets up Audio and Source Elements based on their contents. Also sets up
     * Event listeners that allows audio to be played by dispatching the custom Events
     * 'playSFX' and 'playMusic'.
     *
     * @param {string} type - The type of audio to be played.
     * @param {Array} event - The event containing the details on which sound to play.
     */
    PlaySound (type, event) {
      const selector = type === 'sfx' ? '#sound-effects audio#' : '#music-tracks audio#'
      const audioElement = this.shadowRoot.querySelector(selector + event.detail.name)
      if (audioElement != null) {
        audioElement.fastSeek(0)
        audioElement.play()
      }
    }

    /**
     * Displays the start screen where the user is asked to input a nickname.
     */
    DisplayNicknameState () {
      /* Removes any previously displayed state or message */
      if (this.currentState !== null) {
        this._mainApp.removeChild(this.currentState)
      }
      /* Creates a new nickname screen with inherited CSS style */
      const nicknameState = document.createElement('nickname-state')
      nicknameState.InheritStyle(this.shadowRoot.querySelector('style'))
      nicknameState.setAttribute('nickname', this.userNickname)
      this.currentState = this._mainApp.appendChild(nicknameState)
      /* Starts the game when a valid nickname has been submitted */
      this.currentState.addEventListener('nicknameSet', (e) => {
        this.userNickname = e.detail.nickname
        // Set game type based on which button was pressed.
        this.gameType = Number(e.detail.game)
        // Reset game data.
        this.wins = 0
        this.losses = 0
        this.ties = 0
        this.score = 0
        this.gameRoundsPlayed = 0
        // Play sound effect to confirm game type choice.
        const selectedSoundEffect = this.GetRandomInteger(0, 4)
        this.dispatchEvent(new window.CustomEvent(
          'playSFX', { detail: { name: 'confirm-beep-' + selectedSoundEffect } }))
        if (!this._musicIsPlaying) {
          this.dispatchEvent(new window.CustomEvent(
            'playMusic', { detail: { name: 'main-theme' } }))
          this._musicIsPlaying = true
        }
        this.DisplayTicTacToeState()
      })
    }

    /**
     * Displays in-game state.
     */
    DisplayTicTacToeState () {
      if (this.currentState !== null) {
        this._mainApp.removeChild(this.currentState)
      }
      /* Creates a new Tic Tac Toe state with inherited CSS style */
      const ticTacToeState = document.createElement('tic-tac-toe-state')
      ticTacToeState.InheritStyle(this.shadowRoot.querySelector('style'))
      this.currentState = this._mainApp.appendChild(ticTacToeState)
      // Starts a new game round by passing the current game data to the StartGameAPIGet
      // method of the new Tic Tac Toe state.
      this.currentState.StartGameAPIGet(
        {
          gameType: this.gameType,
          wins: this.wins,
          losses: this.losses,
          ties: this.ties,
          score: this.score,
          gameRoundsPlayed: this.gameRoundsPlayed
        })
      // Adds an event listener for playSFX events to the current state - this is a
      // temporary bug fix.
      this.currentState.addEventListener('playSFX', (event) => {
        this.PlaySound('sfx', event)
      })
      this.currentState.addEventListener('gameOver', (event) => {
        // Updates game data based on the outcome of the last game round.
        if (event.detail === null) {
          this.ties++
        } else if (event.detail === 'PLAYER') {
          this.wins++
        } else if (event.detail === 'AI') {
          this.losses++
        } else {
          this.ties++
        }
        this.UpdateScoreFromWinsAndLosses()
        this.UpdateGameRoundsPlayed()
        if (this.gameRoundsPlayed === this.gameType) {
          this.AllGameRoundsHaveFinished()
        } else {
          // Start a new game round if the previous round wasn't the last.
          this.DisplayTicTacToeState()
        }
      })
    }

    /**
     * Triggered at the end of the last game round. If having played more than just a single game round,
     * the user will first be shown a message and then the highscores of the selected game type.
     */
    AllGameRoundsHaveFinished () {
      if (this.gameType === 1) {
        // If the user has only played a single game round, return immediately to the title screen.
        this.DisplayNicknameState()
      } else {
        let message = null
        if (this.score === this.gameType) {
          // User has won all possible game rounds.
          this.dispatchEvent(new window.CustomEvent('playSFX', { detail: { name: 'all-win' } }))
          message = [
            `Congratulations ${this.userNickname}!\n
            You won all ${this.wins} games!!\n
            That's great!`
          ]
        } else if (this.score > 0) {
          // User has won more game rounds than the AI.
          this.dispatchEvent(new window.CustomEvent('playSFX', { detail: { name: 'all-win' } }))
          message = [
            `Congratulations ${this.userNickname}!\n
            Out of ${this.gameType} games, you won ${this.wins}.`
          ]
        } else if (this.score < 0) {
          // The AI won more game rounds than the user.
          this.dispatchEvent(new window.CustomEvent('playSFX', { detail: { name: 'all-lose' } }))
          message = [
            `Out of ${this.gameType} games, you won ${this.wins}.\n
            Better luck next time!`
          ]
        } else if (this.score === 0) {
          // The result is a tie.
          this.dispatchEvent(new window.CustomEvent('playSFX', { detail: { name: 'tie' } }))
          message = [
            `You ended up with a total score of ${this.score}.\n
            That means it's a tie!`
          ]
        }
        this.DisplayTimedMessage(message, 4000, (e) => { this.DisplayHighscoreState() })
      }
    }

    /**
     * Calculates the player's score based on the total amounts of wins and losses.
     */
    UpdateScoreFromWinsAndLosses () {
      this.score = this.wins + (this.losses * -1)
    }

    /**
     * Updates total amount of game rounds played from the sum of the player's wins, losses and ties.
     */
    UpdateGameRoundsPlayed () {
      this.gameRoundsPlayed = this.wins + this.losses + this.ties
    }

    /**
     * Creates and displays the highscore screen when the player has finished all game rounds.
     */
    DisplayHighscoreState () {
      this._mainApp.removeChild(this.currentState)
      /* Create highscore screen */
      const highscoreState = document.createElement('highscore-state')
      highscoreState.setAttribute('name', this.userNickname)
      highscoreState.setAttribute('score', this.score)
      highscoreState.setAttribute('game', this.gameType)
      highscoreState.InheritStyle(this.shadowRoot.querySelector('style'))
      this.currentState = this._mainApp.appendChild(highscoreState)
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
      this._mainApp.removeChild(this.currentState)
      /* Creates a new message screen with inherited CSS style */
      const messageState = document.createElement('message-state')
      messageState.setAttribute('limit', time)
      messageState.CreateMessageFromStringArray(message)
      messageState.InheritStyle(this.shadowRoot.querySelector('style'))
      this.currentState = this._mainApp.appendChild(messageState)
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
     * Utility function for getting a random integer within a specified range.
     *
     * @param {number} min - The minimum number returned (inclusive).
     * @param {number} max - The maximum number returned (exclusive).
     * @returns {number} - A random number between the min and max values.
     */
    GetRandomInteger (min, max) {
      return Math.floor(Math.random() * (max - min)) + min
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
    disconnectedCallback () {}

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
