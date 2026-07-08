import Link from "next/link";

const SideNav = () => {
  return (
    <div className="w-64 min-h-screen bg-gray-800 text-white p-5">
      <h2 className="text-2xl font-bold mb-10">Menu</h2>
      <ul>
        <li className="mb-4">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
        </li>
        <li className="mb-4">
          <Link href="/products" className="hover:text-gray-300">
            Products
          </Link>
        </li>
        <li className="mb-4">
          <Link href="/inventory" className="hover:text-gray-300">
            Inventory
          </Link>
        </li>
        <li className="mb-4">
          <Link href="/in-construction" className="hover:text-gray-300">
            In Construction
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SideNav;
