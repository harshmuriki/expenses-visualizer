"use client";

import React from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-background-primary/70 backdrop-blur-sm border-t border-border-secondary/50 text-text-primary py-6 mt-auto w-full">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-6">
        {/* Left Section: Text */}
        <div className="text-center md:text-left">
          <p className="text-sm">
            Built by{" "}
            <a
              href="https://harshmuriki.com"
              className="underline text-[colors.secondary.500] hover:text-[colors.secondary.600] transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Harsh
            </a>
          </p>
          <p className="text-xs mt-1 text-text-tertiary">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>

        {/* Right Section: Social Media Links */}
        <div className="text-center md:text-right mt-4 md:mt-0 flex space-x-4">
          <a
            href="https://github.com/harshmuriki"
            className="text-[colors.primary.500] hover:text-[colors.secondary.500] text-xl transition transform hover:scale-110"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/venkata-harsh-muriki/"
            className="text-[colors.primary.500] hover:text-[colors.secondary.500] text-xl transition transform hover:scale-110"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://twitter.com/harshmuriki24"
            className="text-[colors.primary.500] hover:text-[colors.secondary.500] text-xl transition transform hover:scale-110"
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
