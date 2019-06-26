import React from 'react'
import {electrode} from './style'

export default ({rightArm, leftArm, rightLeg, ...props}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86.8 129.1" {...props}>
    <path d="M78.6 97.4c-.7-2.1-1.3-8.7-1.3-8.7-.2-7.8-2.2-11.2-2.2-11.2-3.3-5.3-3.9-15.1-3.9-15.1l-.1-16.6c-1.2-11.3-9.5-11.4-9.5-11.4-8.5-1.3-9.6-4-9.6-4-1.8-2.6-.8-7.5-.8-7.5 1.5-1.2 2.1-4.4 2.1-4.4 2.5-1.9 2.3-4.7 1.2-4.6-.9 0-.7-.7-.7-.7C55.3.6 44.2 0 44.2 0h-1.7S31.4.6 33 13.1c0 0 .2.8-.7.7-1.1 0-1.2 2.7 1.2 4.6 0 0 .6 3.2 2.1 4.4 0 0 1 4.9-.8 7.5 0 0-1.2 2.7-9.6 4 0 0-8.4.1-9.5 11.4l-.2 16.6s-.6 9.9-3.9 15.1c0 0-1.9 3.4-2.1 11.2 0 0-.6 6.6-1.3 8.7-.5 1.2-2 3.3-3.2 4.8-2.4 3-6.5 9.2-4.3 10 0 0 1.7.2 3.9-4.3 0 0 0 1.7-1.8 6.6-.3.9-1.8 5.6.6 3.9 0 0 1.1-.8 2.6-5.6 0 0-.8 8.1.1 8.5 1.1.6 1.8-1 2.3-8.1 0 0 .5-2.3.8 6.4 0 .5.7 2.7 1.6.8.8-1.6.4-5.9.4-7.3 0 0 1 5.5 1.9 5.5 0 0 1.1 1.3.6-5.6-.1-1.1.3-3.4.4-4.1l.1-2.6-.3-4.3c0-.3 1.1-4.4 3.9-8.7 0 0 5.9-10.5 5.5-17.3 0 0-.1-6.5 2.3-10.2 0 0 1.7 18.5.5 23.7 0 0-5.3 12.8-4.1 22.3l1.8 14.5a3.3 3.3 0 0 0 3.3 2.8h11.6c1.7 0 3.1-1.3 3.3-3 .4-3.9.6-7 .5-8.2l1 .4c.7 0 1.2-.4 1.2-.4-.1 1.2.1 4.4.5 8.2.2 1.7 1.6 3 3.3 3H60c1.6 0 3-1.2 3.3-2.8l1.8-14.5A54.4 54.4 0 0 0 61 89.4c-1.2-5.2.5-23.7.5-23.7 2.4 3.7 2.3 10.2 2.3 10.2a41.8 41.8 0 0 0 5.5 17.3c2.8 4.3 3.9 8.4 3.9 8.7l-.3 4.3.1 2.6c0 .7.4 3 .4 4.1-.4 6.9.6 5.6.6 5.6.9 0 1.9-5.5 1.9-5.5 0 1.4-.3 5.7.4 7.3.9 1.9 1.6-.3 1.6-.8.2-8.7.8-6.4.8-6.4.5 7.1 1.1 8.7 2.3 8.1.9-.4.1-8.5.1-8.5 1.5 4.8 2.6 5.6 2.6 5.6 2.4 1.7.9-3 .6-3.9-1.8-4.9-1.8-6.6-1.8-6.6 2.2 4.4 3.9 4.3 3.9 4.3 2.2-.7-1.9-7-4.3-10-1.4-1.4-3-3.4-3.5-4.7z"/>

    <path d="M26.8 39.3a3.1 3.1 0 0 0-3.1 3.1c0 1.7 1.4 3.1 3.1 3.1 1.7 0 3.1-1.4 3.1-3.1 0-1.7-1.4-3.1-3.1-3.1zm0 4.9c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8z" className={electrode}/>
    {rightArm ? null : <path d="M26.1 40.5h1.3v3.8h-1.3z" className={electrode} transform="rotate(-44 26.8 42.4)"/>}
    {/*rightArm ? <circle className={electrode} cx="26.8" cy="42.4" r="0.7"/> : null*/}

    <path d="M59.2 39.3a3.1 3.1 0 0 0-3.1 3.1c0 1.7 1.4 3.1 3.1 3.1s3.1-1.4 3.1-3.1c.1-1.7-1.3-3.1-3.1-3.1zm0 4.9c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8z" className={electrode}/>
    {leftArm ? null : <path d="M58.6 40.5h1.3v3.8h-1.3z" className={electrode} transform="rotate(-44 59.2 42.4)"/>}
    {/*leftArm ? <circle className={electrode} cx="59.2" cy="42.4" r="0.7"/> : null*/}

    <path d="M26.3 105.5a3.1 3.1 0 0 0-3.1 3.1c0 1.7 1.4 3.1 3.1 3.1 1.7 0 3.1-1.4 3.1-3.1 0-1.7-1.4-3.1-3.1-3.1zm0 5c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8z" className={electrode}/>
    {rightLeg ? null : <path d="M25.7 106.7H27v3.8h-1.3z" className={electrode} transform="rotate(-44 26.3 108.6)"/>}
    {/*rightLeg ? <circle className={electrode} cx="26.3" cy="108.6" r="0.7"/> : null*/}
  </svg>
)
