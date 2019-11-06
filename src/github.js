/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import COMPONENT_IMAGE from '../assets/github.png'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'string',
      label: 'url',
      name: 'url'
    },
    {
      type: 'string',
      label: 'api-key',
      name: 'apiKey'
    },
    {
      type: 'number',
      label: 'period',
      name: 'period',
      placeholder: 'SECONDS'
    },
    {
      type: 'checkbox',
      label: 'with-credentials',
      name: 'withCredentials'
    }
  ],
  'value-property': 'url'
}

const WARN_NO_URL = 'Valid URL property required'

import { Component, DataSource, RectPath, Shape, warn } from '@hatiolab/things-scene'

export default class Github extends DataSource(RectPath(Shape)) {
  static get image() {
    if (!Github._image) {
      Github._image = new Image()
      Github._image.src = COMPONENT_IMAGE
    }
    return Github._image
  }

  get url() {
    return this.getState('url')
  }

  set url(url) {
    this.setState('url', url)
    this._initGithub()
  }

  get period() {
    return this.state.period * 1000
  }

  set period(period) {
    this.setState('period', period)
    this._initGithub()
  }

  get withCredentials() {
    return !!this.getState('withCredentials')
  }

  set withCredentials(withCredentials) {
    this.setState('withCredentials', withCredentials)
    this._initGithub()
  }

  get repeatTimer() {
    return this._repeatTimer
  }

  set repeatTimer(repeatTimer) {
    this._stopRepeater()
    this._repeatTimer = repeatTimer
  }

  get httpRequest() {
    return this._httpRequest
  }

  set httpRequest(httpRequest) {
    this._httpRequest = httpRequest
  }

  ready() {
    this._initGithub()
  }

  _initGithub() {
    if (!this.app.isViewMode) return

    if (!this.url) {
      warn(WARN_NO_URL)
      return
    }

    this._stopRepeater()
    this._startRepeater()
  }

  dispose() {
    super.dispose()
    this._stopRepeater()
  }

  _startRepeater() {
    this._isStarted = true

    var self = this

    // requestAnimationFrame 이 호출되지 않을 때는 ajax 호출도 하지 않도록 함.
    function _() {
      if (!self._isStarted) {
        return
      }
      self.getGithubData()

      self._repeatTimer = setTimeout(() => {
        requestAnimationFrame(_)
      }, self.period)
    }

    requestAnimationFrame(_)
  }

  _stopRepeater() {
    if (this.repeatTimer) clearTimeout(this._repeatTimer)
    this._isStarted = false
  }

  async getGithubData() {
    var { url, apiKey } = this.state

    const header = {
      Authorization: `TOKEN ${apiKey}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: header
    })

    const result = await response.json()
    console.log('result', result)
    this.data = result
  }

  _draw(context) {
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(Github.image, left, top, width, height)
  }

  ondblclick(e) {
    if (!this.url) {
      warn(WARN_NO_URL)
      return
    }
    this.getGithubData()
  }
  get nature() {
    return NATURE
  }
}

Component.register('github', Github)
