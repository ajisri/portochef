import HeroSection from "../components/HeroSection";
import TimelineGallery from "../components/TimelineGallery";
import BusinessPortfolio from "../components/BusinessPortfolio";
import Testimonials from "../components/Testimonials";
import Recognition from "../components/Recognition";

import Footer from "../components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TimelineGallery />
      <BusinessPortfolio />
      <Testimonials />
      <Recognition />

      <Footer />
    </main>
  );
}
