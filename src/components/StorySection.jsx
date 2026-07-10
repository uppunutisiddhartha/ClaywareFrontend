import React from 'react';
import './StorySection.css'; // Make sure to import the corresponding CSS file

const studiosData = [
  {
    id: 1,
    location: "Asheville, NC",
    title: "Mountain Clay",
    description: "Rugged stoneware that captures the essence of the Blue Ridge.",
    imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800" // Replace with local path if downloaded
  },
  {
    id: 2,
    location: "Carmel, CA",
    title: "Coastal Studio",
    description: "Flowy, wave-patterned glazes inspired by the Pacific tide.",
    imageUrl: "https://images.unsplash.com/photo-1565192647048-f997ed87f5e2?auto=format&fit=crop&q=80&w=800" 
  },
  {
    id: 3,
    location: "Santa Fe, NM",
    title: "Desert Earth",
    description: "Ancient terracotta techniques for the modern dwelling.",
    imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800"
  }
];

function StorySection() {
  return (
    <section className="story-section">
      <div className="story-header">
        <h2>Artisan Collective</h2>
        <p>Connecting you to the stories and landscapes behind every wheel-thrown piece.</p>
      </div>

      <div className="studio-grid">
        {studiosData.map((studio) => (
          <div key={studio.id} className="studio-card">
            <div className="studio-image-box">
              <img 
                src={studio.imageUrl} 
                alt={studio.title} 
                className="studio-image" 
              />
            </div>
            <div className="studio-info">
              <span className="studio-location">{studio.location}</span>
              <h3 className="studio-title">{studio.title}</h3>
              <p className="studio-description">{studio.description}</p>
              <a href="#visit" className="visit-link">
                Visit Studio 
                <span className="arrow-icon">↗</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StorySection;