
import { useCallback, useEffect, useState } from 'react'
import './App.css'
import Card from './components/card/card'
import Cart from './components/cart/cart'
import { getData } from './constants/db'

const course = getData()

const telegram = window.Telegram.WebApp


const App = () => {
  const [cartItems, setCartItems] = useState([])

  useEffect (() => {
    telegram.ready()
  })

  const onAddItem = item => {
    const exisItem = cartItems.find(c => c.id === item.id)

    if (exisItem) {
      const newData = cartItems.map(c => 
        c.id === item.id 
          ? { ...exisItem, quantity: exisItem.quantity + 1 } 
          : c
      )
      setCartItems(newData)
    } else {
      const newData = [...cartItems, { ...item, quantity: 1 }]
      setCartItems(newData)
    }
  }

  const onRemoveItem = item => {
    const exisItem = cartItems.find(c => c.id === item.id)

    if (exisItem.quantity === 1) {
      const newData = cartItems.filter(c => c.id !== item.id)
      setCartItems(newData)
    } else {
      const newData = cartItems.map(c =>
        c.id === item.id
          ? { ...exisItem, quantity: exisItem.quantity - 1 }
          : c
      )
      setCartItems(newData)
    }
  }

  const onCheckout = () => {
    telegram.MainButton.text = 'Sotib olish :)'
    telegram.MainButton.show()
  }

  const onSendData = useCallback(() => {

    const queryID = telegram.initDataUnsafe?.query_id;
    if(queryID){
      fetch("https://localhost:8000/web-data", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: cartItems,
          queryID: queryID,
        }),
      });
    }else{
      telegram.sendData(JSON.stringify({products: cartItems, queryID: queryID}))
    }
  }, [cartItems]);

  useEffect(() => {
    telegram.onEvent('mainButtonClicked', onSendData)

    return () => telegram.offEvent('mainButtonClicked', onSendData)
  }, [onSendData]);

  return (
    <>
      <h1 className='heading'>Bizning Kurslar</h1>
      <Cart cartItems={cartItems} onCheckout={onCheckout} />
      <div className='carts__container'>
        {course.map(course => (
          <Card
            key={course.id}
            course={course}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>
    </>
  )
}

export default App
