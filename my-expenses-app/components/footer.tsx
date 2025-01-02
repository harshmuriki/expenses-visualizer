"use client";

import React from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-white py-6 mt-auto w-full rounded-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-6">
        {/* Left Section: Text */}
        <div className="text-center md:text-left">
          <p className="text-sm">
            Built by{" "}
            <a
              href="https://harshmuriki.com"
              className="underline text-blue-400 hover:text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Harsh
            </a>
          </p>
          <p className="text-xs mt-1">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>

        {/* Right Section: Social Media Links */}
        <div className="text-center md:text-right mt-4 md:mt-0 flex space-x-4">
          <a
            href="https://github.com/harshmuriki"
            className="text-blue-400 hover:text-blue-500 text-xl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/venkata-harsh-muriki/"
            className="text-blue-400 hover:text-blue-500 text-xl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://twitter.com/harshmuriki24"
            className="text-blue-400 hover:text-blue-500 text-xl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <FaTwitter />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
