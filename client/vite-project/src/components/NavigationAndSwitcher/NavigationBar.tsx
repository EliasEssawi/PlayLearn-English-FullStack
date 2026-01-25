import { Link } from 'react-router-dom';

const NavigationBar = () => {
  const menuItems = [
    { path: '/', label: 'Home' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'register' },
  ];

  return (
    <nav className="h-full py-8 px-4">
      {/* Changed from flex-row to flex-col */}
      <ul className="flex flex-col gap-4 font-semibold text-base">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <li className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer">
              {item.label}
            </li>
          </Link>
        ))}
      </ul>
    </nav>
  );
};

export default NavigationBar;