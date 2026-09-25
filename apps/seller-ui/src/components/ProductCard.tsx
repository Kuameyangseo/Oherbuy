type Product = {
  id: string;
  title: string;
  price: number;
  stock: number;
  image?: string;
};

const ProductCard = ({product}: {product: Product}) => {
  return (
    <article className="bg-white rounded-lg shadow p-4 flex flex-col">
      <div className="h-40 w-full bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
        <img src={product.image ?? '/images/placeholder.svg'} alt={product.title} className="object-contain h-full" />
      </div>

      <div className="mt-4 flex-1">
        <h4 className="text-sm font-semibold text-slate-800">{product.title}</h4>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-indigo-600 font-bold">${product.price.toFixed(2)}</div>
          <div className={`text-xs px-2 py-1 rounded-full ${product.stock > 5 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {product.stock} in stock
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <a className="flex-1 text-center px-3 py-2 text-sm rounded-md border border-indigo-200 text-indigo-600 hover:bg-indigo-50" href={`/(routes)/dashboard/edit/${product.id}`}>
          Edit
        </a>
        <a className="flex-1 text-center px-3 py-2 text-sm rounded-md bg-indigo-600 text-white" href={`/(routes)/dashboard/${product.id}`}>
          View
        </a>
      </div>
    </article>
  );
};

export default ProductCard;
