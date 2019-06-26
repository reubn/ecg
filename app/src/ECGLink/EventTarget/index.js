import SafariIsNotSpecCompliantSoWeNeedToPolyfillEventTarget from './SafariIsNotSpecCompliantSoWeNeedToPolyfillEventTarget'

let EventTargetValid = EventTarget

try {
  new EventTargetValid()
} catch(e){
  EventTargetValid = SafariIsNotSpecCompliantSoWeNeedToPolyfillEventTarget
}

export default EventTargetValid
