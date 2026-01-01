import React from 'react';
import hero from '../assets/10111015.jpeg'; // adjust path
export default function Home() {
  return (
    <div className="container">
      <div className="homepage-content">
        <div className="left-image">
          <img src={hero} alt="Personnel" />
        </div>
        <div className="bio">
          <h2>Personnel BIO</h2>
          <p>A relentless hacker with a passion for unraveling the digital world's deepest secrets...</p>
        </div>
      </div>
    </div>
  );
}
