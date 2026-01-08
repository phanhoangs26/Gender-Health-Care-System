import React from "react";
import { Link } from "react-router-dom";
import OurService from "./OurService";
import BlogSection from "./BlogSection";

function main() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <BlogSection />
      <OurService />
    </div>
  );
}

export default main;
