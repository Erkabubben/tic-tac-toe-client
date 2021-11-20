/**
 * The tic-tac-toe-state web component module.
 *
 * @author Erik Lindholm <eriklindholm87@hotmail.com>
 * @version 1.0.0
 */
import './components/tic-tac-toe-tile/index.js'
const pathToModule = import.meta.url
const imagesOfParentPath = new URL('../../img/', pathToModule)

/**
 * Define template.
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    #tic-tac-toe-state {
      background-color: white;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    #game-area {
      position: absolute;
      width: 80%;
      height: 100%;
      left: 0px;
      top: 0px;
    }
    @keyframes tiles-area-appear {
      0% {
        opacity: 0.5;
        top: -50%;
        left: -10%;
        transform: rotate(-25deg)
      }
      100% {
        opacity: 1.0;
        top: 50%;
        left: 50%;
        transform: rotate(deg)
      }
    }
    @keyframes tiles-area-disappear {
      0% {
        opacity: 1.0;
        top: 50%;
        left: 50%;
        transform: rotate(deg)
      }
      100% {
        opacity: 0.5;
        top: 120%;
        left: -5%;
        transform: rotate(25deg)
      }
    }
    .tiles-area-appear {
      animation-name: tiles-area-appear;
      animation-duration: 0.5s;
      animation-timing-function: ease-out;
    }
    .tiles-area-disappear {
      animation-name: tiles-area-disappear;
      animation-duration: 0.35s;
      animation-timing-function: ease-in;
    }
    #tiles-area {
      width: max-content;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-image: url("${imagesOfParentPath}square-paper-bg-0.jpg");
    }
    #h-line-0, #h-line-1 {
      position: absolute;
      top: 0px;
      background-color: grey;
      width: 2px;
      height: 100%;
    }
    #h-line-0 {
      left: 33%;
    }
    #h-line-1 {
      right: 33%;
    }
    #v-line-0, #v-line-1 {
      position: absolute;
      left: 0px;
      background-color: grey;
      width: 100%;
      height: 2px;
    }
    #v-line-0 {
      top: 33%;
    }
    #v-line-1 {
      bottom: 33%;
    }
    @keyframes ui-area-appear {
      0% {
        opacity: 0.5;
        top: -500px;
        right: -20%;
        transform: rotate(-25deg)
      }
      100% {
        opacity: 1.0;
        top: 0%;
        right: 0px;
        transform: rotate(0deg)
      }
    }
    @keyframes ui-area-disappear {
      0% {
        opacity: 1.0;
        top: 0%;
        right: 0%;
        transform: rotate(0deg)
      }
      100% {
        opacity: 0.5;
        top: 100%;
        right: -20%;
        transform: rotate(25deg)
      }
    }
    .ui-area-appear {
      animation-name: ui-area-appear;
      animation-duration: 0.5s;
      animation-timing-function: ease-out;
    }
    .ui-area-disappear {
      animation-name: ui-area-disappear;
      animation-duration: 0.35s;
      animation-timing-function: ease-in;
    }
    #ui-area {
      position: absolute;
      background-image: url("${imagesOfParentPath}square-paper-bg-0.jpg");
      width: 20%;
      height: 100%;
      right: 0px;
      top: 0px;
    }
    #ui-area h1 {
      color: black;
      font-size: 1.5rem;
      text-align: center;
    }
  </style>
  <div id="tic-tac-toe-state">
    <div id="game-area">
      <div id="tiles-area">
        <div id="h-line-0"></div>
        <div id="h-line-1"></div>
        <div id="v-line-0"></div>
        <div id="v-line-1"></div>
      </div>
    </div>
    <div id="ui-area">
      <h1 id="gamenumbertext">Game Round:</h1>
      <h1 id="gamenumbercounter"></h1>
      <h1 id="winstext">Wins:</h1>
      <h1 id="winscounter"></h1>
      <h1 id="lossestext">Losses:</h1>
      <h1 id="lossescounter"></h1>
      <h1 id="tiestext">Ties:</h1>
      <h1 id="tiescounter"></h1>
    </div>
  </div>
`

/**
 * Define custom element.
 */
customElements.define('tic-tac-toe-state',
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

      /* State properties */
      this._ticTacToeState = this.shadowRoot.querySelector('#tic-tac-toe-state')
      this._gameArea = this.shadowRoot.querySelector('#game-area')
      this._tilesArea = this.shadowRoot.querySelector('#tiles-area')
      this._uiArea = this.shadowRoot.querySelector('#ui-area')
      this._winsCounter = this.shadowRoot.querySelector('#winscounter')
      this._lossesCounter = this.shadowRoot.querySelector('#lossescounter')
      this._tiesCounter = this.shadowRoot.querySelector('#tiescounter')
      this._gameNumberCounter = this.shadowRoot.querySelector('#gamenumbercounter')

      // Initiate appear animations for tilesArea and uiArea
      this._tilesArea.classList.add('tiles-area-appear')
      this._uiArea.classList.add('ui-area-appear')

      this.tileSize = 160 // Default tile size

      this.playerSymbol = 'o'
      this.opponentSymbol = 'x'
      this._startGameUri = 'http://localhost:8080/games/start'
      this._playerMovePostBaseUri = 'http://localhost:8080/games/'
      this._currentGameID = ''

      // Disables all user input when set to true - used to avoid race conditions caused by
      // user input while animations are playing.
      this._disableAllInput = false

      /* The total amount of tiles, rows and columns at the start of the game  - set from
         the gameType parameter by InitiateGame() */
      this._lineLength = 3
      this._linesAmount = 3
      this._startingTilesAmount = this._lineLength * this._linesAmount

      /* Properties for tracking which tile is currently selected */
      this._selectedTile = 0
      this._selectedTileRow = 0
      this._selectedTileColumn = 0

      /* The ID's of the tiles in the current game */
      this._activeTiles = []

      /* References for easy conversions between tile ID and column/row numbers */
      this._tilesColumnRowToID = {}
      this._tilesIDToColumnRow = {}

      /* Event Listener that will set focus to the previously selected element when
         clicking inside the state */
      this.addEventListener('click', () => { this.UpdateTileSelection() })
    }

    /**
     * Creates a style tag from a given parameter tag and appends it to the shadow DOM.
     * Intended for inheriting CSS styles from a parent element.
     *
     * @param {HTMLElement} styleElement - The style tag to be inherited.
     */
    InheritStyle (styleElement) {
      const style = document.createElement('style')
      style.id = 'inherited'
      style.textContent = styleElement.textContent
      this.shadowRoot.appendChild(style)
    }

    /**
     * Retrieves a new question from the server and parses it to a JSON object, which is then
     * used by DisplayNewQuestion() to create a new question screen.
     *
     * @param {object} gameData - Data on the current game (wins, losses, ties, score etc.).
     */
    async StartGameAPIGet (gameData) {
      try {
        const response = await window.fetch(this._startGameUri)
        const responseJSON = await response.json() // Parse response to JSON object
        this.InitiateGame(gameData, responseJSON)
      // Error handling
      } catch (error) {
        console.log('Error on fetch request!')
      }
    }

    /**
     * Sets up a new game after the element has been created and StartGameAPIGet() has received
     * a response from the API.
     *
     * @param {object} gameData - Data on the current game (wins, losses, ties, score etc.).
     * @param {object} responseJSON - The response to the GET request made by StartGameAPIGet().
     */
    InitiateGame (gameData, responseJSON) {
      // Sets current game ID to the ID in the response JSON.
      this._currentGameID = responseJSON.id

      // Updates counters in UI area based on the contents of the gameData object.
      this._winsCounter.textContent = gameData.wins
      this._lossesCounter.textContent = gameData.losses
      this._tiesCounter.textContent = gameData.ties
      this._gameNumberCounter.textContent = gameData.gameRoundsPlayed + ' / ' + gameData.gameType

      // Creates and adds Tic Tac Toe tiles to tiles area.
      let k = 0
      for (let i = 0; i < this._linesAmount; i++) {
        const newTileLine = document.createElement('div')
        for (let j = 0; j < this._lineLength; j++) {
          const newTile = document.createElement('tic-tac-toe-tile')
          newTile.SetSize(this.tileSize, this.tileSize)
          newTile.setAttribute('tabindex', '-1')
          newTile.setState('')
          newTile.row = i
          newTile.column = j
          newTile.tileID = k
          newTile.addEventListener('click', event => { this.OnClickTile(newTile, event) })
          newTileLine.appendChild(newTile)
          this._activeTiles.push(newTile)
          this._tilesColumnRowToID[j + ',' + i] = k
          this._tilesIDToColumnRow[k] = j + ',' + i
          k++
        }
        this._tilesArea.appendChild(newTileLine)
      }

      this.UpdateTileSelection()

      /**
       * Function to be called whenever a key on the keyboard is pressed.
       *
       * @param {event} event - The 'keydown' event.
       */
      this.keyDownFunction = (event) => {
        // Return without doing anything if input is not enabled.
        if (this._disableAllInput) {
          return
        }

        if (event.keyCode === 39 || event.keyCode === 68) { // Right arrowkey
          event.preventDefault()
          this._selectedTileColumn = (this._selectedTileColumn + 1) % this._lineLength
        } else if (event.keyCode === 37 || event.keyCode === 65) { // Left arrowkey
          event.preventDefault()
          this._selectedTileColumn = (this._selectedTileColumn - 1)
          if (this._selectedTileColumn < 0) {
            this._selectedTileColumn = this._lineLength - 1
          }
        } else if (event.keyCode === 40 || event.keyCode === 83) { // Down arrowkey
          event.preventDefault()
          this._selectedTileRow = (this._selectedTileRow + 1) % this._linesAmount
        } else if (event.keyCode === 38 || event.keyCode === 87) { // Up arrowkey
          event.preventDefault()
          this._selectedTileRow = (this._selectedTileRow - 1)
          if (this._selectedTileRow < 0) {
            this._selectedTileRow = this._linesAmount - 1
          }
        }

        this._selectedTile = this._tilesColumnRowToID[this._selectedTileColumn + ',' + this._selectedTileRow]
        this.UpdateTileSelection()
        if (event.keyCode === 13) {
          this.OnEnterTile(event)
        }
        this.removeEventListener('keydown', this.keyDownFunction)
      }

      /**
       * Function to be called whenever a key on the keyboard is released.
       *
       * @param {event} event - The 'keyup' event.
       */
      this.keyUpFunction = (event) => {
        this.addEventListener('keydown', this.keyDownFunction)
      }

      /* Sets up initial keyboard event listeners */
      this.addEventListener('keydown', this.keyDownFunction)
      this.addEventListener('keyup', this.keyUpFunction)
    }

    /**
     * Code executed when the player clicks a tile with button 0.
     *
     * @param {HTMLElement} clickedTile - The tile clicked by the player.
     * @param {Event} event - The 'onclick' event triggered by the click.
     */
    async OnClickTile (clickedTile, event) {
      // Check that input is allowed and that the player has clicked with the primary mouse button.
      if (!this._disableAllInput && event.button === 0) {
        this._selectedTileColumn = clickedTile.column
        this._selectedTileRow = clickedTile.row
        this._selectedTile = clickedTile.tileID
        this.UpdateTileSelection()
        const tile = this._activeTiles[this._selectedTile]
        await this.SetSelectedTileToPlayerSymbol(tile)
      }
    }

    /**
     * Code executed when the player has selected a tile and pressed Enter.
     *
     * @param {Event} event - The 'keydown' event triggered by the Enter press.
     */
    async OnEnterTile (event) {
      event.preventDefault()
      this.UpdateTileSelection()
      const tile = this._activeTiles[this._selectedTile]
      await this.SetSelectedTileToPlayerSymbol(tile)
    }

    /**
     * Checks that the specified tile is unoccupied and if so, sets it it to display the player
     * symbol and then calls PlayerMoveAPIPost().
     *
     * @param {HTMLElement} tile - The tile selected by the player.
     */
    async SetSelectedTileToPlayerSymbol (tile) {
      if (tile.getAttribute('state') !== this.playerSymbol &&
        tile.getAttribute('state') !== this.opponentSymbol) {
        this._disableAllInput = true
        this.PlaySoundEffect('confirm-beep', 0, 4)
        tile.setState(this.playerSymbol)
        await this.AwaitAnimationEnd(tile.currentSymbolImg)
        await this.PlayerMoveAPIPost(this._selectedTile)
      }
    }

    /**
     * Plays a sound effect by dispatching a playSFX Event. If variantMin and variantMaxExclusive
     * parameters are included, a sound effect variant will be picked from the specified range.
     * For example, only passing 'confirm-choice' will play the sound effect confirm-choice.
     * Passing 'confirm-choice', 0, 2 will play one of the sound sound effects 'confirm-choice-0',
     * or 'confirm-choice-1'.
     *
     * @param {string} sfxName - The name of the sound effect to be played.
     * @param {number} variantMin - Lowest number for the range of variants.
     * @param {number} variantMaxExclusive - Highest number for the range of variants (exclusive).
     */
    PlaySoundEffect (sfxName, variantMin, variantMaxExclusive) {
      if (variantMin == null) {
        this.dispatchEvent(new window.CustomEvent('playSFX', { detail: { name: sfxName } }))
      } else {
        const selectedSoundEffect = this.GetRandomInteger(variantMin, variantMaxExclusive)
        this.dispatchEvent(new window.CustomEvent(
          'playSFX', { detail: { name: sfxName + '-' + selectedSoundEffect } }))
      }
    }

    /**
     * Makes a POST request to the API with the position of the player's move. If the player's
     * move is followed by an AI move, tiles will be updated to represent the new state of the
     * board. Also checks if the game round is over, and if so, proceeds to the next state.
     *
     * @param {number} move - The tile ID of the player's move.
     */
    async PlayerMoveAPIPost (move) {
      try {
        const moveJSONstringified = await JSON.stringify({ position: move })
        const response = await window.fetch(this._playerMovePostBaseUri + this._currentGameID, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: moveJSONstringified
        })
        const responseJSON = await response.json() // Parse response to JSON object
        const lastMove = this.GetLastMove(responseJSON)
        // If the last move in the response is an AI move, update tile and await animation
        // before proceeding.
        if (lastMove.player === 'AI') {
          const opponentResponseTile = this._activeTiles[lastMove.position]
          opponentResponseTile.setState(this.opponentSymbol)
          await this.AwaitAnimationEnd(opponentResponseTile.currentSymbolImg)
        }
        // Check if game is over.
        if (responseJSON.gameOver) {
          await this.OnGameOver(responseJSON)
        } else {
          this._disableAllInput = false
        }
      // Error handling
      } catch (error) {
        console.log('Error on fetch request!')
      }
    }

    /**
     * Code to be triggered on game over.
     *
     * @param {object} json - A JSON response from the API.
     */
    async OnGameOver (json) {
      this._disableAllInput = true
      if (json.winner != null) {
        if (json.winner === 'PLAYER') {
          this.PlaySoundEffect('win', 0, 4)
        } else if (json.winner === 'AI') {
          this.PlaySoundEffect('lose', 0, 4)
        }
        const winnerTiles = this.GetWinnerTiles(json)
        if (winnerTiles != null) {
          winnerTiles.forEach(tileID => {
            this._activeTiles[tileID].startWinnerAnimation()
          })
          await this.AwaitAnimationEnd(this._activeTiles[winnerTiles[0]].currentSymbolImg)
        }
      } else {
        // Just play sound effect and wait if game is a tie.
        this.PlaySoundEffect('tie')
        await this.Delay(2000)
      }
      this._tilesArea.classList.remove('tiles-area-appear')
      this._uiArea.classList.remove('ui-area-appear')
      this._tilesArea.classList.add('tiles-area-disappear')
      this._uiArea.classList.add('ui-area-disappear')
      await this.AwaitAnimationEnd(this._tilesArea)
      this._disableAllInput = false
      this.dispatchEvent(new window.CustomEvent('gameOver', { detail: json.winner }))
    }

    /**
     * Used with 'await' to temporarily yield the execution of an asynchronous function.
     *
     * @param {number} ms - The delay in milliseconds.
     * @returns {Promise} - A promise that resolves after the given amount of millisecond.
     */
    Delay (ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    /**
     * Checks the board data in a JSON response from the API and determines which three
     * tiles are three in a row.
     *
     * @param {object} json - A JSON response from the API.
     * @returns {Array} - The ID's of the winner tiles.
     */
    GetWinnerTiles (json) {
      const board = json.board
      const possibleWins = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ]

      for (let i = 0; i < possibleWins.length; i++) {
        const tilesArray = possibleWins[i]
        if (board[tilesArray[0].toString()] !== null &&
          board[tilesArray[1].toString()] === board[tilesArray[0].toString()] &&
          board[tilesArray[2].toString()] === board[tilesArray[0].toString()]) {
          return tilesArray
        }
      }

      return null
    }

    /**
     * Gets the last move from the moves list of a JSON response from the API.
     *
     * @param {object} json - A JSON response from the API.
     * @returns {object} - The last element in the response's moves list.
     */
    GetLastMove (json) {
      return json.moves[json.moves.length - 1]
    }

    /**
     * Sets up an Event listener listening for a HTMLElement's CSS animation to end.
     * Used with 'await' to yield an asynchronous function until an animation has finished.
     *
     * @param {HTMLElement} element - The animated element
     * @returns {Promise} - A promise that resolves when the element's animation has finished.
     */
    async AwaitAnimationEnd (element) {
      return new Promise(function (resolve, reject) {
        element.addEventListener('animationend', () => { resolve() })
      })
    }

    /**
     * Updates the 'part' attribute of each tile, so that only the tile whose tileID
     * is equal to the _selectedTile property will be displayed as selected.
     */
    UpdateTileSelection () {
      for (let i = 0; i < this._activeTiles.length; i++) {
        const tile = this._activeTiles[i]
        if (tile.tileID === this._selectedTile) {
          tile._div.focus()
        }
      }
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
      return ['nickname']
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
    attributeChangedCallback (name, oldValue, newValue) {}

    /**
     * Called after the element has been removed from the DOM.
     */
    disconnectedCallback () {
      this.removeEventListener('keydown', this.keyDownFunction)
      this.removeEventListener('keyup', this.keyUpFunction)
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
