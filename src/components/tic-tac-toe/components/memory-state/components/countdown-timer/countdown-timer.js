/**
 * The countdown-timer web component module.
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
  </style>
`

/**
 * Define custom element.
 */
customElements.define('countdown-timer',
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
      this.timeLimitInMS = 0
      this.counterCurrentTime = 0
      this._counterTimeout = 0
      this._updateCounter = 0
      this._counterStart = 0

      const textContent = document.createTextNode(' ')
      this._textContent = this.shadowRoot.appendChild(textContent)
    }

    /**
     * Attributes to monitor for changes.
     *
     * @returns {string[]} A string array of attributes to monitor.
     */
    static get observedAttributes () {
      return ['limit']
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {
      if (this.hasAttribute('limit')) { // If limit has been set, the element is used as a timer.
        /* Initialize countdown */
        this._counterTimeout = setTimeout(() => {
          if (this != null) {
            this.dispatchEvent(new window.CustomEvent('countdownzero'))
          }
          clearInterval(this._updateCounter)
          clearTimeout(this._counterTimeout)
        }, this.timeLimitInMS)

        /* Sets up an interval that regularly updates the element to display the
          remaining time */
        this._counterStart = new Date().getTime()
        this.counterCurrentTime = 0
        this._updateCounter = setInterval(() => {
          this.counterCurrentTime = this.timeLimitInMS - (new Date().getTime() - this._counterStart)
          this._textContent.textContent = Math.ceil(this.counterCurrentTime / 1000)
        }, 100)
      } else { // If limit has not been set, the element is used as a stopwatch instead.
        /* Sets up an interval that regularly updates the element */
        this._counterStart = new Date().getTime()
        this.counterCurrentTime = 0
        this._updateCounter = setInterval(() => {
          this.counterCurrentTime = (new Date().getTime() - this._counterStart)
          this._textContent.textContent = Math.ceil(this.counterCurrentTime / 1000)
        }, 100)
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
      if (name === 'limit') {
        this.timeLimitInMS = newValue
      }
    }

    /**
     * Called after the element has been removed from the DOM.
     */
    disconnectedCallback () {
      /* Clears any remaining event listeners when element is removed from DOM */
      clearInterval(this._updateCounter)
      clearTimeout(this._counterTimeout)
    }
  }
)
