const router = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order");
const Bill = require("../models/bills");
const { getUserById } = require("../controller/user");
const PDFDocument = require("pdfkit");


router.post("/bill/generate-pdf", async (req, res) => {
  const { orderDetails, tipPercentage, subtotal, tip, total } = req.body;

  try {
    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers for the PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=bill.pdf");

    // Pipe the PDF document to the response stream
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(16).text("Your Bill", { align: "center" });

    // Add order details
    doc.fontSize(14).text("Order Details:");
    orderDetails.forEach((item) => {
      doc.text(`${item.quantity} X ${item.itemName}: $${(item.price * item.quantity).toFixed(2)}`);
    });

    // Add tip, subtotal, and total
    doc.text(`Tip Percentage: ${tipPercentage}%`);
    doc.text(`Subtotal: $${subtotal}`);
    doc.text(`Tip: $${tip}`);
    doc.text(`Total: $${total}`);

    // End the PDF document
    doc.end();

    // Send the PDF file as a response
    res.status(200);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
});



router.param('id', getUserById);

router.post("/order/clear/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { tipAmount, totalCost } = req.body;

  
    // Extract the user's orders
    const userOrders = await Order.find({ userId: userId });

    if (userOrders.length === 0) {
      return res.status(400).json({ message: "No orders to clear" });
    }

    // Create a new bill object with the user's orders
    const newBill = new Bill({
      orders: userOrders.map(order => ({
        itemName: order.itemName,
        quantity: order.quantity,
        subtotal: order.price * order.quantity,
      })),
      tipAmount: tipAmount,
      totalCost: totalCost,
      user: userId,
    });

    // Save the new bill
    await newBill.save();

    // Clear the user's current orders
    await Order.deleteMany({ userId: userId });

    res.status(200).json({ message: "Order list cleared successfully and bill created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.post("/orders", async (req, res) => {

  try {
    const instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: "Something Went Wrong!" });
      }
      res.status(200).json({ data: order });
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

module.exports = router;
