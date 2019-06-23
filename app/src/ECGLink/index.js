import QRSDetector from '../QRSDetector'

const url = 'ws://ecg.local:81'

export default class ECGLink extends WebSocket {
  constructor(){
    super(url)

    this.dataBuffer = []
    this.dataBufferTest = []
    this.dataBufferMaxLength = 2000

    this.batchLength = 5
    this.batchEventCount = 0

    this.connected = false

    this.leads = {
      positive: null,
      negative: null
    }

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

    if(this.dataBuffer.length === this.dataBufferMaxLength) this.dataBuffer.shift()
    this.dataBuffer.push(reading)

    if(this.dataBuffer.length === this.dataBufferMaxLength) this.dataBufferTest.shift()
    this.dataBufferTest.push(QRSDetector(reading, this.dataBufferTest))

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
}

export const ecgLink = new ECGLink()
