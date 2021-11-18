/**
 * The memory-state web component module.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 1.0.0
 */
import './components/flipping-tile/index.js'
import './components/countdown-timer/index.js'
const pathToModule = import.meta.url
const imagesPath = new URL('./components/flipping-tile/images/', pathToModule)

/**
 * Define template.
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    #memory-state {
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
    #cards-area {
      width: max-content;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    #ui-area {
      position: absolute;
      background-color: #222222;
      width: 20%;
      height: 100%;
      right: 0px;
      top: 0px;
      border: 4px outset #222222;
    }
    h1 {
      color: white;
      font-size: 1.25rem;
      text-align: center;
    }
    :focus {
      box-shadow: 0px 0px 2px 2px red;
    }
  </style>
  <div id="memory-state">
    <div id="game-area">
      <div id="cards-area"></div>
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
customElements.define('memory-state',
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

      /* Memory state properties */
      this._memoryState = this.shadowRoot.querySelector('#memory-state')
      this._gameArea = this.shadowRoot.querySelector('#game-area')
      this._cardsArea = this.shadowRoot.querySelector('#cards-area')
      this._winsCounter = this.shadowRoot.querySelector('#winscounter')
      this._lossesCounter = this.shadowRoot.querySelector('#lossescounter')
      this._tiesCounter = this.shadowRoot.querySelector('#tiescounter')
      this._gameNumberCounter = this.shadowRoot.querySelector('#gamenumbercounter')

      this.cardSize = 96 // Default card size

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

      /* Properties for tracking which card is currently selected */
      this._selectedTile = 0
      this._selectedTileRow = 0
      this._selectedTileColumn = 0

      /* The ID's of the cards in the current game */
      this._activeTiles = []

      /* References for easy conversions between card ID and column/row numbers */
      this._cardsColumnRowToID = {}
      this._cardsIDToColumnRow = {}

      /* Properties used when checking if flipped cards are a valid pair */
      this._amountOfCardsOfPairFlipped = 0
      this._cardsOfPair1 = -1
      this._cardsOfPair2 = -1
      this._cardsPairTimeout = 0

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
     * Called by pwd-memory to set up a new game after the element has been created.
     *
     * @param {string} gameData - The game type selected in the nickname state.
     */
    InitiateGame (gameData, responseJSON) {
      this._currentGameID = responseJSON.id
      console.log('New game ID set to: ' + this._currentGameID)

      this._winsCounter.textContent = gameData.wins
      this._lossesCounter.textContent = gameData.losses
      this._tiesCounter.textContent = gameData.ties
      this._gameNumberCounter.textContent = gameData.gamesPlayed + ' / ' + gameData.gameType

      this._lineLength = 3
      this._linesAmount = 3

      this._startingTilesAmount = this._lineLength * this._linesAmount

      let k = 0
      for (let i = 0; i < this._linesAmount; i++) {
        const newCardLine = document.createElement('div')
        for (let j = 0; j < this._lineLength; j++) {
          const newTile = document.createElement('flipping-tile')
          newTile.setAttribute('backsideColor', 'yellow')
          newTile.setAttribute('backsideImage', 'backside.jpg')
          newTile.SetSize(160, 160)
          newTile.setAttribute('tabindex', '-1')
          newTile.setState('')
          newTile.row = i
          newTile.column = j
          newTile.cardID = k
          newTile.addEventListener('click', event => {
              this.OnClickTile(newTile, event)
          })
          newCardLine.appendChild(newTile)
          this._activeTiles.push(newTile)
          this._cardsColumnRowToID[j + ',' + i] = k
          this._cardsIDToColumnRow[k] = j + ',' + i
          k++
        }
        this._cardsArea.appendChild(newCardLine)
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

        this._selectedTile = this._cardsColumnRowToID[this._selectedTileColumn + ',' + this._selectedTileRow]
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
        this._selectedTile = clickedTile.cardID
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
          this.PlayConfirmSoundEffect()
          tile.setState(this.playerSymbol)
          await this.AwaitAnimationEnd(tile.currentSymbolImg)
          await this.PlayerMoveAPIPost(this._selectedTile)
      }
    }

    PlayConfirmSoundEffect () {
      const selectedSoundEffect = this.getRndInteger(0, 4)
      console.log(this.dispatchEvent(new window.CustomEvent(
        'playSFX', { detail: { name: 'confirm-beep-' + selectedSoundEffect } })))
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
        console.log(responseJSON)
        console.log(responseJSON.moves)
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
      console.log('game has ended!')
      if (json.winner != null) {
        const winnerTiles = this.GetWinnerTiles(json)
        console.log(winnerTiles)
        if (winnerTiles != null) {
          winnerTiles.forEach(tileID => {
            this._activeTiles[tileID].startWinnerAnimation()
          })
          await this.AwaitAnimationEnd(this._activeTiles[winnerTiles[0]].currentSymbolImg)
        }
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
     * Updates the 'part' attribute of each card, so that only the card whose cardID
     * is equal to the _selectedCard property will be displayed as selected.
     */
    UpdateTileSelection () {
      for (let i = 0; i < this._activeTiles.length; i++) {
        const tile = this._activeTiles[i]
        if (tile.cardID === this._selectedTile) {
          tile._div.focus()
        }
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
