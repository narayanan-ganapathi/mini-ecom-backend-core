import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"], 
      default: "pending" 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
