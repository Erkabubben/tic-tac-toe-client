/**
 * The message-state web component module.
 *
 * @author Erik Lindholm <eriklindholm87@hotmail.com>
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
    #message-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    #message-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-width: 80%;
      background-image: url("${imagesOfParentPath}square-paper-bg-0.jpg");
      border: 0px outset #999999;
      padding: 24px;
    }
  </style>
  <div id="message-state">
    <div id="message-container">
      <h2></h2>
    </div>
  </div>
`

/**
 * Define custom element.
 */
customElements.define('message-state',
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

      /* Set up state properties */
      this._messageState = this.shadowRoot.querySelector('#message-state')
      this._messageContainer = this.shadowRoot.querySelector('#message-container')
      this._message = this._messageState.querySelector('h2')

      // Adds note-appear class to message container to trigger CSS animation when state
      // is displayed.
      this._messageContainer.classList.add('note-appear')

      /* Countdown properties */
      this._timeLimitInMS = 4000
      this._countdownTimeout = 0
    }

    /**
     * Creates a number of text elements from the contents of a string array
     * and appends them to the messageContainer.
     *
     * @param {string[]} msg - The string array to create the message from.
     */
    CreateMessageFromStringArray (msg) {
      this._messageContainer.removeChild(this._message)
      msg.forEach(element => {
        const msgLine = document.createElement('h2')
        msgLine.textContent = element
        this._messageContainer.appendChild(msgLine)
      })
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
     * Attributes to monitor for changes.
     *
     * @returns {string[]} A string array of attributes to monitor.
     */
    static get observedAttributes () {
      return [
        'message',
        'limit']
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
      /* Initialize countdown */
      this._countdownTimeout = setTimeout(() => {
        clearTimeout(this._countdownTimeout)
        this.CountdownHasReachedZero()
      }, this._timeLimitInMS)
    }

    /**
     * Code to be triggered when the message timer has reached zero.
     */
    async CountdownHasReachedZero () {
      // Trigger exit animation.
      this._messageContainer.classList.remove('note-appear')
      this._messageContainer.classList.add('note-disappear')
      // Await exit animation before dispatching exit event.
      await this.AwaitAnimationEnd(this._messageContainer)
      this.dispatchEvent(new window.CustomEvent('messagetimerzero'))
    }

    /**
     * Called when observed attribute(s) changes.
     *
     * @param {string} name - The attribute's name.
     * @param {*} oldValue - The old value.
     * @param {*} newValue - The new value.
     */
    attributeChangedCallback (name, oldValue, newValue) {
      if (name === 'message') {
        this._message.textContent = newValue
      } else if (name === 'limit') {
        this._timeLimitInMS = newValue
      }
    }

    /**
     * Called after the element has been removed from the DOM.
     */
    disconnectedCallback () {}
  }
)
