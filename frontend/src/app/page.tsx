"use client";
import Features from "@/components/landing/Feature";
import Footer from "@/components/landing/footer";
import Header from "@/components/landing/header";
import HeroSection from "@/components/landing/Hero";
import LandingPageStatistics from "@/components/landing/stat";
import Testimonials from "@/components/landing/testimonial";
import CTASection from "@/components/landing/cta";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1 w-full flex flex-col items-center">
        <div className="w-full">
          <HeroSection />
        </div>
        <div className="w-full border-b">
          <LandingPageStatistics />
        </div>
        <div className="w-full">
          <Features />
        </div>
        <div className="w-full">
          <Testimonials />
        </div>
        <div className="w-full">
          <CTASection />
        </div>
      </main>
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}
