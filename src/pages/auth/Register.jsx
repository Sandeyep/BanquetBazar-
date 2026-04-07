import { useState, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, User, Mail, Lock, ArrowRight } from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(formData);
      toast.success("Signup successful! Welcome to BanquetBazar.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.log("Registration error:", error);
      const errorMessage = error.response?.data?.email?.[0] || error.response?.data?.username?.[0] || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-md w-full">
        {/* Brand Header */}


        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 transition-all hover:shadow-2xl">
          <div className="text-center mb-8">

            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-200 transform transition active:scale-95 flex items-center justify-center gap-2 mt-2 ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:-translate-y-0.5'
                }`}
            >
              {isLoading ? 'Creating account...' : 'Start Your Journey'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            By signing up, you agree to our Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
