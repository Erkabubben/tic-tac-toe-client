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
      <h1 id="pairsfoundtext">Pairs found:</h1>
      <h1 id="pairsfoundcounter"></h1>
      <h1 id="mistakestext">Mistakes:</h1>
      <h1 id="mistakescounter"></h1>
      <h1 id="timertext">Time:</h1>
      <h1 id="timercounter"><countdown-timer id="countdown-timer"></h1>
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
      this._pairsFoundCounter = this.shadowRoot.querySelector('#pairsfoundcounter')
      this._mistakesCounter = this.shadowRoot.querySelector('#mistakescounter')
      this._timerCounter = this.shadowRoot.querySelector('#timercounter')
      this._countdownTimer = this.shadowRoot.querySelector('#countdown-timer')

      this.cardSize = 96 // Default card size

      this.playerSymbol = 'o'
      this.opponentSymbol = 'x'
      this._startGameUri = 'http://localhost:8080/games/start'
      this._playerMovePostBaseUri = 'http://localhost:8080/games/'
      this._currentGameID = ''

      /* Reference for setting the size of the cards depending on game type */
      this.cardSizes = {
        '2x2': 256,
        '4x2': 128,
        '4x4': 128,
        '6x6': 90
      }

      /* The total amount of cards, rows and columns at the start of the game  - set from
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

      /* Game progress properties */
      this._pairsFound = 0
      this._mistakes = 0

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
     * @param {string} gameType - The game type selected in the nickname state.
     */
    InitiateGame (gameType, responseJSON) {
      this._currentGameID = responseJSON.id
      console.log(responseJSON)
      console.log('New game ID set to: ' + this._currentGameID)

      this._pairsFoundCounter.textContent = '0'
      this._mistakesCounter.textContent = '0'

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
          //newCardImg.setAttribute('src', imagesPath + newCard.motif + '.jpg')
          newTile.setState('')
          newTile.row = i
          newTile.column = j
          newTile.cardID = k
          newTile.addEventListener('click', event => {
            if (event.button === 0) {
              this._selectedTileColumn = newTile.column
              this._selectedTileRow = newTile.row
              this._selectedTile = newTile.cardID
              this.UpdateTileSelection()
              const tile = this._activeTiles[this._selectedTile]
              if (tile.getAttribute('state') != this.playerSymbol
                && tile.getAttribute('state') != this.opponentSymbol) {
                  tile.setState(this.playerSymbol)
                  this.PlayerMoveAPIPost(this._selectedTile)
              }
            }
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
          event.preventDefault()
          this.UpdateTileSelection()
          const tile = this._activeTiles[this._selectedTile]
          if (tile.getAttribute('state') != this.playerSymbol
            && tile.getAttribute('state') != this.opponentSymbol) {
              tile.setState(this.playerSymbol)
              this.PlayerMoveAPIPost(this._selectedTile)
          }
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
        const opponentResponseTileID = responseJSON.moves[responseJSON.moves.length - 1].position
        const opponentResponseTile = this._activeTiles[opponentResponseTileID]
        opponentResponseTile.setState(this.opponentSymbol)
      // Error handling
      } catch (error) {
        console.log('Error on fetch request!')
      }
    }

    /**
     * Retrieves a new question from the server and parses it to a JSON object, which is then
     * used by DisplayNewQuestion() to create a new question screen.
     */
    async StartGameAPIGet (gameType) {
      try {
        const response = await window.fetch(this._startGameUri)
        const responseJSON = await response.json() // Parse response to JSON object
        this.InitiateGame(gameType, responseJSON)
      // Error handling
      } catch (error) {
        console.log('Error on fetch request!')
      }
    }
    
    /**
     * Sends the answer to a question as a POST request, then determines and
     * displays the next screen depending on the response.
     *
     * @param {string} answer - The given answer.
     * @param {number} time - The time taken to answer the question.
     */
    async SendAnswerToQuestion (answer, time) {
      try {
        const answerJSONstringified = await JSON.stringify(answer)
        /* Send POST request to server and await response */
        const response = await window.fetch(this.currentScreen.getAttribute('nextURL'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: answerJSONstringified
        })
        const responseJSON = await response.json() // Parse response to JSON object
        /* Evaluate whether the submitted answer was correct */
        if (response.status === 200) { // Answer is correct
          this.totalTime = this.totalTime + time
          await this.DisplayTimedMessage(responseJSON.message, this._messageTime, (e) => {
            if ({}.hasOwnProperty.call(responseJSON, 'nextURL')) {
              this.RetrieveNewQuestion(responseJSON.nextURL)
            } else {
              this.DisplayHighscore(true)
            }
          })
        } else { // Answer is incorrect
          await this.DisplayTimedMessage(responseJSON.message, this._messageTime, (e) => { this.DisplayHighscore(false) })
        }
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
        const card = this._activeTiles[i]
        if (card.cardID === this._selectedTile) {
          card._div.focus()
        }
      }
    }

    /**
     * Flips the selected card if it is set to active and not already flipped.
     * If one card has already been flipped, the method will check whether the
     * the two cards are a match.
     */
    SetStateOfTile (tileID) {
      const tile = this._activeTiles[tileID]
      if (tile.getAttribute('state') == this.playerSymbol
        || tile.getAttribute('state') == this.opponentSymbol) {
      
      } else {
        tile.setState(this.playerSymbol)
      }
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
