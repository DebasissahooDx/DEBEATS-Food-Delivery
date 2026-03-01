/* eslint-disable react-hooks/exhaustive-deps */
import './PlaceOrder.css';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
    const { getTotalCartAmount, discount, token, food_list, cartItems, url } = useContext(StoreContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: ""
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    }

    // Dynamic Delivery Cost Calculation
    const deliveryCost = getTotalCartAmount() === 0 ? 0 :
                        getTotalCartAmount() <= 100 ? 70 :
                        getTotalCartAmount() <= 180 ? 60 :
                        getTotalCartAmount() <= 250 ? 50 :
                        getTotalCartAmount() <= 320 ? 40 :
                        30;

    const placeOrder = async (event) => {
        event.preventDefault();
        
        // 1. Safety Check: Ensure user is actually logged in
        if (!token || token === "undefined") {
            toast.error("Session expired. Please login again.");
            navigate('/cart');
            return;
        }

        setLoading(true);
        console.log("Terminal: Initiating Order Protocol...");

        try {
            let orderItems = [];
            food_list.forEach((item) => {
                if (cartItems[item._id] > 0) {
                    // Deep clone and add quantity
                    let itemInfo = { ...item, quantity: cartItems[item._id] };
                    orderItems.push(itemInfo);
                }
            });

            // Calculate final amount (ensuring it's not negative)
            const subtotal = getTotalCartAmount();
            const finalAmount = Math.max(0, subtotal + deliveryCost - discount);

            let orderData = {
                address: data,
                items: orderItems,
                amount: finalAmount,
                delivery: deliveryCost,
                discount: discount
            };

            console.log("Payload Ready:", orderData);

            // 2. The Handshake: Sending token in Headers is CRITICAL for authMiddleware
            const response = await axios.post(url + "/api/order/place", orderData, { 
                headers: { token } 
            });

            if (response.data.success) {
                const { session_url } = response.data;
                console.log("Redirecting to Stripe Terminal:", session_url);
                window.location.replace(session_url);
            } else {
                setLoading(false);
                console.error("Server Handshake Failed:", response.data.message);
                toast.error(response.data.message || "Order processing error.");
            }
        } catch (error) {
            setLoading(false);
            console.error("Critical System Error:", error);
            // Check if it's a 401 error from the middleware
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Please login again.");
                navigate('/cart');
            } else {
                toast.error("Payment Gateway Error. Please try again.");
            }
        }
    }

    // Redirect logic: If cart is empty or user logs out, kick them back to cart
    useEffect(() => {
        if (!token) {
            toast.warn("Please login to proceed");
            navigate("/cart");
        } else if (getTotalCartAmount() === 0) {
            navigate("/cart");
        }
    }, [token]);

    return (
        <form onSubmit={placeOrder} className='place-order'>
            <div className='place-order-left'>
                <p className='title'>Delivery Information</p>
                <div className='multi-fields'>
                    <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
                    <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
                </div>
                <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
                <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
                <div className='multi-fields'>
                    <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
                    <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
                </div>
                <div className='multi-fields'>
                    <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip Code' />
                    <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
                </div>
                <input required name='phone' onChange={onChangeHandler} value={data.phone} type='text' placeholder='Phone' />
            </div>

            <div className='place-order-right'>
                <div className='cart-total'>
                    <h2>Cart Total</h2>
                    <div>
                        <div className='cart-total-details'>
                            <p>Subtotal</p>
                            <p>₹{getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className='cart-total-details'>
                            <p>Delivery Fee</p>
                            <p>₹{deliveryCost}</p>
                        </div>
                        <hr />
                        <div className='cart-total-details'>
                            <p>Discount</p>
                            <p>₹{discount}</p>
                        </div>
                        <hr />
                        <div className='cart-total-details'>
                            <p>Total</p>
                            <p>₹{getTotalCartAmount() + deliveryCost - discount}</p>
                        </div>
                    </div>
                    <button type='submit' disabled={loading}>
                        {loading ? "PROCESSSING..." : "PROCEED TO PAYMENT"}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default PlaceOrder;