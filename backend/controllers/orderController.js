import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// placing user order from frontend
const placeOrder = async (req, res) => {
    // Ensure URL points to your Frontend (e.g., http://localhost:5173)
    const frontend_URL = process.env.FRONTEND_URL || "http://localhost:5173";

    try {
        // 1. Create the order in your database
        // userId is injected here by your authMiddleware
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            discount: req.body.discount || 0,
            delivery: req.body.delivery || 0
        })
        await newOrder.save();

        // 2. Clear the user's cart after placing order
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // 3. Prepare Stripe Line Items
        // unit_amount must be an integer. Multiply by 100 for Paise (INR)
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round(item.price * 100) 
            },
            quantity: item.quantity
        }))

        // Add Delivery Charges to Stripe
        line_items.push({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: 'Delivery Charges',
                },
                unit_amount: Math.round(req.body.delivery * 100)
            },
            quantity: 1
        })

        // 4. Handle Discounts (Stripe Coupons)
        let sessionConfig = {
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
        };

        if (req.body.discount > 0) {
            const coupon = await stripe.coupons.create({
                amount_off: Math.round(req.body.discount * 100),
                currency: 'inr',
                duration: 'once',
            });
            sessionConfig.discounts = [{ coupon: coupon.id }];
        }

        // 5. Create Stripe Session
        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.json({ success: true, session_url: session.url })

    } catch (error) {
        console.error("Stripe/Order Error:", error);
        res.json({ success: false, message: "Could not initialize payment. Please try again." })
    }
}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true" || success === true) {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid Successfully" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment Failed/Cancelled" });
        }
    } catch (error) {
        console.error("Verify Order Error:", error);
        res.json({ success: false, message: "Verification Error" });
    }
}

const userOrders = async (req, res) => {
    try {
        // userId comes from authMiddleware
        const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        res.json({ success: false, message: "Error fetching orders" })
    }
}

const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.error("List Orders Error:", error);
        res.json({ success: false, message: "Error fetching order list" })
    }
}

const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status })
        res.json({ success: true, message: "Order Status Updated" })
    } catch (error) {
        console.error("Update Status Error:", error);
        res.json({ success: false, message: "Error updating status" })
    }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus }