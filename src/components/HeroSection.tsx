"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@clerk/nextjs";

const HeroSection = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth(); // Check if the user is authenticated

  const handleNavigate = () => {
    if (isSignedIn) {
      router.push("/upload");
    } else {
      alert("You must be signed in to access the upload page.");
    }
  };

  return (
    <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 px-4">
      <div className="container mx-auto flex flex-col items-center text-center space-y-6">
        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold">Protect Your IP</h1>

        {/* Follow-up Text */}
        <p className="text-lg md:text-xl max-w-2xl">
          Secure your intellectual property with ease. Upload your files, mint
          NFTs, and ensure your creations are protected on the blockchain.
        </p>

        {/* Button */}
        <button
          onClick={handleNavigate}
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200"
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
