import { useState, useRef, useMemo } from 'react';
import { flushSync } from 'react-dom';
import './App.css';
import Slider from 'react-slick';

function delay(delayInMs) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, delayInMs);
  });
}

function getNumOfDigits(number) {
  return String(number).length;
}

function getRandomNumberInRange(min, max) {
  const randomNumber = Math.floor(Math.random() * max);
  if (randomNumber < min) {
    return getRandomNumberInRange(min, max);
  } else {
    return randomNumber;
  }
}

function App() {
  const [valueRange, setValueRange] = useState({ min: 0, max: 100 });
  const [listInterval, setListInterval] = useState([]);
  const [result, setResult] = useState(null);

  const sliderRef = useRef([]);
  sliderRef.current = [];

  const listDigits = Array.from({ length: 10 }, (_, i) => i);

  const numOfDigits = useMemo(
    () => getNumOfDigits(valueRange.max),
    [valueRange.max]
  );

  const onStart = async () => {
    setResult(null);
    if (Number(valueRange.max) <= Number(valueRange.min)) {
      return;
    }
    const intervalStack = [];
    for (let i = 0; i < numOfDigits; i++) {
      intervalStack.push(setInterval(() => sliderRef.current[i].slickNext()));
      flushSync(() => {
        setListInterval(intervalStack);
      });
      await delay(500);
    }
  };

  const onStop = async () => {
    let resultInString = result;
    if (!result) {
      const random = getRandomNumberInRange(valueRange.min, valueRange.max);
      const resultTemp =
        String('0').repeat(numOfDigits - String(random).length) +
        String(random);
      resultInString = resultTemp;
      setResult(resultTemp);
    }
    const lastIntervalIndex = listInterval.length - 1;
    clearInterval(listInterval[lastIntervalIndex]);
    await delay(100);
    sliderRef.current[lastIntervalIndex].slickGoTo(
      Number(resultInString[lastIntervalIndex])
    );
    setListInterval((prev) => {
      prev.pop();
      return prev;
    });
    // for (let i = listInterval.length - 1; i > -1; i--) {
    //   await delay(500);
    //   clearInterval(listInterval[i]);
    //   await delay(100);
    //   sliderRef.current[i].slickGoTo(Number(resultInString[i]));
    // }
    // setListInterval([]);
  };

  console.log(listInterval);

  const onChangeRange = ({ target }) => {
    setValueRange((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  };

  const addToRefs = (el) => {
    if (el && !sliderRef.current.includes(el)) {
      sliderRef.current.push(el);
    }
  };

  const isDrawing = listInterval.length > 0;

  const settings = {
    infinite: true,
    speed: 50,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrow: false,
    vertical: true,
    accessibility: false,
    swipe: false,
  };

  return (
    <div className='app'>
      <div className='container'>
        {Array.from({ length: numOfDigits }, (_, i) => i).map((_) => (
          <div className='display-digit-box' key={_}>
            <div className='list-digit'>
              {numOfDigits > 0 && (
                <Slider {...settings} ref={addToRefs}>
                  {listDigits.map((digit) => (
                    <div key={digit}>
                      <div className='digit-box'>{digit}</div>
                    </div>
                  ))}
                </Slider>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className='controller'>
        <div>
          <div className='input-block'>
            <label>From:</label>
            <input
              name='min'
              type='number'
              onChange={onChangeRange}
              value={valueRange.min}
            />
          </div>
          <div className='input-block'>
            <label>To:</label>
            <input
              name='max'
              type='number'
              onChange={onChangeRange}
              value={valueRange.max}
            />
          </div>
        </div>
        {isDrawing ? (
          <button onClick={onStop}>Stop</button>
        ) : (
          <button onClick={onStart}>Start</button>
        )}
      </div>
    </div>
  );
}

export default App;
