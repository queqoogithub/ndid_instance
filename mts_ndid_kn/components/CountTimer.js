import React, { useEffect, useState } from "react";

export default function CountTimer({ startTs }) {

    // const [currentDate, setCurrentDate] = useState(new Date())
    // useEffect(() => setCurrentDate(new Date()), [])
    
    //console.log('start counting with time: ', startTs)

    const currentDate = Date.now() //new Date().getTime()

    const calculateTime = () => {
        
        let timeLeft = {}
        // Warning: Just change timezone to UTC with toLocalString for according between lib: new Date() & server time 
        //let currentTs = parseInt(currentDate.getTime().toLocaleString("th-TH", { timeZone: "UTC" }) / 1000)
        let currentTs = parseInt(currentDate / 1000)
        let totalSecond = currentTs - parseInt(startTs)
        
        // Time ramaining min : sec -> TODO ... if (3600 - totalSecond) > 0 
        if (totalSecond >= 3600) { return {}}

        timeLeft = { 
            minutes: 59 - parseInt(totalSecond / 60),
            seconds: parseInt(3600 - totalSecond) % 60, 
        }
        //timeLeft = { seconds: parseInt(currentDate.getTime() / 1000), }
        return timeLeft
        
    }

    const [timeLeft, setTimeLeft] = useState(calculateTime());

    useEffect(() => {
        setTimeout(() => {
            setTimeLeft(calculateTime())
        }, 1000);
    })

    const timerComponents = []

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval]) {
            return
        }

        timerComponents.push(
            <span key={interval} className='mx-5 px-4 py-2 text-[65px] font-medium bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 ring-2 ring-blue-200/50 rounded-lg'>
                {/* {timeLeft[interval]} {interval}{" "} */}
                {timeLeft[interval]}
            </span>
        )
    })

    // /console.log('timerComponents = ', timerComponents)

    return (<> {timerComponents.length ? timerComponents : <span> 🚫 Time's up! 🚫 </span>} </>)
}