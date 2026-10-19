import { useEffect, useState, useCallback } from 'react';
import './App.css';
import { formatPaise } from './utils.js';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  deliveryZone: string;
  isOpen: boolean;
  cuisine: string;
  rating: number;
}

interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  pricePaise: number;
  available: boolean;
  category: string;
}

export default function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuLoading, setMenuLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cart state for customer ordering journey
  const [cart, setCart] = useState<{ [itemId: string]: { item: MenuItem; quantity: number } }>({});

  const selectRestaurant = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setMenuLoading(true);
    fetch(`/api/restaurants/${restaurant.id}/menu`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load menu`);
        return res.json();
      })
      .then((data) => {
        setMenuItems(data.items || []);
        setMenuLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load menu items', err);
        setMenuLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch('/api/restaurants')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load restaurants`);
        return res.json();
      })
      .then((data) => {
        const list: Restaurant[] = data.restaurants || [];
        setRestaurants(list);
        if (list.length > 0) {
          selectRestaurant(list[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load restaurants', err);
        setError('Could not connect to restaurant service. Please verify service status.');
        setLoading(false);
      });
  }, [selectRestaurant]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const current = prev[item.id]?.quantity || 0;
      return {
        ...prev,
        [item.id]: { item, quantity: current + 1 }
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const current = prev[itemId]?.quantity || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: { ...prev[itemId], quantity: current - 1 }
      };
    });
  };

  const cartTotalPaise = Object.values(cart).reduce(
    (sum, entry) => sum + entry.item.pricePaise * entry.quantity,
    0
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-logo">
          <span className="brand-icon">🍛</span>
          <div>
            <h1>Tuckin</h1>
            <p className="subtitle">Production DevOps & Cloud Microservices Showcase</p>
          </div>
        </div>
        <div className="delivery-badge">
          <span className="pulse-indicator"></span>
          <span>Delivery Zone: <strong>Central Hub (Live)</strong></span>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <strong>Connection notice:</strong> {error}
        </div>
      )}

      <main className="main-content">
        <section className="restaurants-section">
          <div className="section-title">
            <h2>Partner Restaurants</h2>
            <span className="count-pill">{restaurants.length} Available</span>
          </div>

          {loading ? (
            <div className="loading-state">Loading restaurants...</div>
          ) : (
            <div className="restaurant-grid">
              {restaurants.map((rest) => (
                <article
                  key={rest.id}
                  className={`restaurant-card ${selectedRestaurant?.id === rest.id ? 'active' : ''}`}
                  onClick={() => selectRestaurant(rest)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedRestaurant?.id === rest.id}
                >
                  <div className="card-top">
                    <h3>{rest.name}</h3>
                    <span className="rating-badge">★ {rest.rating}</span>
                  </div>
                  <p className="cuisine">{rest.cuisine}</p>
                  <p className="description">{rest.description}</p>
                  <div className="card-footer">
                    <span className="zone-tag">{rest.deliveryZone}</span>
                    <span className="status-tag open">{rest.isOpen ? 'Open Now' : 'Closed'}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="menu-section">
          {selectedRestaurant ? (
            <>
              <div className="menu-header">
                <div>
                  <h2>{selectedRestaurant.name} — Menu</h2>
                  <p className="menu-subtitle">{selectedRestaurant.description}</p>
                </div>
              </div>

              {menuLoading ? (
                <div className="loading-state">Fetching authentic delicacies...</div>
              ) : (
                <div className="menu-grid">
                  {menuItems.map((item) => (
                    <article key={item.id} className="menu-item-card">
                      <div className="item-details">
                        <div className="item-header">
                          <span className="category-pill">{item.category}</span>
                          <h4>{item.name}</h4>
                        </div>
                        <p className="item-desc">{item.description}</p>
                        <div className="item-price">{formatPaise(item.pricePaise)}</div>
                      </div>
                      <div className="item-actions">
                        {cart[item.id] ? (
                          <div className="cart-counter">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="qty">{cart[item.id].quantity}</span>
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-add"
                            onClick={() => addToCart(item)}
                            disabled={!item.available}
                          >
                            {item.available ? 'Add +' : 'Sold Out'}
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">Select a restaurant to view its fresh menu.</div>
          )}
        </section>

        <aside className="cart-sidebar">
          <div className="cart-header">
            <h3>Your Order</h3>
            <span className="cart-badge">{Object.values(cart).reduce((a, b) => a + b.quantity, 0)} items</span>
          </div>

          <div className="cart-items">
            {Object.keys(cart).length === 0 ? (
              <p className="empty-cart-text">Your basket is empty. Browse items to add.</p>
            ) : (
              Object.values(cart).map(({ item, quantity }) => (
                <div key={item.id} className="cart-row">
                  <div className="cart-row-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-unit">{formatPaise(item.pricePaise)} × {quantity}</span>
                  </div>
                  <span className="cart-row-total">{formatPaise(item.pricePaise * quantity)}</span>
                </div>
              ))
            )}
          </div>

          {Object.keys(cart).length > 0 && (
            <div className="cart-summary">
              <div className="summary-row total">
                <span>Total (Server Calculated)</span>
                <span>{formatPaise(cartTotalPaise)}</span>
              </div>
              <p className="calc-note">* Final pricing is validated in integer paise by Order Service</p>
              <button
                type="button"
                className="btn-checkout"
                onClick={() => alert('Order placement flow starts in Milestone 3!')}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
