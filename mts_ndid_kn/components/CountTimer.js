import React, { useEffect, useState } from "react";

export default function CountTimer({ startTs=1657266900.123 }) {

    // const [currentDate, setCurrentDate] = useState(new Date())
    // useEffect(() => setCurrentDate(new Date()), [])
    
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
            <span>
                {timeLeft[interval]} {interval}{" "}
            </span>
        )
    })

    return (<> {timerComponents.length? timerComponents : <span> 🚫 Time's up! 🚫 </span>}</>)
}