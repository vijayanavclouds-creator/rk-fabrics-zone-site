const subtotal = 349;
const shipping = 79;
const platformFee = 7;
const couponApplied = false;
const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
const total = subtotal + shipping + platformFee - discount;
console.log(total);
