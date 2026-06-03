"use client";
import Features from "@/components/landing/Feature";
import Footer from "@/components/landing/footer";
import Header from "@/components/landing/header";
import HeroSection from "@/components/landing/Hero";
import LandingPageStatistics from "@/components/landing/stat";
import Testimonials from "@/components/landing/testimonial";

import { useTheme } from "next-themes";


export default function Home() {
  const {setTheme,resolvedTheme} = useTheme();
  console.log("Current theme:", resolvedTheme);
  
  return (
    <div>
      <Header />
      <HeroSection />
      <LandingPageStatistics />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
}
