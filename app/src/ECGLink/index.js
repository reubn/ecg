import QRSDetector from '../QRSDetector'

import EventTarget from './EventTarget'

import record from './record'

const url = window.location.hash ? window.location.hash.slice(1) : 'ws://ecg.local:81'

let last = -Infinity
export default class ECGLink extends EventTarget {
  constructor(){
    super()

    this.dataBuffer = []
    this.dataBufferQRS = []
    this.dataBufferMaxLength = 1500
    this.previousTimestamp = 0
    this.timestampAdjustment = 0

    this.batchLength = 5
    this.batchEventCount = 0

    this.connected = false

    this.electrodes = {
      leftArm: null,
      rightArm: null,
      rightLeg: null
    }

    this.electrodesFilter = []
    this.electrodesFilterSize = 150

    this.beatsLimit = 4
    this.lastQRS = 0
    this.beats = []
    this.bpm = 0

    this.reconnectDelay = 5000

    this.initiateConnection()
  }

  initiateConnection(){
    if(this.blockIfHidden()) return


    this.socket = new WebSocket(url)
    this.socket.addEventListener('open', (...args) => this.openHandler(...args))
    this.socket.addEventListener('error', (...args) => this.errorHandler(...args))
    this.socket.addEventListener('message', (...args) => this.dataHandler(...args))
    this.socket.addEventListener('close', (...args) => this.closeHandler(...args))
  }

  openHandler(){
    this.connected = true

    this.dispatchEvent(new CustomEvent('open'))
  }

  errorHandler(error){
    const couldNotConnect = !this.connected

    if(couldNotConnect) setTimeout(() => this.initiateConnection(), this.reconnectDelay)
    if(error) console.error(error)

    this.closeHandler()
  }

  closeHandler(){
    this.connected = false

    this.dispatchEvent(new CustomEvent('close'))
  }

  dataHandler({data}){
    if(!this.connected) this.openHandler()

    const isData = data.includes(',')

    if(isData) this.readingHandler(data)
    else this.messageHandler(data)
  }

  messageHandler(string){
    if(string.startsWith('l')) {
      const leftArm = string.includes('+')
      const rightArm = string.includes('-')

      if(this.electrodesFilter.length === this.electrodesFilterSize) this.electrodesFilter.shift()
      this.electrodesFilter.push({leftArm, rightArm})

      if(this.electrodesFilter.find(({data}) => data)) return

      const consistant = this.electrodesFilter.every(({leftArm: leftA, rightArm: rightA}) => (leftArm === leftA) && (rightA === rightArm))

      if(consistant) {
        // Ground is likely connected
        this.setElectrodes({
          leftArm,
          rightArm,
          // rightLeg: true
        })
      } else {
        // Ground is likely disconnected
        this.setElectrodes({
          rightLeg: false
        })
      }
    }
  }

  readingHandler(data){
    const [rawTimestamp, rawReading] = data.split(',').map(s => parseInt(s, 10))

    let adjustedTimestamp = rawTimestamp + this.timestampAdjustment

    if(adjustedTimestamp < this.previousTimestamp) {
      console.log('timestamp adjusted')
      this.timestampAdjustment += 0xffffffff
      adjustedTimestamp = rawTimestamp + this.timestampAdjustment
    }
    this.previousTimestamp = adjustedTimestamp


    if(rawReading > 1000 || rawReading < 20) return

    if(this.electrodesFilter.length === this.electrodesFilterSize) this.electrodesFilter.shift()
    this.electrodesFilter.push({data: true})

    //  (219.5㏀ + 89.5㏀) / 89.5㏀ = 3.453V
    //  AD8232 SparkFun Breakout Board Gain = 1100x
    const reading = ((rawReading / 2**10) * 3.453) / 1100

    this.setElectrodes({
      leftArm: true,
      rightArm: true
    })

    if(this.dataBuffer.length === this.dataBufferMaxLength) this.dataBuffer.shift()
    this.dataBuffer.push([adjustedTimestamp, reading])

    if(this.dataBuffer.length === this.dataBufferMaxLength) this.dataBufferQRS.shift()
    const qrsResult = QRSDetector(reading, this.dataBuffer, this.onQRS)
    this.dataBufferQRS.push([adjustedTimestamp, qrsResult])

    if(qrsResult) this.onQRS(adjustedTimestamp)

    this.dispatchEvent(new CustomEvent('reading', {detail: [adjustedTimestamp, reading]}))

    this.batchEventCount = (this.batchEventCount + 1) % this.batchLength
    if(this.batchEventCount === this.batchLength - 1) this.dispatchEvent(new CustomEvent('readings', {detail: this.dataBuffer}))
  }

  setElectrodes({leftArm, rightArm, rightLeg=null}){
    this.electrodes = {
      leftArm,
      rightArm,
      rightLeg: rightLeg !== null ? rightLeg : leftArm || rightArm
    }

    this.dispatchEvent(new CustomEvent('electrodes', {detail: this.electrodes}))
  }

  onQRS(timestamp){
    const bpm = 60 / (timestamp - this.lastQRS) * 1000 * 1000
    this.lastQRS = timestamp

    if(this.beats.length === this.beatsLimit) this.beats.shift()
    this.beats.push(bpm)

    this.bpm = this.beats.length === this.beatsLimit ? Math.floor(this.beats.reduce((sum, x) => sum + x, 0) / this.beats.length) : 0

    this.dispatchEvent(new CustomEvent('beat', {detail: this.bpm}))
  }

  close(){
    return this.socket.close()
  }

  blockIfHidden() {
    if(document.hidden) {
      if(this.waitingForVisibility) return true

      this.waitForVisibility = () => {
        this.waitingForVisibility = false
        document.removeEventListener('visibilitychange', this.waitForVisibility)
        this.initiateConnection()
      }

      this.waitingForVisibility = true
      document.addEventListener('visibilitychange', this.waitForVisibility)
      return true
    }
  }
}

export const ecgLink = new ECGLink()
window.ecgLink = ecgLink
