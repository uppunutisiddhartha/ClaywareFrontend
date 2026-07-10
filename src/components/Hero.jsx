import "./Hero.css";

function Hero() {
    return (
        <section className="hero">
            <div className="hero-content">
                <span className="hero-est">EST. 2025</span>
                
                <h1 className="hero-title">
                    <span className="italic-text">Art of the</span> Handmade.
                </h1>
                
                <p className="hero-desc">
                    Curating a collection of ceramics that bridge the gap between ancient 
                    tradition and modern elegance.
                </p>
                
                <button className="hero-btn">
                    SHOP COLLECTION
                </button>
            </div>
        </section>
    );
}

export default Hero;