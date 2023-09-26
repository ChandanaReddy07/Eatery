const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const MenuItem = require('../models/food');
const { getUserById } = require('../controller/user');
const { isSignedIn, isAuthenticated } = require('../controller/auth');


router.param('id', getUserById);



// Place a new order
router.post('/place-order/:id',isSignedIn,isAuthenticated, async (req, res) => {
  try {
    const { itemName,price, quantity } = req.body;
    const { id } = req.params; 
    // Check if the menu item exists
    // const menuItem = await MenuItem.findById(itemId);
    // if (!menuItem) {
    //   return res.status(404).json({ message: 'Menu item not found' });
    // }

    // Create a new order
    const order = new Order({ itemName,price, quantity ,userId : id });
    await order.save();
    res.json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// API endpoint to get orders by user ID
router.get("/orders/:id", isSignedIn,isAuthenticated,async (req, res) => {
  try {
    const { id } = req.params;
    const userOrders = await Order.find({ userId:id });
    res.json(userOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
