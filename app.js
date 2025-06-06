import React, { useState, useMemo, useCallback, useEffect } from 'react';
import './App.css';

const productsData = [
  { name: 'Phone', price: 799, category: 'electronics' },
  { name: 'Headphones', price: 199, category: 'electronics' },
  { name: 'T-Shirt', price: 20, category: 'clothing' },
  { name: 'Jeans', price: 30, category: 'clothing' },
  { name: 'sunscreen', price: 15, category: 'cosmetics' },
  { name: 'moistuizer', price: 10, category: 'cosmetics' },
];

export default function App() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  const loginUser = () => {
    if (username) setLoggedIn(true);
  };

  const addToCart = useCallback((name, price) => {
    setCart(prevCart => {
      const exists = prevCart.find(item => item.name === name);
      if (exists) {
        return prevCart.map(item =>
          item.name === name ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { name, price, quantity: 1 }];
      }
    });
  }, []);

  const changeQuantity = useCallback((name, count) => {
    setCart(prevCart => {
      return prevCart.flatMap(item => {
        if (item.name === name) {
          const newQty = item.quantity + count;
          return newQty > 0 ? { ...item, quantity: newQty } : [];
        }
        return item;
      });
    });
  }, []);

  const removeItem = useCallback((name) => {
    setCart(prevCart => prevCart.filter(item => item.name !== name));
  }, []);

  const checkout = useCallback(() => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    if (window.confirm("Do you want to proceed to payment?")) {
      alert("Payment successful! Thank you for your purchase.");
      setCart([]);
    }
  }, [cart]);

  const filteredProducts = useMemo(() => {
    return productsData.filter(product => {
      const matchCategory = category === 'all' || product.category === category;
      const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [category, searchTerm]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart)); // JSON Turns string back into usable cart data
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart)); //JSON  Turns cart into a string to store AND useEffect Save cart to localStorage whenever it changes
  }, [cart]);

  useEffect(() => {
    if (loggedIn) {
      console.log(`User "${username}" has logged in.`); // Log when user logs in
    }
  }, [loggedIn]);

  useEffect(() => {  // Clear search & category filters when user logs out
    if (!loggedIn) {
      setSearchTerm('');
      setCategory('all');
    }
  }, [loggedIn]);

  useEffect(() => {
    if (loggedIn && cart.length === 0) {
      console.log('Cart is now empty.');
    }
  }, [cart, loggedIn]);

  return (
    <div className="app">
      <header>
        <h1>🛒 E-commerce Store</h1>
      </header>

      {!loggedIn ? (
        <div id="login">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={loginUser}>Login</button>
        </div>
      ) : (
        <div id="welcome">Welcome to your shopping point, {username}!</div>
      )}

      <nav>
        <input
          type="text"
          placeholder="Search products"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select onChange={(e) => setCategory(e.target.value)} value={category}>
          <option value="all">All</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="cosmetics">Cosmetics</option>
          
        </select>
      </nav>

      <section id="products">
        {filteredProducts.map((product) => (
          <div className="product" key={product.name} data-category={product.category}>
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button onClick={() => addToCart(product.name, product.price)}>Add to Cart</button>
          </div>
        ))}
      </section>

      <section id="cart">
        <h2> Cart </h2>
        {cart.map(item => (
          <div className="cart-item" key={item.name}>
            <div className="cart-controls">
              <span>
                {item.name} - ${item.price} x {item.quantity} = ${(
                  item.price * item.quantity
                ).toFixed(2)}
              </span>
            </div>
            <div className="cart-controls">
              <button onClick={() => changeQuantity(item.name, -1)}>−</button>
              <button onClick={() => changeQuantity(item.name, 1)}>+</button>
              <button onClick={() => removeItem(item.name)}>Remove</button>
            </div>
          </div>
        ))}
        <div className="total">Total: ${total.toFixed(2)}</div>
        <button onClick={checkout} style={{ marginTop: '20px' }}>Checkout</button>
      </section>
    </div>
  );
}
