/**
 * The chat-state web component module.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 1.0.0
 */

/**
 * Define template.
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    #chat-state {
      background-color: grey;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    #chat-state div#messages {
      height: 75%;
      width: 100%;
      overflow-y: auto;
    }
    #messages div {
      background-color: white;
      border: 3px outset grey;
      border-radius: 6px;
      padding: 0.5rem;
      margin: 0.5rem;
      opacity: 0.85;
    }
    #messages div p#username {
      font-weight: bold;
      opacity: 1;
      user-select: auto;
    }
    #messages div p#messagetext {
      font-size: 0.75rem;
      opacity: 1;
      user-select: auto;
    }
    #messages div p {
      margin-top: 0.2rem;
      margin-bottom: 0.2rem;
    }
    #user-ui {
      height: max-content;
      width: 100%;
      background-color: black;
      position: absolute;
      bottom: 0px;
    }
    #messageinput {
      width: 100%;
      height: auto;
    }
    #sendbutton {
      position: absolute;
      width: 64px;
      height: 100%;
      right: 0px;
      padding-right: 0.5rem;
      padding-left: 0.5rem;
    }
    #logoutbutton {
      height: 100%;
      width: 80px;
    }
    #user-ui-top {
      width: 100%;
      height: 24px;
      position: relative;
      display: block;
    }
    #user-ui-top p {
      position: absolute;
      height: 100%;
      width: auto;
      color: white;
      font-style: Verdana;
      font-weight: bold;
      padding: 4px 0px 4px 6px;
      margin: 0px;
    }
    button#emojis {
      position: absolute;
      height: 100%;
      padding: 0;
      width: min-content;
      right: 0px;
    }
    #emojicollection {
      position: absolute;
      right: 0px;
      top: 24px;
      height: 80px;
      width: 256px;
      background: white;
      border: 1px black solid;
      z-index: 1;
    }
    #user-ui-mid {
      width: 100%;
      height: auto;
      position: relative;
      padding: 0px;
      box-sizing: border-box;
    }
    textarea {
      resize: none;
      background-color: white;
      border: 3px outset grey;
      border-radius: 6px;
      width: 100%;
      height: 100%;
      opacity: 0.85;
      padding: 0.25rem;
      box-sizing: border-box;
    }
    #user-ui-bottom {
      width: 100%;
      height: 24px;
      position: relative;
    }
    button {
      font-family: Verdana;
      color: white;
      font-weight: bold;
      background-color: #444444;
      border: 2px outset #444444;
    }
    button:hover {
      background-color: #999999;
      border-color: #999999;
    }
  </style>
  <div id="chat-state">
    <div id="messages"></div>
    <div id="user-ui">
      <div id="user-ui-top">
        <p id="username">USER</p>
        <button type="button" id="emojis">&#x1F642</button>
      </div>
      <div id="user-ui-mid">
        <textarea rows="3" autofocus id="messageinput" class="selectable" autocomplete="off"></textarea>
      </div>
      <div id="user-ui-bottom">
        <button type="button" id="logoutbutton">Log out</button>
        <button type="button" id="sendbutton">Send</button>
      </div>
    </div>
  </div>
`

/**
 * Define custom element.
 */
customElements.define('chat-state',
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

      /* Chat screen properties */
      this.messageAPIKey = 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
      this.userNickname = ''

      /* Set up element references */
      this._chatState = this.shadowRoot.querySelector('#chat-state')
      this._messages = this.shadowRoot.querySelector('#messages')

      /* User-UI section */
      this._userUITop = this.shadowRoot.querySelector('#user-ui-top')
      this._userUIMid = this.shadowRoot.querySelector('#user-ui-mid')
      this._messageInput = this.shadowRoot.querySelector('#messageinput')
      this._sendbutton = this.shadowRoot.querySelector('#sendbutton')

      /* Create Logout button */
      this._logoutbutton = this.shadowRoot.querySelector('#logoutbutton')
      this._logoutbutton.addEventListener('click', (event) => {
        this.dispatchEvent(new window.CustomEvent('logout'))
      })

      /* Create Emoji button */
      this._emojiButton = this.shadowRoot.querySelector('button#emojis')
      this._emojiButton.addEventListener('click', (event) => {
        this._emojiCollection.ToggleDisplay()
      })

      /* Create emoji-collection element */
      this._emojiCollection = document.createElement('emoji-collection')
      this._emojiCollection.SetSize(256, 74)
      this._userUIMid.appendChild(this._emojiCollection)
      this._emojiCollection.addEventListener('emoji', (event) => {
        this._messageInput.value = this._messageInput.value + event.detail
      })

      /* Event listener for sending message by pressing Enter */
      this._messageInput.addEventListener('keydown', (event) => { // Checks if the Enter button has been pressed
        if (event.keyCode === 13) {
          event.preventDefault()
          this.SendMessage()
        }
      })

      /* Event Listener that will set focus to the previously selected element when
        clicking inside the state */
      this.addEventListener('click', () => {
        this._messageInput.focus()
      })

      this.serverURL = 'wss://cscloud6-127.lnu.se/socket/'
      this.webSocket = 0
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
     * Creates a JSON object from the username and contents of the message input,
     * stringifies the object and sends it to the WebSocket, then resets the
     * message input.
     */
    SendMessage () {
      if (this._messageInput.value.length > 0) {
        const newMessageJSON = {
          type: 'message',
          username: this.userNickname,
          data: this._messageInput.value,
          channel: 'my, not so secret, channel',
          key: this.messageAPIKey
        }
        const newMessageString = JSON.stringify(newMessageJSON)
        this.webSocket.send(newMessageString)
        this._messageInput.value = ''
      }
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {
      /* Sets the current username to be displayed above the message input */
      this.shadowRoot.querySelector('#username').textContent = this.userNickname

      /* Sets the text input to have focus from the start */
      this._messageInput.focus()

      /* Initiates WebSocket */
      this.webSocket = new WebSocket(this.serverURL)

      /* Event Listener for checking if the Send button has been clicked */
      this._sendbutton.addEventListener('click', () => {
        this.SendMessage()
      })

      /* Set up WebSocket Event Listeners */

      /**
       * Called whenever the WebSocket connection is opened.
       *
       * @param {event} event - A WebSocket event.
       */
      this.webSocket.onopen = (event) => {
        // console.log('WEBSOCKET IS OPEN')
        // console.log(this.webSocket.readyState)
      }

      /**
       * Called whenever the WebSocket connection is closed.
       *
       * @param {event} event - A WebSocket closing event.
       */
      this.webSocket.onclose = (event) => {
        // console.log('WEBSOCKET IS CLOSED')
        // console.log(this.webSocket.readyState)
      }

      /**
       * Called whenever a new message is received by the WebSocket.
       *
       * @param {MessageEvent} event - The message event received by the WebSocket.
       */
      this.webSocket.onmessage = (event) => {
        /* Parses the received message to JSON */
        const receivedMsg = event.data
        const msgJSON = JSON.parse(receivedMsg)

        /* Creates a message div element from the content */
        const newMessageDiv = document.createElement('div')
        newMessageDiv.setAttribute('id', 'message')
        const newMessageHeader = document.createElement('p')
        const date = new Date() // Create new Date object for retrieving current date and time
        newMessageHeader.setAttribute('id', 'username')

        /* Set header textContent to include current username and date/time data from Date object */
        /**
         * Adds leading zeroes to any number passed as an argument,
         * as long as the number is shorter than ten digits.
         *
         * @param {number} num - The number you wish to pad with leading zeroes.
         * @param {number} size - The number of leading zeroes you wish to add.
         * @returns {string} The argument number padded with leading zeroes.
         */
        const pad = (num, size) => { return ('000000000' + num).substr(-size) }
        newMessageHeader.textContent = msgJSON.username + ' (' +
          date.getFullYear() + '-' + pad((date.getMonth() + 1), 2) + '-' + pad(date.getDate(), 2) + ' ' +
          pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2) + ':' + pad(date.getSeconds(), 2) + ')'
        const newMessageText = document.createElement('p')
        newMessageText.setAttribute('id', 'messagetext')
        newMessageText.textContent = msgJSON.data

        /* Assembles the message div element and appends it to the messages section */
        newMessageDiv.appendChild(newMessageHeader)
        newMessageDiv.appendChild(newMessageText)
        this._messages.appendChild(newMessageDiv)

        /* Automatically scrolls the Messages div to the bottom */
        this._messages.scrollTop = this._messages.scrollHeight
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
    disconnectedCallback () {
      this.webSocket.close()
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
