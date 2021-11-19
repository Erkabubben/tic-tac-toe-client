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
    #tiles-area {
      width: max-content;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-image: url("${imagesOfParentPath}square-paper-bg-0.jpg");
      animation-name: tiles-area-appear;
      animation-duration: 0.5s;
      animation-timing-function: ease-out;
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
    #ui-area {
      position: absolute;
      background-image: url("${imagesOfParentPath}square-paper-bg-0.jpg");
      width: 20%;
      height: 100%;
      right: 0px;
      top: 0px;
      animation-name: ui-area-appear;
      animation-duration: 0.5s;
      animation-timing-function: ease-out;
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
      this._memoryState = this.shadowRoot.querySelector('#tic-tac-toe-state')
      this._gameArea = this.shadowRoot.querySelector('#game-area')
      this._tilesArea = this.shadowRoot.querySelector('#tiles-area')
      this._winsCounter = this.shadowRoot.querySelector('#winscounter')
      this._lossesCounter = this.shadowRoot.querySelector('#lossescounter')
      this._tiesCounter = this.shadowRoot.querySelector('#tiescounter')
      this._gameNumberCounter = this.shadowRoot.querySelector('#gamenumbercounter')

      this.tileSize = 160 // Default tile size

      this.playerSymbol = 'o'
      this.opponentSymbol = 'x'
      this._startGameUri = 'http://localhost:8080/games/start'
      this._playerMovePostBaseUri = 'http://localhost:8080/games/'
      this._currentGameID = ''
      this._disableAllInput = false

      /* The total amount of tiles, rows and columns at the start of the game  - set from
         the gameType parameter by InitiateGame() */
      this._startingTilesAmount = 0
      this._lineLength = 0
      this._linesAmount = 0

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
      this.addEventListener('click', () => {
        this.UpdateTileSelection()
      })
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
     * @param {Object} gameData - Data on the current game (wins, losses, ties, score etc.).
     * @param {Object} responseJSON - The response to the GET request made by StartGameAPIGet().
     */
    InitiateGame (gameData, responseJSON) {
      this._currentGameID = responseJSON.id
      this._winsCounter.textContent = gameData.wins
      this._lossesCounter.textContent = gameData.losses
      this._tiesCounter.textContent = gameData.ties
      this._gameNumberCounter.textContent = gameData.gameRoundsPlayed + ' / ' + gameData.gameType

      this._lineLength = 3
      this._linesAmount = 3

      this._startingTilesAmount = this._lineLength * this._linesAmount

      let k = 0
      for (let i = 0; i < this._linesAmount; i++) {
        const newTileLine = document.createElement('div')
        for (let j = 0; j < this._lineLength; j++) {
          const newTile = document.createElement('tic-tac-toe-tile')
          newTile.setAttribute('backsideColor', 'yellow')
          newTile.setAttribute('backsideImage', 'backside.jpg')
          newTile.SetSize(this.tileSize, this.tileSize)
          newTile.setAttribute('tabindex', '-1')
          newTile.setState('')
          newTile.row = i
          newTile.column = j
          newTile.tileID = k
          newTile.addEventListener('click', event => {
              this.OnClickTile(newTile, event)
          })
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

    async OnClickTile (clickedTile, event) {
      if (!this._disableAllInput && event.button === 0) { 
        this._selectedTileColumn = clickedTile.column
        this._selectedTileRow = clickedTile.row
        this._selectedTile = clickedTile.tileID
        this.UpdateTileSelection()
        const tile = this._activeTiles[this._selectedTile]
        await this.SetSelectedTileToPlayerSymbol(tile)
      }
    }

    async OnEnterTile (event) {
      event.preventDefault()
      this.UpdateTileSelection()
      const tile = this._activeTiles[this._selectedTile]
      await this.SetSelectedTileToPlayerSymbol(tile)
    }

    async SetSelectedTileToPlayerSymbol (tile) {
      if (tile.getAttribute('state') != this.playerSymbol
        && tile.getAttribute('state') != this.opponentSymbol) {
          this._disableAllInput = true
          this.PlaySoundEffect('confirm-beep', 0, 4)
          tile.setState(this.playerSymbol)
          await this.AwaitAnimationEnd(tile.currentSymbolImg)
          await this.PlayerMoveAPIPost(this._selectedTile)
      }
    }

    PlaySoundEffect (sfxName, variantMin, variantMaxExclusive) {
      if (variantMin == null) {
        this.dispatchEvent(new window.CustomEvent( 'playSFX', { detail: { name: sfxName } }))
      } else {
        const selectedSoundEffect = this.GetRandomInteger(variantMin, variantMaxExclusive)
        this.dispatchEvent(new window.CustomEvent(
          'playSFX', { detail: { name: sfxName + '-' + selectedSoundEffect } }))
      }
    }

    /**
     * Retrieves a new question from the server and parses it to a JSON object, which is then
     * used by DisplayNewQuestion() to create a new question screen.
     *
     * @param {string} move - The URL of the question to be retrieved.
     */
    async PlayerMoveAPIPost (move) {
      try {
        const moveJSONstringified = await JSON.stringify({ "position": move })
        const response = await window.fetch(this._playerMovePostBaseUri + this._currentGameID, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: moveJSONstringified
        })
        const responseJSON = await response.json() // Parse response to JSON object
        const lastMove = this.GetLastMove(responseJSON)
        if (lastMove.player == 'AI') {
          const opponentResponseTile = this._activeTiles[lastMove.position]
          opponentResponseTile.setState(this.opponentSymbol)
          await this.AwaitAnimationEnd(opponentResponseTile.currentSymbolImg)
        }
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
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await delay(2000)
      }
      this._disableAllInput = false
      this.dispatchEvent(new window.CustomEvent('gameOver', { detail: json.winner }))
    }

    GetWinnerTiles (json) {
      const board = json.board
      const possibleWins = [
        [ 0, 1, 2 ],
        [ 3, 4, 5 ],
        [ 6, 7, 8 ],
        [ 0, 3, 6 ],
        [ 1, 4, 7 ],
        [ 2, 5, 8 ],
        [ 0, 4, 8 ],
        [ 2, 4, 6 ],
      ]

      for (let i = 0; i < possibleWins.length; i++) {
        const tilesArray = possibleWins[i];
        if (board[tilesArray[0].toString()] !== null
          && board[tilesArray[1].toString()] === board[tilesArray[0].toString()]
          && board[tilesArray[2].toString()] === board[tilesArray[0].toString()]) {
          return tilesArray
        }
      }

      return null
    }

    GetLastMove (json) {
      return json.moves[json.moves.length - 1]
    }

    async AwaitAnimationEnd (element) {
      return new Promise(function (resolve, reject) {
        element.addEventListener('animationend', () => {
          resolve()
        })
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