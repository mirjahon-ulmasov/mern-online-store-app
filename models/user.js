const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  let updatedCart;
  if (this.cart) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    const updatedCarItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
      updatedCarItems[cartProductIndex].quantity += 1;
    } else {
      updatedCarItems.push({
        productId: product._id,
        quantity: 1,
      });
    }
    updatedCart = {
      items: updatedCarItems,
    };
  } else {
    updatedCart = {
      items: [{ productId: product._id, quantity: 1 }],
    };
  }
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItem = this.cart.items.filter(i => {
    return i.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItem;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart.items = [];
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
