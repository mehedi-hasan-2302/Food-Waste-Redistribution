import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="mt-4 text-lg text-gray-600">Page Not Found</p>
        <p className="mt-2 text-sm text-gray-500">
            The page you are looking for does not exist.
        </p>
        <Link to="/" className="mt-6 text-dark-text hover:underline hover:text-brand-green">
            Go to Home
        </Link>
        </div>
    );
}

export default NotFound;