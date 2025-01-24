import { Router } from "express";
import { verifyAdmin, verifyUser,verifySeller } from "../middlewares/auth.middleware.js";
import { addPaymentMethodToCustomer,updatePaymentMethod , paymentCheckout} from "../controllers/payment.controller.js";


const router = Router();

router.route("/checkout").post(verifyUser, paymentCheckout)
router.route("/update-payment-method").post(verifyUser, updatePaymentMethod);
router.route("/add-payment-method").post(verifyUser, async (req, res) => {
    try {
      await addPaymentMethodToCustomer(req, res);
    } catch (error) {
      console.error('Error adding payment method:', error);
      res.status(500).send({ error: 'An error occurred while adding the payment method.' });
    }
  });




export default router; 
