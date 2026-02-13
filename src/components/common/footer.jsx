import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        quickLinks: [
            { name: "Home", path: "/" },
            { name: "Explore Venues", path: "/venues" },
            { name: "My Bookings", path: "/dashboard" },
        ],
        social: [
            { icon: <Facebook size={20} />, path: "#", color: "hover:text-blue-600" },
            { icon: <Twitter size={20} />, path: "#", color: "hover:text-sky-500" },
            { icon: <Instagram size={20} />, path: "#", color: "hover:text-pink-600" },
            { icon: <Linkedin size={20} />, path: "#", color: "hover:text-blue-700" },
        ]
    };

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-indigo-200 shadow-lg">
                                B
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
                                BanquetBazar
                            </span>
                        </Link>
                        <p className="text-gray-500 leading-relaxed max-w-xs">
                            Find and book the perfect venue for your special moments. We make event planning seamless and memorable.
                        </p>
                        <div className="flex gap-4">
                            {footerLinks.social.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.path}
                                    className={`text-gray-400 transition-colors ${social.color}`}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-6 text-lg">Quick Links</h3>
                        <ul className="space-y-4">
                            {footerLinks.quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-gray-900 font-bold mb-6 text-lg">Contact Us</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-gray-500">
                                <MapPin className="text-indigo-600 flex-shrink-0" size={20} />
                                <span>Kathmandu, Nepal<br />Baneshwor, 44600</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500">
                                <Phone className="text-indigo-600 flex-shrink-0" size={20} />
                                <span>+977 1234567890</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500">
                                <Mail className="text-indigo-600 flex-shrink-0" size={20} />
                                <span>hello@banquetbazar.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex justify-center items-center">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} BanquetBazar. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
