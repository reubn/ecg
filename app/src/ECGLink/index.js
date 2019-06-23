import QRSDetector from '../QRSDetector'
import SafariIsNotSpecCompliantSoWeNeedToPolyfillEventTarget from './SafariIsNotSpecCompliantSoWeNeedToPolyfillEventTarget'

let EventTargetValid = EventTarget

try {
  new EventTargetValid()
} catch(e){
  EventTargetValid = SafariIsNotSpecCompliantSoWeNeedToPolyfillEventTarget
}

const url = window.location.hash ? window.location.hash.slice(1) : 'ws://ecg.local:81'

let last = -Infinity
export default class ECGLink extends EventTargetValid {
  constructor(){
    super()

    this.socket = new WebSocket(url)
    this.dataBuffer = []
    this.dataBufferQRS = []
    this.dataBufferMaxLength = 1000

    this.batchLength = 5
    this.batchEventCount = 0

    this.connected = false

    this.leads = {
      leftArm: null,
      rightArm: null,
      rightLeg: null
    }

    this.leadsFilter = []
    this.leadsFilterSize = 10

    this.beatsLimit = 4
    this.lastQRS = 0
    this.beats = []
    this.bpm = 0

    this.socket.addEventListener('open', (...args) => this.openHandler(...args))
    this.socket.addEventListener('error', (...args) => this.closeHandler(...args))
    this.socket.addEventListener('message', (...args) => this.dataHandler(...args))
    this.socket.addEventListener('close', (...args) => this.closeHandler(...args))
  }

  openHandler(){
    this.connected = true
  }

  closeHandler(error){
    if(error) console.error(error)

    this.connected = false
  }

  dataHandler({data}){
    const reading = parseInt(data, 10)

    if(isNaN(reading)) this.messageHandler(data)
    else this.readingHandler(reading)
  }

  messageHandler(string){
    if(string.startsWith('l')) {
      const leftArm = string.includes('+')
      const rightArm = string.includes('-')

      if(this.leadsFilter.length === this.leadsFilterSize) this.leadsFilter.shift()
      this.leadsFilter.push({leftArm, rightArm})

      const consistent = this.leadsFilter.every(({leftArm: lA, rightArm: rA, lowReading, data}) => lowReading || data || ((lA === leftArm) && rA === rightArm))
      if(consistent) this.setLeads({
        leftArm,
        rightArm,
        rightLeg: !this.leadsFilter.find(({lowReading}) => lowReading) && this.leadsFilter.find(({data}) => data)
      })
    }
  }

  readingHandler(reading){
    if(reading > 1000 || reading < 20) {
      if(this.leadsFilter.length === this.leadsFilterSize) this.leadsFilter.shift()
      this.leadsFilter.push({lowReading: true})
      return
    }
    if(this.leadsFilter.length === this.leadsFilterSize) this.leadsFilter.shift()
    this.leadsFilter.push({data: true})

    if(this.leadsFilter.every(({leftArm: lA, rightArm: rA, lowReading, data}) => lowReading || data || ((lA === leftArm) && rA === rightArm))) this.setLeads({
      leftArm: true,
      rightArm: true
    })

    const now = performance.now()
    // console.log(Math.round(1000 / (now - last)))
    last = now

    if(this.dataBuffer.length === this.dataBufferMaxLength) this.dataBuffer.shift()
    this.dataBuffer.push(reading)

    if(this.dataBuffer.length === this.dataBufferMaxLength) this.dataBufferQRS.shift()
    const qrsResult = QRSDetector(reading, this.dataBuffer, this.onQRS)
    this.dataBufferQRS.push(qrsResult)

    if(qrsResult) this.onQRS()

    this.dispatchEvent(new CustomEvent('reading', {detail: reading}))

    this.batchEventCount = (this.batchEventCount + 1) % this.batchLength
    if(this.batchEventCount === this.batchLength - 1) this.dispatchEvent(new CustomEvent('readings', {detail: {data: this.dataBuffer, maxLength: this.dataBufferMaxLength}}))
  }

  setLeads({leftArm, rightArm, rightLeg=null}){
    this.leads = {
      leftArm,
      rightArm,
      rightLeg: rightLeg !== null ? rightLeg : leftArm || rightArm
    }

    this.dispatchEvent(new CustomEvent('leads', {detail: this.leads}))
  }

  onQRS(){
    const now = performance.now()
    const bpm = 60 / (now - this.lastQRS) * 1000
    this.lastQRS = now

    if(this.beats.length === this.beatsLimit) this.beats.shift()
    this.beats.push(bpm)

    this.bpm = Math.floor(this.beats.reduce((sum, x) => sum + x, 0) / this.beats.length)

    this.dispatchEvent(new CustomEvent('beat', {detail: this.bpm}))
  }

  close(){
    return this.socket.close()
  }
}

export const ecgLink = new ECGLink()
window.ecgLink = ecgLink
