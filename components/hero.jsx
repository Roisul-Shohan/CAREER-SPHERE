"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full pt-36 md:pt-48 pb-10">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          <h1 className="text-4xl font-bold md:text-6xl lg:text-6xl xl:text-8xl leading-tight text-center">
            {/* Fixed 3-line heading (Option A): first word white, second word gradient */}
            <div className="block">
              <span className="text-gray-400">CAREER</span>
              <span className="ml-3 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">SPHERE</span>
            </div>

            <div className="block">
              <span className="text-gray-400">Your AI Car</span>
              <span className=" bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">eer Coach for</span>
            </div>

            <div className="block">
              <span className="text-gray-400">Professional</span>
              <span className="ml-3 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Success</span>
            </div>
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner.jpeg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
