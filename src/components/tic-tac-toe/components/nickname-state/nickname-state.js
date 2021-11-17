/**
 * The nickname-state web component module.
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

    img {
      margin: auto;
      display: block;
    }

    h1 {
      color: orange;
      font-weight: bold;
      font-size: 96px;
      text-align: center;
    }

    form {
      margin: auto;
      font-family: Verdana;
      color: white;
      width: 50%;
    }

    form input#nickname {
      position: absolute;
      transform: translate(-50% ,0 );
      left: 50%;
      font-size: 1.25rem;
    }

    form p {
      display: block;
      text-align: center;
    }

    form button {
      display: block;
      margin-left: auto;
      margin-right: auto;
      font-family: Verdana;
      color: white;
      font-weight: bold;
      background-color: #444444;
      border: 2px outset #444444;
    }

    form button:hover {
      background-color: #999999;
      border-color: #999999;
    }

    :focus {
      box-shadow: 0px 0px 1px 4px yellow;
    }

    ::part(selected) {
      box-shadow: 0px 0px 1px 4px yellow;
    }
  </style>
  <div id="nickname-state">
    <br>
    <img src="` + imagesOfParentPath + `logo.png">
    <br>
    <form>
      <p>Enter a nickname: </p>
      <input type="text" id="nickname" class="selectable" autocomplete="off">
      <br><br><br>
      <div id="alternatives"></div><br>
    </form>
  </div>
`

/**
 * Define custom element.
 */
customElements.define('nickname-state',
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

      /* Nickname screen properties */
      this._nicknameState = this.shadowRoot.querySelector('#nickname-state')
      this._button = this.shadowRoot.querySelector('button')
      this._input = this.shadowRoot.querySelector('input')
      this._alternatives = this.shadowRoot.querySelector('#alternatives')

      /* Sets up the game difficulties to choose from */
      const gameTypes = ['2x2', '4x2', '4x4', '6x6']

      /* Creates a button for each element in the gameTypes array */
      gameTypes.forEach(element => {
        const newAlternative = document.createElement('button')
        newAlternative.setAttribute('value', element)
        newAlternative.textContent = element
        newAlternative.classList.add('selectable')
        this._alternatives.appendChild(newAlternative)
        newAlternative.addEventListener('click', (event) => { // Checks if the mouse has been clicked
          event.preventDefault()
          if (this._input.value.length > 2) this.dispatchEvent(new window.CustomEvent('nicknameSet', { detail: { nickname: this._input.value, game: newAlternative.value } }))
        })
        this._alternatives.appendChild(document.createElement('br'))
      })

      /* Properties for determining which element is currently selected */
      this._selectedElement = 0
      this._selectables = this._nicknameState.querySelectorAll('.selectable')

      /* Event Listener that will set focus to the previously selected element when
         clicking inside the state */
      this.addEventListener('click', () => {
        this._selectables[this._selectedElement].focus()
      })

      /**
       * Function to be called whenever a key on the keyboard is pressed.
       *
       * @param {event} event - The 'keydown' event.
       */
      this.keyDownFunction = (event) => {
        /* Using keyboard buttons to navigate the nickname input and game buttons */
        if (event.keyCode === 40 || (event.keyCode === 13 && this._selectedElement === 0)) { // Down arrowkey, or Enter while on the Input element
          event.preventDefault()
          this._selectables[this._selectedElement].blur()
          this._selectedElement++
          if (this._selectedElement >= this._selectables.length) {
            this._selectedElement = 0
          } else if (this._selectedElement < 0) {
            this._selectedElement = (this._selectables.length - 1)
          }
          this._selectables[this._selectedElement].focus()
        } else if (event.keyCode === 38) { // Up arrowkey
          event.preventDefault()
          this._selectables[this._selectedElement].removeAttribute('part')
          this._selectedElement--
          if (this._selectedElement >= this._selectables.length) {
            this._selectedElement = 0
          } else if (this._selectedElement < 0) {
            this._selectedElement = (this._selectables.length - 1)
          }
          this._selectables[this._selectedElement].focus()
        /* Dispatches nicknameSet event to proceed to memory-state when pressing Enter,
           if game button is highlighted and nickname has been set */
        } else if (event.keyCode === 13 && this._selectedElement !== 0) { // Enter, when game button is selected...
          event.preventDefault()
          if (this._input.value.length > 2) { // ...and a valid nickname is set.
            this.dispatchEvent(new window.CustomEvent('nicknameSet', { detail: { nickname: this._input.value, game: this._selectables[this._selectedElement].value } }))
          }
        }
        // Focus or blur text input field depending on wether it is selected
        if (this._selectedElement === 0) {
          this._selectables[0].focus()
        } else {
          this._selectables[0].blur()
        }
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
     * Attributes to monitor for changes.
     *
     * @returns {string[]} A string array of attributes to monitor.
     */
    static get observedAttributes () {
      return ['nickname']
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
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {
      this._input.focus() // Sets the text input to have focus from the start
    }

    /**
     * Called when observed attribute(s) changes.
     *
     * @param {string} name - The attribute's name.
     * @param {*} oldValue - The old value.
     * @param {*} newValue - The new value.
     */
    attributeChangedCallback (name, oldValue, newValue) {
      /* Sets the previous nickname as the default value when returning from the memory */
      if (name === 'nickname') {
        this._input.setAttribute('value', this.getAttribute('nickname'))
      }
    }

    /**
     * Called after the element has been removed from the DOM.
     */
    disconnectedCallback () {
      /* Removes keyboard event listeners */
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
