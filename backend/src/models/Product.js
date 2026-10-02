import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide a product image URL'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    countInStock: {
      type: Number,
      required: [true, 'Please provide stock count'],
      default: 0,
      min: [0, 'Stock count cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
