import { useEffect, useState } from "react";



import "./App.css";







const API_BASE = "http://localhost:8080";







function App() {



  const [products, setProducts] = useState([]);



  const [loadingProducts, setLoadingProducts] = useState(true);



  const [productError, setProductError] = useState("");







  const [cart, setCart] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All categories");

  const [inStockOnly, setInStockOnly] = useState(false);



  const productCategories = [

    "All categories",

    ...new Set(products.map((product) => product.category || "Handmade")),

  ];



  const filteredProducts = products.filter((product) => {

    const query = searchQuery.trim().toLowerCase();

    const searchableText = `${product.name || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();

    const matchesSearch = !query || searchableText.includes(query);

    const matchesCategory = selectedCategory === "All categories" ||

      (product.category || "Handmade") === selectedCategory;

    const matchesStock = !inStockOnly || Number(product.stock) > 0;

    return matchesSearch && matchesCategory && matchesStock;

  });







  // ================= CUSTOM ORDERS =================



  const [showCustomOrder, setShowCustomOrder] = useState(false);



  const [customOrderLoading, setCustomOrderLoading] = useState(false);



  const [customOrderError, setCustomOrderError] = useState("");



  const [customOrderSuccess, setCustomOrderSuccess] = useState(false);







  const [customOrderForm, setCustomOrderForm] = useState({



    customerName: "",



    mobile: "",



    email: "",



    productType: "",



    description: "",



    budget: "",



  });







  const handleCustomOrderSubmit = async (event) => {



    event.preventDefault();



    setCustomOrderLoading(true);



    setCustomOrderError("");



    setCustomOrderSuccess(false);







    try {



      const response = await fetch(



        "http://localhost:8080/api/custom-orders",



        {



          method: "POST",



          headers: {



            "Content-Type": "application/json",



          },



          body: JSON.stringify({



            ...customOrderForm,



            budget: customOrderForm.budget



              ? Number(customOrderForm.budget)



              : null,



          }),



        }



      );







      if (!response.ok) {



        const errorText = await response.text();



        throw new Error(errorText || "Could not submit your request.");



      }







      setCustomOrderSuccess(true);



      setCustomOrderForm({



        customerName: "",



        mobile: "",



        email: "",



        productType: "",



        description: "",



        budget: "",



      });



    } catch (error) {



      setCustomOrderError(



        "Could not submit your request. Please check that the backend is running and try again."



      );



      console.error("Custom order error:", error);



    } finally {



      setCustomOrderLoading(false);



    }



  };







  const [showCheckout, setShowCheckout] = useState(false);







  const [checkoutForm, setCheckoutForm] = useState({



    fullName: "",



    mobile: "",



    email: "",



    address: "",



    city: "",



    state: "",



    pinCode: "",



  });







  const [placingOrder, setPlacingOrder] = useState(false);



  const [orderPlaced, setOrderPlaced] = useState(false);



  const [orderId, setOrderId] = useState(null);



  const [orderError, setOrderError] = useState("");







  useEffect(() => {



    loadProducts();



  }, []);







  async function loadProducts() {



    try {



      setLoadingProducts(true);







      const response = await fetch(`${API_BASE}/api/products`);







      if (!response.ok) {



        throw new Error("Failed to load products");



      }







      const data = await response.json();



      setProducts(data);



      setProductError("");



    } catch (error) {



      console.error("Product loading error:", error);



      setProductError(



        "Unable to load products. Please make sure the backend is running."



      );



    } finally {



      setLoadingProducts(false);



    }



  }







  function addToCart(product) {



    if (Number(product.stock) <= 0) {



      alert("This product is out of stock.");



      return;



    }







    setCart((currentCart) => {



      const existingItem = currentCart.find(



        (item) => item.id === product.id



      );







      if (existingItem) {



        if (existingItem.quantity >= Number(product.stock)) {



          alert("You cannot add more than the available stock.");



          return currentCart;



        }







        return currentCart.map((item) =>



          item.id === product.id



            ? { ...item, quantity: item.quantity + 1 }



            : item



        );



      }







      return [...currentCart, { ...product, quantity: 1 }];



    });



  }







  function increaseQuantity(productId) {



    setCart((currentCart) =>



      currentCart.map((item) => {



        if (item.id !== productId) {



          return item;



        }







        if (item.quantity >= Number(item.stock)) {



          alert("You cannot add more than the available stock.");



          return item;



        }







        return { ...item, quantity: item.quantity + 1 };



      })



    );



  }







  function decreaseQuantity(productId) {



    setCart((currentCart) =>



      currentCart



        .map((item) =>



          item.id === productId



            ? { ...item, quantity: item.quantity - 1 }



            : item



        )



        .filter((item) => item.quantity > 0)



    );



  }







  function removeFromCart(productId) {



    setCart((currentCart) =>



      currentCart.filter((item) => item.id !== productId)



    );



  }







  const cartCount = cart.reduce(



    (total, item) => total + item.quantity,



    0



  );







  const cartTotal = cart.reduce(



    (total, item) => total + Number(item.price) * item.quantity,



    0



  );







  function updateForm(field, value) {



    setCheckoutForm((current) => ({



      ...current,



      [field]: value,



    }));



  }







  function openCheckout() {



    if (cart.length === 0) {



      alert("Your cart is empty.");



      return;



    }







    setOrderError("");



    setShowCheckout(true);







    setTimeout(() => {



      document



        .getElementById("checkout")



        ?.scrollIntoView({ behavior: "smooth" });



    }, 50);



  }







  function closeCheckout() {



    setShowCheckout(false);



    setOrderError("");



  }







  async function placeOrder() {



    setOrderError("");







    if (!checkoutForm.fullName.trim()) {



      setOrderError("Please enter your full name.");



      return;



    }







    if (!/^\d{10}$/.test(checkoutForm.mobile)) {



      setOrderError("Please enter a valid 10-digit mobile number.");



      return;



    }







    if (!checkoutForm.email.trim()) {



      setOrderError("Please enter your email address.");



      return;



    }







    if (!checkoutForm.address.trim()) {



      setOrderError("Please enter your delivery address.");



      return;



    }







    if (!checkoutForm.city.trim()) {



      setOrderError("Please enter your city.");



      return;



    }







    if (!checkoutForm.state.trim()) {



      setOrderError("Please enter your state.");



      return;



    }







    if (!/^\d{6}$/.test(checkoutForm.pinCode)) {



      setOrderError("Please enter a valid 6-digit PIN code.");



      return;



    }







    if (cart.length === 0) {



      setOrderError("Your cart is empty.");



      return;



    }







    try {



      setPlacingOrder(true);







      const orderData = {



        fullName: checkoutForm.fullName.trim(),



        mobile: checkoutForm.mobile,



        email: checkoutForm.email.trim(),



        address: checkoutForm.address.trim(),



        city: checkoutForm.city.trim(),



        state: checkoutForm.state.trim(),



        pinCode: checkoutForm.pinCode,



        subtotal: cartTotal,



        deliveryCharge: 0,



        totalAmount: cartTotal,



        status: "PLACED",



      };







      const response = await fetch(`${API_BASE}/api/orders`, {



        method: "POST",



        headers: {



          "Content-Type": "application/json",



        },



        body: JSON.stringify(orderData),



      });







      if (!response.ok) {



        throw new Error("Order could not be placed.");



      }







      const savedOrder = await response.json();







      setOrderId(savedOrder.id);



      setOrderPlaced(true);



      setShowCheckout(false);



      setCart([]);







      setCheckoutForm({



        fullName: "",



        mobile: "",



        email: "",



        address: "",



        city: "",



        state: "",



        pinCode: "",



      });







      window.scrollTo({ top: 0, behavior: "smooth" });



    } catch (error) {



      console.error("Order placement error:", error);



      setOrderError("Unable to place your order. Please try again.");



    } finally {



      setPlacingOrder(false);



    }



  }







  function startShopping() {



    setOrderPlaced(false);



    setOrderId(null);







    setTimeout(() => {



      document



        .getElementById("shop")



        ?.scrollIntoView({ behavior: "smooth" });



    }, 50);



  }







  function imageUrl(product) {



    if (!product.imageUrl) {



      return "";



    }







    if (product.imageUrl.startsWith("http")) {



      return product.imageUrl;



    }







    return `http://localhost:5173${product.imageUrl}`;



  }







  if (orderPlaced) {



    return (



      <div className="app">



        <header className="navbar">



          <a href="#home" className="logo">



            <span className="logo-icon">🌙</span>



            <span>LunaLoop</span>



          </a>



        </header>







        <main>



          <section className="order-success">



            <div className="success-card">



              <div className="success-icon">✓</div>



              <p className="small-heading">ORDER CONFIRMED</p>



              <h1>Thank You! 💜</h1>







              <p>



                Your LunaLoop order has been placed successfully.



              </p>







              <div className="success-order-id">



                <span>Order ID</span>



                <strong>#{orderId}</strong>



              </div>







              <p className="success-note">



                We'll use the contact details you provided to keep you



                updated about your order.



              </p>







              <button className="shop-button" onClick={startShopping}>



                Continue Shopping



              </button>



            </div>



          </section>



        </main>







        <footer>



          <div className="footer-logo">🌙 LunaLoop</div>



          <p className="footer-tagline">



            Small stitches. Big happiness.



          </p>



          <p className="copyright">



            © 2026 LunaLoop. Made with 🧶 & love.



          </p>



        </footer>



      </div>



    );



  }







  return (



    <div className="app">



      <aside className="dashboard-sidebar">

        <a href="#home" className="logo">

          <span className="logo-icon">🌙</span>

          <span>LunaLoop</span>

        </a>

        <div className="sidebar-profile">

          <div className="sidebar-avatar">🌷</div>

          <strong>Handmade with love</strong>

          <span>Small Stitches • Big Happiness</span>

        </div>

        <p className="sidebar-label">YOUR STORE</p>

        <nav className="navigation">

          <a href="#home"><span>⌂</span> Dashboard</a>

          <a href="#shop"><span>▦</span> Products</a>

          <a href="#collections"><span>✿</span> Collections</a>

          <a href="#custom"><span>✧</span> Custom Orders</a>

          <a href="#cart"><span>🛍</span> Shopping Cart <b>{cartCount}</b></a>

          <a href="#about"><span>♡</span> About LunaLoop</a>

        </nav>

        <div className="sidebar-note">

          <span>♡</span>

          <strong>Made just for you.</strong>

          <small>Discover something lovely today.</small>

        </div>

      </aside>



      <main className="dashboard-main">

        <div className="dashboard-topbar">

          <div>

            <p className="topbar-eyebrow">LUNALOOP STORE</p>

            <h2>Dashboard</h2>

          </div>

          <label className="dashboard-search">

            <span>⌕</span>

            <input type="search" placeholder="Search handmade products..." value={searchQuery}

              onChange={(event) => setSearchQuery(event.target.value)} aria-label="Search products" />

          </label>

          <div className="topbar-user"><span>🌙</span><div><strong>LunaLoop</strong><small>Customer store</small></div></div>

        </div>



        <section className="hero" id="home">



          <div className="hero-content">



            <p className="small-heading">



              HANDMADE • UNIQUE • MADE WITH LOVE



            </p>







            <h1>



              Handmade little things,



              <br />



              made with love. 🧶



            </h1>







            <p className="hero-text">



              Cute handmade creations made by students, for students.



            </p>







            <a href="#shop" className="shop-button">



              SHOP COLLECTION



            </a>



          </div>



        </section>







        <section className="categories" id="collections">



          <div className="section-heading">



            <p className="section-label">EXPLORE</p>



            <h2>Shop by Category</h2>



            <p className="section-description">



              Find something handmade just for you.



            </p>



          </div>







          <div className="category-grid">



            <div className="category-card">



              <div className="category-icon">👜</div>



              <h3>Tote Bags</h3>



              <p>Hand-painted bags made to carry your style.</p>



              <a href="#shop">Explore →</a>



            </div>







            <div className="category-card">



              <div className="category-icon">🧶</div>



              <h3>Crochet</h3>



              <p>Cute handmade crochet creations.</p>



              <a href="#shop">Explore →</a>



            </div>







            <div className="category-card">



              <div className="category-icon">🌸</div>



              <h3>Pipe-Cleaner Crafts</h3>



              <p>Colourful handmade flowers and crafts.</p>



              <a href="#shop">Explore →</a>



            </div>







            <div className="category-card">



              <div className="category-icon">🎀</div>



              <h3>Keychains</h3>



              <p>Small handmade accessories made with love.</p>



              <a href="#shop">Explore →</a>



            </div>



          </div>



        </section>







        <section className="featured" id="shop">



          <div className="section-heading">



            <p className="section-label">OUR COLLECTION</p>



            <h2>Shop LunaLoop</h2>



            <p className="section-description">



              Hand-painted tote bags made with creativity and love.



            </p>



          </div>







          {loadingProducts && (



            <div className="loading-products">



              Loading products...



            </div>



          )}







          {productError && (



            <div className="product-error">



              {productError}



            </div>



          )}







          {!loadingProducts &&



            !productError &&



            products.length === 0 && (



              <div className="product-error">



                No products available right now.



              </div>



            )}







          {!loadingProducts &&



            !productError &&



            products.length > 0 && (



              <div className="product-results-layout">

                <aside className="product-filters">

                  <h3>Filters</h3>

                  <label className="filter-label" htmlFor="category-filter">Categories</label>

                  <select id="category-filter" value={selectedCategory}

                    onChange={(event) => setSelectedCategory(event.target.value)}>

                    {productCategories.map((category) => <option key={category} value={category}>{category}</option>)}

                  </select>

                  <div className="filter-divider" />

                  <label className="stock-filter">

                    <input type="checkbox" checked={inStockOnly}

                      onChange={(event) => setInStockOnly(event.target.checked)} />

                    Available in stock

                  </label>

                  <div className="filter-tip"><span>✿</span><strong>Thoughtfully handmade</strong><small>Little things, made with love.</small></div>

                </aside>

                <div className="product-grid">

                {filteredProducts.map((product) => (<article className="product-card" key={product.id}>



                    <div className="product-image">



                      {product.imageUrl ? (



                        <img



                          src={imageUrl(product)}



                          alt={product.name}



                        />



                      ) : (



                        <div className="product-placeholder">



                          🌙



                        </div>



                      )}



                    </div>







                    <div className="product-info">



                      <p className="product-category">



                        {product.category || "Handmade"}



                      </p>







                      <h3>{product.name}</h3>







                      <p className="product-description">



                        {product.description ||



                          "A beautiful handmade creation from LunaLoop."}



                      </p>







                      <p className="product-stock">



                        {Number(product.stock) > 0



                          ? `${product.stock} available`



                          : "Out of stock"}



                      </p>







                      <div className="product-bottom">



                        <p className="price">₹{product.price}</p>







                        <button



                          className="add-button"



                          onClick={() => addToCart(product)}



                          disabled={Number(product.stock) <= 0}



                        >



                          {Number(product.stock) <= 0



                            ? "Out of Stock"



                            : "Add to Cart"}



                        </button>



                      </div>



                    </div>



                  </article>



                ))}

                {filteredProducts.length === 0 && (

                  <div className="no-filter-results">No products match these filters. Try another search.</div>

                )}

                </div>

              </div>

            )}

        </section>







        <section className="cart-section" id="cart">



          <div className="section-heading">



            <p className="section-label">YOUR BAG</p>



            <h2>Your Cart 🛒</h2>



          </div>







          {cart.length === 0 ? (



            <div className="empty-cart">



              <div className="empty-cart-icon">🛒</div>



              <h3>Your cart is empty</h3>



              <p>Add something handmade to your cart!</p>







              <a href="#shop" className="continue-shopping">



                Continue Shopping



              </a>



            </div>



          ) : (



            <div className="cart-container">



              <div className="cart-items">



                {cart.map((product) => (



                  <div className="cart-item" key={product.id}>



                    <div className="cart-product">



                      <div className="cart-product-icon">



                        {product.imageUrl ? (



                          <img



                            src={imageUrl(product)}



                            alt={product.name}



                          />



                        ) : (



                          <span>🌙</span>



                        )}



                      </div>







                      <div>



                        <h3>{product.name}</h3>



                        <p>{product.category || "Handmade"}</p>



                      </div>



                    </div>







                    <div className="cart-quantity">



                      <button



                        onClick={() =>



                          decreaseQuantity(product.id)



                        }



                      >



                        −



                      </button>







                      <span>{product.quantity}</span>







                      <button



                        onClick={() =>



                          increaseQuantity(product.id)



                        }



                      >



                        +



                      </button>



                    </div>







                    <strong className="cart-price">



                      ₹{Number(product.price) * product.quantity}



                    </strong>







                    <button



                      className="remove-button"



                      onClick={() =>



                        removeFromCart(product.id)



                      }



                    >



                      Remove



                    </button>



                  </div>



                ))}



              </div>







              <div className="cart-summary">



                <div>



                  <span>Items</span>



                  <strong>{cartCount}</strong>



                </div>







                <div>



                  <span>Subtotal</span>



                  <strong>₹{cartTotal}</strong>



                </div>







                <div className="cart-total">



                  <span>Total</span>



                  <strong>₹{cartTotal}</strong>



                </div>







                <button



                  className="checkout-button"



                  onClick={openCheckout}



                >



                  Proceed to Checkout



                </button>



              </div>



            </div>



          )}



        </section>







        {showCheckout && (



          <section className="checkout-section" id="checkout">



            <div className="checkout-container">



              <div className="checkout-header">



                <p className="small-heading">DELIVERY DETAILS</p>



                <h2>Checkout</h2>



                <p>



                  Enter your details to place your LunaLoop order.



                </p>



              </div>







              <div className="checkout-layout">



                <div className="checkout-form-card">



                  <h3>Shipping Information</h3>







                  <div className="form-row">



                    <div className="form-group">



                      <label>Full Name</label>



                      <input



                        type="text"



                        placeholder="Enter your full name"



                        value={checkoutForm.fullName}



                        onChange={(e) =>



                          updateForm("fullName", e.target.value)



                        }



                      />



                    </div>







                    <div className="form-group">



                      <label>Mobile Number</label>



                      <input



                        type="tel"



                        placeholder="10-digit mobile number"



                        maxLength="10"



                        value={checkoutForm.mobile}



                        onChange={(e) =>



                          updateForm(



                            "mobile",



                            e.target.value.replace(/\D/g, "")



                          )



                        }



                      />



                    </div>



                  </div>







                  <div className="form-group">



                    <label>Email Address</label>



                    <input



                      type="email"



                      placeholder="your@email.com"



                      value={checkoutForm.email}



                      onChange={(e) =>



                        updateForm("email", e.target.value)



                      }



                    />



                  </div>







                  <div className="form-group">



                    <label>Delivery Address</label>



                    <textarea



                      rows="4"



                      placeholder="House number, street, area"



                      value={checkoutForm.address}



                      onChange={(e) =>



                        updateForm("address", e.target.value)



                      }



                    />



                  </div>







                  <div className="form-row">



                    <div className="form-group">



                      <label>City</label>



                      <input



                        type="text"



                        placeholder="City"



                        value={checkoutForm.city}



                        onChange={(e) =>



                          updateForm("city", e.target.value)



                        }



                      />



                    </div>







                    <div className="form-group">



                      <label>State</label>



                      <input



                        type="text"



                        placeholder="State"



                        value={checkoutForm.state}



                        onChange={(e) =>



                          updateForm("state", e.target.value)



                        }



                      />



                    </div>







                    <div className="form-group">



                      <label>PIN Code</label>



                      <input



                        type="text"



                        placeholder="6-digit PIN"



                        maxLength="6"



                        value={checkoutForm.pinCode}



                        onChange={(e) =>



                          updateForm(



                            "pinCode",



                            e.target.value.replace(/\D/g, "")



                          )



                        }



                      />



                    </div>



                  </div>







                  {orderError && (



                    <div className="checkout-error">



                      {orderError}



                    </div>



                  )}







                  <div className="checkout-buttons">



                    <button



                      className="back-cart-button"



                      onClick={closeCheckout}



                      disabled={placingOrder}



                    >



                      ← Back to Cart



                    </button>







                    <button



                      className="place-order-button"



                      onClick={placeOrder}



                      disabled={placingOrder}



                    >



                      {placingOrder



                        ? "Placing Order..."



                        : "Place Order →"}



                    </button>



                  </div>



                </div>







                <div className="checkout-summary-card">



                  <p className="summary-label">YOUR ORDER</p>



                  <h3>Order Summary</h3>







                  <div className="checkout-items">



                    {cart.map((item) => (



                      <div



                        className="checkout-item"



                        key={item.id}



                      >



                        <div>



                          <strong>{item.name}</strong>



                          <span>Qty: {item.quantity}</span>



                        </div>







                        <strong>



                          ₹{Number(item.price) * item.quantity}



                        </strong>



                      </div>



                    ))}



                  </div>







                  <div className="checkout-summary-line">



                    <span>Subtotal</span>



                    <strong>₹{cartTotal}</strong>



                  </div>







                  <div className="checkout-summary-line">



                    <span>Delivery</span>



                    <span>Free for now</span>



                  </div>







                  <div className="checkout-divider"></div>







                  <div className="checkout-total">



                    <strong>Total</strong>



                    <strong>₹{cartTotal}</strong>



                  </div>







                  <div className="secure-message">



                    🔒 Secure checkout



                  </div>



                </div>



              </div>



            </div>



          </section>



        )}











        {/* ================= CUSTOM ORDERS ================= */}



        <section className="custom-section" id="custom">



          <div className="custom-content">



            <p className="section-label">MAKE IT YOURS</p>







            <h2>Want something custom?</h2>







            <p>



              Have your own idea? Tell us what you want and we'll



              create something special for you.



            </p>







            {!showCustomOrder && !customOrderSuccess && (



              <button



                type="button"



                className="custom-button"



                onClick={() => {



                  setShowCustomOrder(true);



                  setCustomOrderError("");



                }}



              >



                Request a Custom Order



              </button>



            )}







            {customOrderSuccess && (



              <div className="custom-order-message">



                <h3>Thank you! 💜</h3>



                <p>



                  Your custom order request has been submitted successfully.



                  Our team will review it and contact you.



                </p>



                <button



                  type="button"



                  className="custom-button"



                  onClick={() => {



                    setCustomOrderSuccess(false);



                    setShowCustomOrder(false);



                  }}



                >



                  Done



                </button>



              </div>



            )}







            {showCustomOrder && !customOrderSuccess && (



              <form



                className="custom-order-form"



                onSubmit={handleCustomOrderSubmit}



              >



                <label htmlFor="custom-customer-name">Your name *</label>



                <input



                  id="custom-customer-name"



                  type="text"



                  required



                  maxLength={100}



                  value={customOrderForm.customerName}



                  onChange={(e) =>



                    setCustomOrderForm({



                      ...customOrderForm,



                      customerName: e.target.value,



                    })



                  }



                  placeholder="Enter your full name"



                />







                <label htmlFor="custom-mobile">Mobile number *</label>



                <input



                  id="custom-mobile"



                  type="tel"



                  required



                  maxLength={15}



                  value={customOrderForm.mobile}



                  onChange={(e) =>



                    setCustomOrderForm({



                      ...customOrderForm,



                      mobile: e.target.value,



                    })



                  }



                  placeholder="Enter your mobile number"



                />







                <label htmlFor="custom-email">Email (optional)</label>



                <input



                  id="custom-email"



                  type="email"



                  maxLength={150}



                  value={customOrderForm.email}



                  onChange={(e) =>



                    setCustomOrderForm({



                      ...customOrderForm,



                      email: e.target.value,



                    })



                  }



                  placeholder="Enter your email"



                />







                <label htmlFor="custom-product-type">What would you like? *</label>



                <select



                  id="custom-product-type"



                  required



                  value={customOrderForm.productType}



                  onChange={(e) =>



                    setCustomOrderForm({



                      ...customOrderForm,



                      productType: e.target.value,



                    })



                  }



                >



                  <option value="">Select a product type</option>



                  <option value="Custom Tote Bag">Custom Tote Bag</option>



                  <option value="Pipe-Cleaner Bouquet">Pipe-Cleaner Bouquet</option>



                  <option value="Crochet Product">Crochet Product</option>



                  <option value="Gift or Other">Gift / Other</option>



                </select>







                <label htmlFor="custom-description">



                  Describe your idea, colours and design *



                </label>



                <textarea



                  id="custom-description"



                  required



                  rows={4}



                  value={customOrderForm.description}



                  onChange={(e) =>



                    setCustomOrderForm({



                      ...customOrderForm,



                      description: e.target.value,



                    })



                  }



                  placeholder="Tell us what you want us to create..."



                />







                <label htmlFor="custom-budget">Your budget in ₹ (optional)</label>



                <input



                  id="custom-budget"



                  type="number"



                  min="1"



                  step="1"



                  value={customOrderForm.budget}



                  onChange={(e) =>



                    setCustomOrderForm({



                      ...customOrderForm,



                      budget: e.target.value,



                    })



                  }



                  placeholder="Enter your budget"



                />







                {customOrderError && (



                  <p className="custom-order-error" role="alert">



                    {customOrderError}



                  </p>



                )}







                <button



                  type="submit"



                  className="custom-button"



                  disabled={customOrderLoading}



                >



                  {customOrderLoading



                    ? "Submitting..."



                    : "Submit Custom Order"}



                </button>







                <button



                  type="button"



                  className="custom-cancel-button"



                  disabled={customOrderLoading}



                  onClick={() => {



                    setShowCustomOrder(false);



                    setCustomOrderError("");



                  }}



                >



                  Cancel



                </button>



              </form>



            )}



          </div>



        </section>







        <section className="about" id="about">



          <p className="section-label">OUR STORY</p>







          <h2>



            Made by students,



            <br />



            for students. 🤍



          </h2>







          <p>



            LunaLoop started with a simple idea — turning creativity



            into little handmade things that make people happy.



          </p>







          <p>



            Every creation is designed and handmade with patience,



            creativity and lots of love.



          </p>



        </section>



      </main>







      <footer>



        <div className="footer-logo">🌙 LunaLoop</div>







        <p className="footer-tagline">



          Small stitches. Big happiness.



        </p>







        <div className="footer-links">



          <a href="#home">Home</a>



          <a href="#shop">Shop</a>



          <a href="#custom">Custom Orders</a>



          <a href="#about">About</a>



        </div>







        <p className="copyright">



          © 2026 LunaLoop. Made with 🧶 & love.



        </p>



      </footer>



    </div>



  );



}







export default App;