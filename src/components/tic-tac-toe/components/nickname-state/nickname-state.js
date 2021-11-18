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

    img#pencils {
      position: absolute;
      height: 90%;
      left: 35%;
      transform: translate(-50%, 0 );
    }

    /* Animation code */
    @keyframes pencils-appear {
      from {
        opacity: 0.0;
        height: 130%;
      }
      to {
        opacity: 1.0;
        height: 90%;
      }
    }
    /* Element to apply animation to */
    #pencils {
      animation-name: pencils-appear;
      animation-iteration-count: 1;
      animation-duration: 1s;
      animation-timing-function: ease-out;
    }

    #game-title {
      position: absolute;
    }

    #game-title-headers {
      position: relative;
      left: 25%;
      top: 20%;
    }

    #game-title-headers h1 {
      position: absolute;
      font-size: 110px;
      font-family: "Lucida Handwriting", cursive;
    }

    /* Animation code */
    @keyframes tic-appear {
      from {
        opacity: 0.0;
        top: -200px;
      }
      to {
        opacity: 1.0;
        top: 0px;
      }
    }

    @keyframes tac-appear {
      from {
        opacity: 0.0;
        left: 80%;
      }
      to {
        opacity: 1.0;
        left: 100px;
      }
    }

    @keyframes toe-appear {
      from {
        opacity: 0.0;
        top: 400px;
      }
      to {
        opacity: 1.0;
        top: 220px;
      }
    }

    #tic {
      left: 0px;
      top: 0px;
      animation-name: tic-appear;
      animation-duration: 1s;
      animation-timing-function: ease-out;
    }

    #tac {
      color: #E31E24;
      left: 100px;
      top: 110px;
      animation-name: tac-appear;
      animation-duration: 1s;
      animation-timing-function: ease-out;
    }

    #toe {
      color: #008DD2;
      left: 200px;
      top: 220px;
      animation-name: toe-appear;
      animation-duration: 1s;
      animation-timing-function: ease-out;
    }

    /*@keyframes form-appear {
      0% {
        opacity: 0.5;
        top: 1200px;
        transform: rotate(0deg)
      }
      50% {
        transform: rotate(0deg)
      }
      100% {
        opacity: 1.0;
        top: 20%;
        left: 50%;
      }
    }*/

    form {
      animation-name: form-appear;
      animation-duration: 1s;
      animation-timing-function: ease-out;
    }

    form {
      position: absolute;
      left: 50%;
      top: 20%;
      margin: auto;
      font-family: Verdana;
      color: white;
      width: 50%;
      background-image: url("${imagesOfParentPath}square-paper-bg-0.jpg");
    }

    form input#nickname {
      position: absolute;
      transform: translate(-50% ,0 );
      background-color: transparent;
      border: 2px solid black;
      font-family: "Lucida Handwriting", cursive;
      left: 50%;
      font-size: 1.25rem;
      padding: 8px;
    }

    form p {
      display: block;
      text-align: center;
      font-family: "Lucida Handwriting", cursive;
      color: black;
      font-size: 150%;
    }

    form button {
      display: block;
      margin-left: auto;
      margin-right: auto;
      font-weight: bold;
      background-color: #444444;
      border: 2px outset #444444;
      width: 3rem;
    }

    form button:hover {
      background-color: #999999;
      border-color: #999999;
    }

    :focus {
      box-shadow: 0px 0px 1px 3px red;
      outline: none;
    }

    ::part(selected) {
      box-shadow: 0px 0px 1px 3px red;
    }
  </style>
  <div id="nickname-state">
    <form id="start-form">
      <p>Enter a nickname: </p>
      <input type="text" id="nickname" class="selectable" autocomplete="off">
      <br><br>
      <p>Game Rounds: </p>
      <div id="alternatives"></div><br>
    </form>
    <br>
    <img id="pencils" src="` + imagesOfParentPath + `tic-tac-toe-pencils.png">
    <div id="game-title-headers">
      <h1 id="tic">Tic</h1>
      <h1 id="tac">Tac</h1>
      <h1 id="toe">Toe</h1>
    </div>
    <br>
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
      const gameTypes = ['1', '2', '3', '5', '10', '25']

      /* Creates a button for each element in the gameTypes array */
      gameTypes.forEach(element => {
        const newAlternative = document.createElement('button')
        newAlternative.setAttribute('value', element)
        newAlternative.textContent = element
        newAlternative.classList.add('selectable')
        this._alternatives.appendChild(newAlternative)
        newAlternative.addEventListener('click', (event) => { // Checks if the mouse has been clicked
          event.preventDefault()
          if (this._input.value.length > 2) {
            this.dispatchEvent(new window.CustomEvent(
              'nicknameSet',
              { detail: { nickname: this._input.value, game: newAlternative.value } }))
          }
        })
        //this._alternatives.appendChild(document.createElement('br'))
      })

      /* Properties for determining which element is currently selected */
      this._selectedElement = 0
      this._selectables = this._nicknameState.querySelectorAll('.selectable')

      for (let index = 0; index < this._selectables.length; index++) {
        const element = this._selectables[index];
        element.addEventListener('onmousedown', (event) => {
          this._selectables[this._selectedElement].blur()
          this._selectedElement = index
          this._selectables[this._selectedElement].focus()
        })
      }

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
            this.dispatchEvent(new window.CustomEvent(
              'nicknameSet',
              { detail: { nickname: this._input.value, game: this._selectables[this._selectedElement].value } }))
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
