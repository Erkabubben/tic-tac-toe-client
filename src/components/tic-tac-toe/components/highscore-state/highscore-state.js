/**
 * The highscore-state web component module.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 1.0.0
 */
const pathToModule = import.meta.url
const imagesOfParentPath = new URL('../../img/', pathToModule)

/**
 * Define template.
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    #highscore-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    h1, h2 {
      text-align: center;
    }
    h1, h2, #highscoretable {
      display: block;
      margin: auto;
      color: orange;
    }
    th, td {
      padding: 0.2em;
    }
    #hs {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-image: url("${imagesOfParentPath}square-paper-bg-0.jpg");
      border: 3px outset #999999;
      width: max-content;
      padding: 24px;
    }
  </style>
  <div id="highscore-state">
    <div id="hs">
      <h1>HIGHSCORES<h1>
      <h2></h2>
      <table id="highscoretable">
        <tr>
          <th>Nickname</th>
          <th>Score</th>
        </tr>
      </table> 
    </div>
  </div>
`

/**
 * Define custom element.
 */
customElements.define('highscore-state',
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

      /* Set up properties */
      this._highscoreState = this.shadowRoot.querySelector('#highscore-state')
      this._highscoreContainer = this._highscoreState.querySelector('#hs')
      this._highscoreTable = this._highscoreState.querySelector('#highscoretable')
      this._mainheader = this._highscoreState.querySelector('h1')
      this._message = this._highscoreState.querySelector('h2')
      this._localStorageFileName = ''

      this._highscoreContainer.classList.add('note-appear')

      /**
       * Dispatches an event when user clicks the mouse button to return to
       * nickname screen.
       */
      this.dispatchClickEvent = () => {
        this.Proceed()
      }

      /**
       * Dispatches an event when user presses the Enter key to return to
       * nickname screen.
       *
       * @param {event} event - Event data passed for checking which key was pressed
       */
      this.dispatchKeyEvent = (event) => {
        if (event.keyCode === 13) {
          event.preventDefault()
          this.Proceed()
        }
      }
    }

    /**
     * Attributes to monitor for changes.
     *
     * @returns {string[]} A string array of attributes to monitor.
     */
    static get observedAttributes () {
      return [
        'name',
        'mistakes',
        'game'
      ]
    }

    /**
     * Notifies the parent element that the user is ready to move on from the
     * highscore screen.
     */
    async Proceed () {
      document.removeEventListener('click', this.dispatchClickEvent)
      document.removeEventListener('keydown', this.dispatchKeyEvent)
      this._highscoreContainer.classList.remove('note-appear')
      this._highscoreContainer.classList.add('note-disappear')
      await this.AwaitAnimationEnd(this._highscoreContainer)
      this.dispatchEvent(new window.CustomEvent('proceedfromhighscores'))
    }

    async AwaitAnimationEnd (element) {
      return new Promise(function (resolve, reject) {
        element.addEventListener('animationend', () => {
          resolve()
        })
      })
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {
      this._localStorageFileName = 'erkabubben-tic-tac-toe-highscores-' + this.getAttribute('game')
      if (this.hasAttribute('name') && this.hasAttribute('score')) {
        this.UpdateHighscoreData()
      }
      this.DisplayHighscores()

      /* Adds a slight delay to adding the Event Listeners, so that input from the previous
         state won't be registered */
      this._delayProceed = setTimeout(() => {
        /* Add event listeners that checks if the user has clicked the mouse or pressed Enter */
        this._clicklistener = document.addEventListener('click', this.dispatchClickEvent)
        this._keylistener = document.addEventListener('keydown', this.dispatchKeyEvent)
        clearTimeout(this._delayProceed)
      }, 10)
    }

    /**
     * Checks whether the current player has reached a new highscore, and if so,
     * updates the data with the player's nickname and time.
     */
    UpdateHighscoreData () {
      /* Create new highscore data if none is present in local storage */
      if (localStorage.getItem(this._localStorageFileName) === null) {
        const newHighscores = []
        newHighscores.push([this.getAttribute('name'), this.getAttribute('score')])
        this._message.textContent = 'You made #' + (newHighscores.length) + '!'
        localStorage.setItem(this._localStorageFileName, JSON.stringify(newHighscores))
      /* Otherwise, retrieve and update existing data */
      } else {
        const storedHighscores = JSON.parse(localStorage.getItem(this._localStorageFileName))
        const userEntry = [this.getAttribute('name'), this.getAttribute('score')]
        let newEntryAdded = false
        for (let index = 0; index < storedHighscores.length; index++) {
          const element = storedHighscores[index]
          if (Number(this.getAttribute('score')) > Number(element[1])) {
            storedHighscores.splice(index, 0, userEntry)
            this._message.textContent = 'You made #' + (index + 1) + '!'
            newEntryAdded = true
            break
          }
        }
        if (!newEntryAdded) {
          storedHighscores.push(userEntry)
          if (storedHighscores.length < 6) {
            this._message.textContent = 'You made #' + (storedHighscores.length) + '!'
          }
        }
        /* Remove 6th element if array exceeds five */
        if (storedHighscores.length > 5) {
          storedHighscores.pop()
        }
        /* Save updated data in local storage */
        localStorage.setItem(this._localStorageFileName, JSON.stringify(storedHighscores))
      }
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
     * Updates the highscore table to display the contents of the stored highscores data.
     */
    DisplayHighscores () {
      this._mainheader.textContent = 'HIGHSCORES (' + this.getAttribute('game').toUpperCase() + ' GAME ROUNDS)'
      if (localStorage.getItem(this._localStorageFileName) !== null) {
        const currentHighscores = JSON.parse(localStorage.getItem(this._localStorageFileName))
        for (let index = 0; index < currentHighscores.length; index++) {
          const name = currentHighscores[index][0]
          const score = currentHighscores[index][1]
          const tableRow = document.createElement('tr')
          const tableDataName = document.createElement('td')
          tableDataName.textContent = name
          const tableDataScore = document.createElement('td')
          tableDataScore.textContent = score
          tableRow.appendChild(tableDataName)
          tableRow.appendChild(tableDataScore)
          this._highscoreTable.appendChild(tableRow)
        }
      } else {
        this._highscoreState.removeChild(this._highscoreTable)
        this._message.textContent = 'No winners yet!'
      }
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
    disconnectedCallback () {}
  }
)
