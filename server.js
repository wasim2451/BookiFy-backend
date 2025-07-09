const env=require('dotenv');
const cors=require('cors');
env.config();
const express=require('express');
const app=express();
app.use(express.json());

const crypto=require('crypto');

const Razorpay = require('razorpay');
 //razorPay Instance creation

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_KEY_ID,
  key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});

//Applying Cross Origin Resource Sharing

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

//Post Route to generate order_id

app.post('/api/createorder',async(req,res)=>{
    try {
        const{amount, currency, receipt, bookId, sellerId,buyerId}=req.body;
        const order=await instance.orders.create({
            amount,
            currency,
            receipt,
            notes: {
             bookId,
             sellerId,
             buyerId
            }
        });
        res.json({orderID:order.id});

    } catch (error) {
         console.error(error);
         res.status(500).json({ error: error.message });
    }
});

//Post id to verify Payments 
app.post('/api/verify',(req,res)=>{
    const{razorpay_order_id, razorpay_payment_id, razorpay_signature}=req.body;
    const body=razorpay_order_id+"|"+razorpay_payment_id;
    const expectedSign=crypto.createHmac("sha256",process.env.RAZORPAY_TEST_KEY_SECRET).update(body.toString()).digest('hex');
    if(expectedSign===razorpay_signature){
        return res.status(200).json({status:"success"});
    }else {
    return res.status(400).json({ status: "fail" });
    }
});


//To show Server is Running ...
app.get('/',(req,res)=>{
    return res.send("<h1>BookiFy backend running ...</h1>")
});


app.listen(3000,()=>{
    console.log("Server is Running !");
});