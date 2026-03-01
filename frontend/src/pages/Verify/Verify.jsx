/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Verify.css';
import { useContext, useEffect, useCallback } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");

    const { url } = useContext(StoreContext);
    const navigate = useNavigate();

    // Using useCallback ensures the function doesn't change on every render
    const verifyPayment = useCallback(async () => {
        try {
            const response = await axios.post(url + "/api/order/verify", { success, orderId });
            
            if (response.data.success) {
                navigate("/myorders");
            } else {
                // If the backend says success=false, go back home
                navigate("/");
            }
        } catch (error) {
            console.error("Verification System Failure:", error);
            navigate("/"); // Fail-safe: redirect to home on network error
        }
    }, [url, success, orderId, navigate]);

    useEffect(() => {
        if (success && orderId) {
            verifyPayment();
        } else {
            navigate("/"); // Security: if someone visits /verify without params, kick them out
        }
    }, [verifyPayment, success, orderId, navigate]);

    return (
        <div className='verify'>
            <div className='spinner'></div>
        </div>
    );
}

export default Verify;