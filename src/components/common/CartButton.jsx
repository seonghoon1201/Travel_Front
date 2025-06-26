import React from 'react';
import { ShoppingCart, ShoppingBag } from 'lucide-react';

const CartButton = ({ isAdded, onClick }) => {
  return (
    <button onClick={onClick} className="p-2 rounded-full hover:bg-gray-100">
      {isAdded ? <ShoppingBag size={20} color="#10b981" /> : <ShoppingCart size={20} />}
    </button>
  );
};

export default CartButton;
