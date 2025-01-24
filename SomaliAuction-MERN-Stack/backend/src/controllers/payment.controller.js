import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import PaymentMethod from "../models/userPaymentMethod.model.js";
import Stripe from "stripe";
import User from "../models/user.model.js";
// const stripe = new Stripe(process.env.STRIPE_KEY);
// const stripe = new Stripe("sk_test_51Oktd0SFo6ikMNdBlRddtnGqOJL1WRx92gJ4BTlpcP07172oQ2F3jTE5F0HtWeCSu3z0MA1GQhiAhG1oysUQ3Nq600eUow95pq")

const stripe = new Stripe("sk_test_51PnN4q01nQyE2THiHujPuRzjROeazyw2QlZEPNJ8d07yitvFDvPYBdP5GE5hzkjnlnbq4WxZ2S95Pz99FCgUd9aW00Zxi61czk")


// recluze
// dsa 27
// op
// networking

//paper crdeit
//backend
//frontened
//stock semulator

// @desc Add payment method
// @route POST /api/v1/payments/add-payment-method
// @access Private

/* const addPaymentMethodToCustomer = asyncHandler(async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    console.log(paymentMethodId, "paymentMethodId,,,,,,,");
    if (!paymentMethodId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "payment Method is required"));
    }
    const getUserId = req.user._id.toString();
    console.log(getUserId, "userId,,,,,,,,");

    const stripeCustomer = await PaymentMethod.findOne({ userId: getUserId });
    console.log(stripeCustomer, "stripeCustomer,,,,,,,,");

    if (!stripeCustomer) {
      return res.status(404).json(new ApiResponse(404, "Customer not found"));
    }
    console.log(stripeCustomer, "stripeCustomer,,,,,,,,");

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomer?.stripeCustomerId,
    });
    if (!paymentMethod) {
      
      return res
        .status(404)
        .json(new ApiResponse(404, "Payment method not added."));
    }
    stripeCustomer.paymentMethodId = paymentMethodId;
    await stripeCustomer.save();
    console.log("Payment method attached and saved", paymentMethod);

    // Find user and update verifiedPayment
    const user = await User.findById(getUserId);
    console.log(user, "user");
    if (!user) {
      return res.status(404).json(new ApiResponse(404, "User not found"));
    }
    user.paymentVerified = true;
    await user.save();
    console.log("User payment verified updated", user);

    return res
      .status(200)
      .json(new ApiResponse(200, "Payment method added successfully"));
  } catch (error) {
    console.error('Error in addPaymentMethodToCustomer:', error);

    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  } */

  const addPaymentMethodToCustomer = asyncHandler(async (req, res) => {
    try {
      const { paymentMethodId } = req.body;
      console.log(paymentMethodId, "paymentMethodId");
  
      if (!paymentMethodId) {
        return res.status(400).json(new ApiResponse(400, "Payment method is required"));
      }
  
      const getUserId = req.user._id.toString();
      console.log(getUserId, "userId");
  
      // Check if PaymentMethod exists for user
      let stripeCustomer = await PaymentMethod.findOne({ userId: getUserId });
      console.log(stripeCustomer, "stripeCustomer");
  
      if (!stripeCustomer) {
        // Create new Stripe customer if none exists
        const customer = await stripe.customers.create({
          email: req.user.email,
          name: req.user.fullName,
        });
        console.log(customer, "New Stripe customer created");
  
        stripeCustomer = new PaymentMethod({
          userId: getUserId,
          stripeCustomerId: customer.id,
          paymentMethodId,
        });
        await stripeCustomer.save();
        console.log("New Stripe customer saved to database", stripeCustomer);
      } else {
        // Verify that the customer exists in Stripe
        try {
          const customer = await stripe.customers.retrieve(stripeCustomer.stripeCustomerId);
          console.log(customer, "Stripe customer retrieved");
        } catch (error) {
          console.error('Error retrieving customer:', error);
          return res.status(404).json(new ApiResponse(404, "Stripe customer not found"));
        }
      }
  
      console.log(`Attaching PaymentMethod ${paymentMethodId} to Customer ${stripeCustomer.stripeCustomerId}`);
  
      // Attach payment method to the existing customer
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomer.stripeCustomerId,
      });
  
      if (!paymentMethod || paymentMethod.error) {
        console.error('PaymentMethod attach failed:', paymentMethod.error);
        return res.status(500).json(new ApiResponse(500, `Payment method attach failed: ${paymentMethod.error.message}`));
      }
  
      stripeCustomer.paymentMethodId = paymentMethodId;
      await stripeCustomer.save();
      console.log("Payment method attached and saved", paymentMethod);
  
      const user = await User.findById(getUserId);
      console.log(user, "user");
      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found"));
      }
      user.paymentVerified = true;
      await user.save();
      console.log("User payment verified updated", user);
  
      return res.status(200).json(new ApiResponse(200, "Payment method added successfully"));
    } catch (error) {
      console.error('Error in addPaymentMethodToCustomer:', error);
      return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
    }



  //   if (paymentMethod) {
  //     stripeCustomer.paymentMethodId = paymentMethodId;
  //     await stripeCustomer.save();
  //   }

  //    //finde user and update verifiedPayment
  //    const user = await User.findById({ _id: getUserId });
  //    console.log(user, "user,,,,,,,,payment method");
  //    if (!user) {
  //      return res.status(404).json(new ApiResponse(404, "User not found"));
  //    }
  //    user.paymentVerified = true;
  //    await user.save();
  //   return res
  //     .status(200)
  //     .json(new ApiResponse(200, "Payment method added successfully"));
  // } catch (error) {
  //   console.log(error);

  //   return res
  //     .status(500)
  //     .json(new ApiResponse(500, error?.message || "Internal server error"));
  // }
});

// @desc update payment method
// @route POST /api/v1/payments/update-payment-method
// @access Private

const updatePaymentMethod = asyncHandler(async (req, res) => {
  const { paymentMethodId } = req.body;
  try {
    const getUserId = req.user._id.toString();
    console.log(getUserId, "userId,,,,,,,,");

    const stripeCustomer = await PaymentMethod.findOne({ userId: getUserId });
    console.log(stripeCustomer, "stripeCustomer,,,,,,,,");

    if (!stripeCustomer) {
      return res.status(404).json(new ApiResponse(404, "Customer not found"));
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomer?.stripeCustomerId,
    });

    const customer = await stripe.customers.update(
      stripeCustomer?.stripeCustomerId,
      {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      }
    );

    await stripe.paymentMethods.detach(stripeCustomer?.paymentMethodId);
    stripeCustomer.paymentMethodId = paymentMethodId;
    await stripeCustomer.save();

    //finde user and update verifiedPayment
    const user = await User.findById({ _id: getUserId });
    if (!user) {
      return res.status(404).json(new ApiResponse(404, "User not found"));
    }
    user.paymentVerified = true;
    await user.save();

    res.status(200).json({ message: "Payment method updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc checkout
// @route POST /api/v1/payments/checkout
// @access Private
const paymentCheckout = asyncHandler(async (req, res) => {
  try {
    // const lineItems = [
    //   {
    //     price_data: {
    //       currency: 'usd',
    //       product_data: {
    //         name: 'T-shirt',
    //       },
    //       unit_amount: 2000,
    //     },
    //     quantity: 1,
    //   },
    // ];
    const getUserId = req.user._id.toString();
    console.log(getUserId, "userId,,,,,,,,");
    if(!getUserId){
      return res.status(400).json(new ApiResponse(400, "User not found"));
    }


    const stripeCustomer = await PaymentMethod.findOne({ userId: getUserId });
    console.log(stripeCustomer, "stripeCustomerId,,,,,,,,");
    if(!stripeCustomer){
      return res.status(400).json(new ApiResponse(400, "Customer not found"));
    }

    console.log("checklk..,,,,");
    const session = await stripe.checkout.sessions.create({
      line_items: req.body.sendProductData.lineItems,
      customer: stripeCustomer.StripeCustomerId,
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `http://localhost:5173/success/${req.body.sendProductData.id}`,
      cancel_url: "http://localhost:5173/cancel",
    });
    console.log("chkkkkkkkkkkkkkk,,,");

    return res.status(201).json(session);
  } catch (error) {
    return res
    .status(500)
    .json(new ApiResponse(500, error?.message || "Internal server error"));  }
});

export { 
  addPaymentMethodToCustomer,
   updatePaymentMethod ,
   paymentCheckout,
  };
