
import { Open_Sans } from "next/font/google";

const hklFont = Open_Sans({
  subsets: ["latin"],
});

export default function FormPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4">
      <h1 className={`text-3xl font-bold text-center ${hklFont.className}`}>
        HKL
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold block">
            Name*
          </label>
          <input
            type="text"
            id="name"
            placeholder="Enter your name"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold block">
            Email*
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="language" className="text-sm font-bold block">
            Preferred Language*
          </label>
          <select
            id="language"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="english">English</option>
            <option value="punjabi">Punjabi</option>
            <option value="hindi">Hindi</option>
            <option value="french">French</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-bold block">
            Phone (optional)
          </label>
          <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
            <span className="p-2 text-gray-500">+1</span>
            <input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              className="w-full p-2 bg-transparent focus:outline-none"
            />
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          By submitting this form, you consent to receive updates via email, SMS and other
          channels from our organization.
        </p>

        <button
          type="submit"
          className="w-full p-3 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
        >
          I COMMIT
        </button>
      </div>
    </div>
  );
}