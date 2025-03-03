import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify';
import { assets } from '../assets/assets'

const Loader = () => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 animate-pulse'>
      <div className='w-12 h-12 bg-gray-300 rounded-full'></div>
      <div className='space-y-2'>
        <div className='w-3/4 h-4 bg-gray-300 rounded-md'></div>
        <div className='w-1/2 h-4 bg-gray-300 rounded-md'></div>
      </div>
      <div className='space-y-2'>
        <div className='w-full h-4 bg-gray-300 rounded-md'></div>
        <div className='w-3/4 h-4 bg-gray-300 rounded-md'></div>
      </div>
      <div className='space-y-2'>
        <div className='w-full h-4 bg-gray-300 rounded-md'></div>
        <div className='w-3/4 h-4 bg-gray-300 rounded-md'></div>
      </div>
      <div className='space-y-2'>
        <div className='w-full h-4 bg-gray-300 rounded-md'></div>
        <div className='w-3/4 h-4 bg-gray-300 rounded-md'></div>
      </div>
    </div>
  );
};

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    setLoading(true);
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } });
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', {orderId, status: event.target.value}, {headers: {token}});
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.message)
    }
  }

  const handleRefundChange = async (orderId, refunded) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/updateRefund', { orderId, refunded }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchAllOrders();
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.message);
    }
  };
  const handleEstimatedDeliveryChange = async ( orderId,event) => {
    const newDate = new Date(event.target.value).getTime();
    try {
      // Send the updated estimated delivery date to the backend
      const response = await axios.post(
        backendUrl + '/api/order/updateEstimatedDelivery',
        { orderId, estimatedDelivery: newDate },
        { headers: { token } }
      );
  
      // Check if the update was successful
      if (response.data.success) {
        toast.success(response.data.message); // Show success message
        await fetchAllOrders(); // Optionally refresh orders if needed
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.message); // Show error message if the request fails
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };
  
  useEffect(() => {
    fetchAllOrders();
  }, [token])

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => <Loader key={index} />)
        ) : (
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
              <img className='w-12' src={assets.parcel_icon} alt="" />
              <div>
                {/* Order ID Section */}
                <div className='mb-3 bg-gray-50 p-2 rounded-sm'>
                  <p className='font-medium mb-1'>Order ID:</p>
                  <div className='flex items-center gap-2'>
                    <p className='font-mono text-gray-600'>{order._id}</p>
                    <button 
                      onClick={() => copyToClipboard(order._id)}
                      className='text-blue-500 hover:text-blue-600 text-xs'
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  {order.items.map((item, index) => (
                    <div key={index} className='py-1 border-b last:border-b-0'>
                      <p className='py-0.5'>
                        {item.name} x {item.quantity}
                        <span className='ml-1 px-2 py-0.5 bg-gray-100 rounded-sm'>
                          {item.size}
                        </span>
                        <span className='ml-1 px-2 py-0.5 bg-gray-100 rounded-sm'>
                          {item.color}
                        </span>
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        Product ID: 
                        <span className='font-mono ml-1'>{item._id}</span>
                        <button 
                          onClick={() => copyToClipboard(item._id)}
                          className='text-blue-500 hover:text-blue-600 ml-2'
                        >
                          Copy
                        </button>
                      </p>
                    </div>
                  ))}
                </div>
                <div className='mt-3 space-y-1'>
                  <p className='font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
                  <div>
                    <p>{order.address.street + ","}</p>
                    <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                  </div>
                  <p>{order.address.phone}</p>
                  <p>{order.address.alternativephone ? order.address.alternativephone : ''}</p>
                </div>
              </div>
              <div className='space-y-1'>
                <p className='text-sm sm:text-[15px]'>Items: {order.items.length}</p>
                <p className='mt-3'>Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
                <p>Date: {new Date(order.date).toDateString()}</p>
                <span>
                  <p>Delivery Within:</p>
                  <input type="date" value={order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : ''} onChange={(e) => handleEstimatedDeliveryChange(order._id, e)} className="text-sm p-0 ps-1 border border-gray-300 rounded-md sm:text-xs md:text-sm" />
                </span>
              </div>
              <p className='text-sm sm:text-[15px]'>Total: {currency}{order.amount}</p>
              <div className='space-y-3'>
                <select onChange={(event) => statusHandler(event, order._id)} value={order.status} className='p-1 font-semibold w-full border rounded-sm' disabled={order.status === 'Canceled'}>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Canceled">Canceled</option>
                </select>

                {order.status === 'Canceled' && order.paymentMethod !== 'COD' && (
                  <div className="flex items-center mt-3">
                    <input
                      type="checkbox"
                      checked={order.refunded}
                      onChange={() => handleRefundChange(order._id, !order.refunded)}
                      id={`refund-${order._id}`}
                      className="mr-2"
                    />
                    <label htmlFor={`refund-${order._id}`} className="text-sm">Refunded</label>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders