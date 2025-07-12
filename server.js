const env = require('dotenv');
const cors = require('cors');
const { Resend } = require('resend');
const nodemailer = require("nodemailer");
env.config();
const express = require('express');
const app = express();
app.use(express.json());

const crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const Razorpay = require('razorpay');
const { log } = require('console');
//razorPay Instance creation

//Resend configuration
const resend = new Resend(process.env.RESEND_API_KEY);

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_TEST_KEY_ID,
    key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});

//Applying Cross Origin Resource Sharing

app.use(cors({
    origin: "https://bookify-pink.vercel.app/",
    credentials: true
}));

//Post Route to generate order_id

app.post('/api/createorder', async (req, res) => {
    try {
        const { amount, currency, receipt, bookId, sellerId, buyerId } = req.body;
        const order = await instance.orders.create({
            amount,
            currency,
            receipt,
            notes: {
                bookId,
                sellerId,
                buyerId
            }
        });
        res.json({ orderID: order.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

//Post id to verify Payments 
app.post('/api/verify', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET).update(body.toString()).digest('hex');
    if (expectedSign === razorpay_signature) {
        return res.status(200).json({ status: "success" });
    } else {
        return res.status(400).json({ status: "fail" });
    }
});


// app.post('/api/v1/send/email', async (req, res) => {
//     const { amount,
//         bookname,
//         buyerName,
//         buyerEmail,
//         orderId,
//         qty 
//     } = req.body;
//     try {
//         const data = await resend.emails.send({
//             from: 'onboarding@resend.dev',
//             to: 'wasimakhtar786khan@gmail.com',
//             subject: 'Your Order has been placed !',
//             html:`<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
//             <h2 style="color: #4CAF50;">Hello ${buyerName},</h2><p style="font-size: 16px;">We’re excited to let you know that your order has been successfully placed on <strong>BookiFy</strong>.</p><h3 style="color: #2196F3; margin-top: 30px;">Order Details:</h3><table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
//             <tr><td style="padding: 8px; border: 1px solid #ddd;">Book Name</td>
//             <td style="padding: 8px; border: 1px solid #ddd;"><strong>${bookname}</strong></td>
//             </tr>
//             <tr style="background-color: #f9f9f9;">
//                 <td style="padding: 8px; border: 1px solid #ddd;">Quantity</td>
//                 <td style="padding: 8px; border: 1px solid #ddd;">${qty}</td>
//             </tr>
//             <tr>
//                 <td style="padding: 8px; border: 1px solid #ddd;">Total Amount</td>
//                 <td style="padding: 8px; border: 1px solid #ddd;">₹${amount / 100}</td>
//             </tr>
//             <tr style="background-color: #f9f9f9;">
//                 <td style="padding: 8px; border: 1px solid #ddd;">Order ID</td>
//                 <td style="padding: 8px; border: 1px solid #ddd;">${orderId}</td>
//             </tr>
//          </table>

//             <p style="margin-top: 30px;">If you have any questions about your order, feel free to reply to this email.</p>

//             <p style="margin-top: 20px;">Thank you for choosing <strong>BookiFy</strong>!</p>

//             <p style="font-size: 14px; color: #777; margin-top: 40px;">&copy; ${new Date().getFullYear()} BookiFy. All rights reserved.</p>
//         </div>`

//         });
//         console.log(data);
        
//         return res.status(200).send({ check: true })
//         } catch (error) {
//         console.error('Email sending failed:', error);
//         res.status(500).json({ check: false, message: 'Failed to send email', error: error.message });
//     }
// });





app.post("/api/v1/send/email", async (req, res) => { 
    const {
    amount,
    bookname,
    buyerName,
    buyerEmail,
    orderId,
    qty,
  } = req.body;

   // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  // Compose mail 
   const mailOptions = {
    from: `"BookiFy 📚" <${process.env.GMAIL_USER}>`,
    to: buyerEmail,
    subject: "🎉 Your BookiFy Order Confirmation",
    html: `
        <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f9fafb;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
  ">
    <div style="background: #4CAF50; padding: 20px; color: white; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">🎉 BookiFy Order Confirmation</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 16px;">Hi <strong>${buyerName}</strong>,</p>
      <p style="font-size: 16px; margin-top: 10px;">
        Thank you for your order on <strong>BookiFy</strong>!
      </p>
      <div style="
        background: #ffffff;
        padding: 15px;
        margin-top: 20px;
        border-radius: 6px;
        border: 1px solid #ddd;
      ">
        <h3 style="color: #2196F3; margin-top: 0;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px;">📚 Book:</td>
            <td style="padding: 8px;"><strong>${bookname}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px;">📝 Quantity:</td>
            <td style="padding: 8px;">${qty}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px;">💰 Total Amount:</td>
            <td style="padding: 8px;">₹${amount / 100}</td>
          </tr>
          <tr>
            <td style="padding: 8px;">🆔 Order ID:</td>
            <td style="padding: 8px;">${orderId}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 15px; margin-top: 30px;">
        We’ll contact you shortly with shipping details. If you have any questions, just reply to this email.
      </p>
      <p style="font-size: 14px; color: #999; margin-top: 40px; text-align: center;">
        © ${new Date().getFullYear()} BookiFy. All rights reserved.
      </p>
    </div>
  </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).json({ check: true });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ check: false, message: "Email sending failed" });
  }

})


//To show Server is Running ...
app.get('/', (req, res) => {
    return res.send("<h1>BookiFy backend running ...</h1>");
});


app.listen(PORT, () => {
    console.log("Server is Running !");
});