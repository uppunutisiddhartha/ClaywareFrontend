import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import WhyChooseUs from "../components/WhyChooseUs"; // This corresponds to Artisan Made / Eco-Conscious / Safe Delivery
import StorySection from "../components/StorySection"; // This corresponds to the Artisan Collective grid
import Footer from "../components/Footer";
import OfferBanner from "../components/OfferBanner";
import ProductCard from "../components/ProductCard";

import FeaturedProducts from  "../components/FeaturedProducts";


import Newsletter from "../components/Newsletter";

function HomePage() {
    return (
        <>
            {/* 1. Header Navigation */}
            <Navbar />

            {/* 2. Main Hero Bold Typography Header */}
            <Hero />
            <OfferBanner/>

            {/* 3. Three Icon Features (Artisan Made, Eco-Conscious, Safe Delivery) */}
            <WhyChooseUs />

            {/* 4. Three Column Regional Studio Grid (Artisan Collective) */}
            <StorySection />
            <ProductCard/>

            {/* 5. Minimalistic Informative Footer */}
            <Newsletter/>
            <Footer />
        </>
    );
}

export default HomePage;