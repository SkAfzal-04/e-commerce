import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { X, Check, Package, MapPin, CreditCard, Truck, ShoppingBag } from 'lucide-react'

const PlaceOrder = () => {

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [method, setMethod] = useState('cod');
  const {navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products} = useContext(ShopContext)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
    alternativephone:''
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData(data => ({...data, [name]: value}))

  }

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Order Payment',
      description: 'Order Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + '/api/order/verifyRazorpay', 
            response, 
            {headers: {token}}
          );
          if (data.success) {
            toast.success(data.message)
            navigate('/orders')
            setCartItems({})
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message)
        }
      },
      modal: {
        ondismiss: async () => {
          // Handle payment modal dismissal
          try {
            const { data } = await axios.post(
              backendUrl + '/api/order/cancelRazorpay',
              { orderId: order.receipt },
              { headers: { token } }
            );
            if (data.success) {
              toast.info('Payment cancelled');
            }
          } catch (error) {
            console.log(error);
            toast.error('Error handling payment cancellation');
          }
        }
      }
    }
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  const handlePlaceOrder = (event) => {
    event.preventDefault();
    setShowConfirmation(true);
  }

  const confirmOrder = async () => {
    setShowConfirmation(false);
    try {
      
      let orderItems = []

      for(const productId in cartItems) {
        for(const color in cartItems[productId]) {
          for(const size in cartItems[productId][color]) {
            if (cartItems[productId][color][size] > 0) {
              const product = products.find(p => p._id === productId);
              const colorVariant = product?.colorVariants.find(v => v.color === color);
              
              if (product && colorVariant) {
                orderItems.push({
                  _id: product._id,
                  name: product.name,
                  description: product.description,
                  price: colorVariant.price,
                  image: colorVariant.images,
                  category: product.category,
                  subCategory: product.subCategory,
                  bestseller: product.bestseller,
                  date: product.date,
                  color: color,
                  size: size,
                  quantity: cartItems[productId][color][size],
                });
              }
            }
          }
        }
      }

      // console.log(orderItems);
      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      }
      
      switch (method) {

        // API Calls for COD 
        case 'cod':
          const response = await axios.post(backendUrl + '/api/order/place', orderData, {headers: {token}});
          if (response.data.success) {
            toast.success(response.data.message)
            setCartItems({})
            navigate('/orders')
          } else {
            toast.error(response.data.message)
          }
          break;

        // API Calls for Stripe Payment
        case 'stripe': 
          const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, {headers: {token}});

          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data
            window.location.replace(session_url)
          } else {
            toast.error(responseStripe.data.message)
          }
          break;

        // API Calls for Stripe Payment
        case 'razorpay': 
          // before calling the razorpay api go to index.html and add the razorpay script <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, {headers: {token}});

          if (responseRazorpay.data.success) {
            // console.log(responseRazorpay.data.order);
            initPay(responseRazorpay.data.order)
            
          } else {
            toast.error(responseStripe.data.message)
          }
          break;

        default:
          break;
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  return (
    <>
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order Confirmation</h2>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  toast.info('Order cancelled');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Order Summary */}
              <div className="flex items-start gap-3">
                <ShoppingBag className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Order Summary</h3>
                  <p className="text-sm text-gray-600">
                    Total Items: {Object.values(cartItems).reduce((acc, curr) => 
                      acc + Object.values(curr).reduce((a, c) => 
                        a + Object.values(c).reduce((sum, qty) => sum + qty, 0), 0
                      ), 0
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    Subtotal: ₹{getCartAmount()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Delivery Fee: ₹{delivery_fee}
                  </p>
                  <p className="text-sm font-semibold">
                    Total Amount: ₹{getCartAmount() + delivery_fee}
                  </p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="flex items-start gap-3">
                <MapPin className="text-green-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Delivery Address</h3>
                  <p className="text-sm text-gray-600">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formData.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formData.city}, {formData.state} {formData.zipcode}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {formData.phone}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-start gap-3">
                <CreditCard className="text-purple-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Payment Method</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {method === 'cod' ? 'Cash on Delivery' : method}
                  </p>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="flex items-start gap-3">
                <Truck className="text-orange-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Estimated Delivery</h3>
                  <p className="text-sm text-gray-600">
                    5-7 Business Days
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  toast.info('Order cancelled');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={confirmOrder}
                className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded flex items-center gap-2"
              >
                <Check size={18} /> Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handlePlaceOrder} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
        {/* Left Side */}
        <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
          <div className='text-xl sm:text-sxl my-3'>
            <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
          </div>
          <div className='flex gap-3'>
            <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First Name' />
            <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last Name' />
          </div>
            <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email Address' />
            <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
            <div className='flex gap-3'>
              <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
              <input required onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
            </div>
            <div className='flex gap-3'>
              <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Zipcode' />
              <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
            </div>
            <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
            <input onChange={onChangeHandler} name='alternativephone' value={formData.alternativephone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Alternative Number (Optional)' />
        </div>
        {/* Right Side */}
        <div className='mt-8'>
          <div className='mt-8 min-w-80'>
            <CartTotal/>
          </div>
          <div className='mt-12'>
            <Title text1={'PAYMENT'} text2={'METHOD'}/>
            {/* Payment method selection */}
            <div className='flex gap-3 flex-col lg:flex-row'>
              <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
              </div>
              <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
              </div>
              <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                <p className='text-gray-500 text-sm font-medium mx-4 '>CASH ON DELIVERY</p>
              </div>
            </div>
            <div className='w-full text-end mt-8'>
              <button type='submit' className='bg-black text-white py-3 px-16 text-sm active:bg-gray-700'>PLACE ORDER</button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}

export default PlaceOrder