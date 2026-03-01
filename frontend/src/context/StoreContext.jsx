/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from "react";
import axios from 'axios'

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    
    const [search, setSearch] = useState(""); 
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("");
    const [discount, setDiscount] = useState(0);
    const [food_list, setFoodList] = useState([]);

    const url = import.meta.env.VITE_BACKEND_URL;

    // --- API HELPER FUNCTIONS ---

    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/food/list");
            setFoodList(response.data.data);
        } catch (error) {
            console.error("Error fetching food list", error);
        }
    }

    const loadCartData = async (accessToken) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: accessToken } });
            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.error("Error loading cart data", error);
        }
    }

    // Refresh Token logic to stay logged in
    const loadUserData = async () => {
        try {
            const response = await axios.post(url + "/api/user/refresh-token");
            if (response.data.success) {
                const freshToken = response.data.accessToken;
                setToken(freshToken);
                localStorage.setItem("token", freshToken);
                return freshToken; // Return it so initApp can use it immediately
            }
        } catch (error) {
            console.log("No active session found");
            return null;
        }
    }

    // --- APP INITIALIZATION ---
    useEffect(() => {
        async function initApp() {
            // 1. Always load food list first
            await fetchFoodList();

            // 2. Handle Authentication
            let activeToken = localStorage.getItem("token");
            
            if (!activeToken) {
                // Try getting a new one via Refresh Token cookie
                activeToken = await loadUserData();
            }

            // 3. If we have a token (either from localStorage or Refresh), load cart
            if (activeToken) {
                setToken(activeToken);
                await loadCartData(activeToken);
            }
        }
        initApp();
    }, []);


    // --- CART ACTIONS ---

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }

        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } })
        }
    }

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } })
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    }

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        discount,
        setDiscount,
        url,
        token,
        setToken,
        search,
        setSearch
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;