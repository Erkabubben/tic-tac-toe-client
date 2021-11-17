/**
 * The pwd-chat web component module.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 1.0.0
 */
import './components/emoji-collection/index.js'
import './components/chat-nickname-state/index.js'
import './components/chat-state/index.js'
const pathToModule = import.meta.url
const imagesPath = new URL('./img/', pathToModule)

/**
 * Define template.
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    #pwd-app {
      position: absolute;
      background-color: red;
    }
    #chat-nickname-state, #chat-state {
        font-family: Verdana;
        padding: 0;
        width: 100%;
        height: 100%;
        background-image: url("` + imagesPath + `nickname-bg.jpg");
    }
    p, h1, h2, img {
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
customElements.define('pwd-chat',
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
      this._pwdApp = this.shadowRoot.querySelector('#pwd-app')
      this.name = 'Chat'
      this._styleSize = this.shadowRoot.querySelector('style#size')
      this.width = 480
      this.height = 480

      this.SetSize(this.width, this.height)

      /* Set up app-specific properties */
      this.currentState = null
      this.userNickname = ''

      /* Proceeds directly to chat state if nickname is found in storage */
      if (localStorage.getItem('elimk06_pwd-chat_nickname') !== null) {
        this.userNickname = localStorage.getItem('elimk06_pwd-chat_nickname')
        this.DisplayChatState()
      /* Otherwise displays the nickname state */
      } else {
        this.DisplayNicknameState()
      }
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
     * Displays the start screen where the user is asked to input a nickname.
     */
    DisplayNicknameState () {
      /* Removes any previously displayed screen or message */
      if (this.currentState !== null) {
        this._pwdApp.removeChild(this.currentState)
      }
      /* Creates a new nickname screen with inherited CSS style */
      const nicknameState = document.createElement('chat-nickname-state')
      nicknameState.InheritStyle(this.shadowRoot.querySelector('style'))
      nicknameState.setAttribute('nickname', this.userNickname)
      this.currentState = this._pwdApp.appendChild(nicknameState)
      /* Proceed to the next state when a valid nickname has been submitted */
      this.currentState.addEventListener('nicknameSet', (e) => {
        localStorage.setItem('elimk06_pwd-chat_nickname', e.detail)
        this.userNickname = e.detail
        this.DisplayChatState()
      })
    }

    /**
     * Displays the chat state.
     */
    DisplayChatState () {
      /* Removes any previously displayed state */
      if (this.currentState !== null) {
        this._pwdApp.removeChild(this.currentState)
      }
      /* Creates a new Chat state with inherited CSS style */
      const chatState = document.createElement('chat-state')
      chatState.InheritStyle(this.shadowRoot.querySelector('style'))
      chatState.userNickname = this.userNickname
      this.currentState = this._pwdApp.appendChild(chatState)
      this.currentState.addEventListener('logout', (e) => {
        this.DisplayNicknameState()
      })
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
