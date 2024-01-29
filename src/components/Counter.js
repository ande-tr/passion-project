import React, { useEffect, useState } from 'react';

function Counter({ onTimerFinish}) {
    const [timer, setTimer] = useState(5);
    
    useEffect(() => {
        if (timer > 0) {
            const timerInterval = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(timerInterval);
                        onTimerFinish();
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            const timeoutId = setTimeout(() => {
                clearInterval(timerInterval);
                onTimerFinish();
            }, 3000);

            return () => {
                clearInterval(timerInterval);
                clearTimeout(timeoutId);
            };
        }
    }, [timer, onTimerFinish]);

    return (
        <div className={timer > 0 ? 'timer-wrapper counting' : 'timer-wrapper recording'}>
            {timer > 0 && (
                <div>Recording will start in <span className='bold-text'>{timer}</span> second(s).</div>
            )}
            {timer <= 0 && (
                <div>Recording in progress!</div>
            )}
        </div>
    );
}

export default Counter;