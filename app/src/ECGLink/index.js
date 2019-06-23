import QRSDetector from '../QRSDetector'

const url = 'ws://ecg.local:81'
let last = -Infinity
export default class ECGLink extends WebSocket {
  constructor(){
    super(url)

    this.dataBuffer = []
    this.dataBufferQRS = []
    this.dataBufferMaxLength = 2000

    this.batchLength = 5
    this.batchEventCount = 0

    this.connected = false

    this.leads = {
      positive: null,
      negative: null
    }

    this.beatsLimit = 4
    this.lastQRS = 0
    this.beats = []
    this.bpm = 0

    this.addEventListener('open', this.openHandler)
    this.addEventListener('error', this.closeHandler)
    this.addEventListener('message', this.dataHandler)
    this.addEventListener('close', this.closeHandler)
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
      const positive = string.includes('+')
      const negative = string.includes('-')

      this.setLeads({
        positive,
        negative
      })
    }
  }

  readingHandler(reading){
    this.setLeads({
      positive: true,
      negative: true
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

  setLeads({positive, negative}){
    this.leads = {
      positive,
      negative
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
}

export const ecgLink = new ECGLink()
