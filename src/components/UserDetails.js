import React, { useState } from 'react';

const UserDetails = ({ user, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [user.photo1, user.photo2, user.photo3, user.photo4, user.photo5];

  const handleImageClick = () => {
    setCurrentImageIndex((currentImageIndex + 1) % images.length);
  };

  return (
    <div>
      <button onClick={onClose}>Close</button>
      <img src={images[currentImageIndex]} alt="Profile" onClick={handleImageClick} />
      <h3>{user.name}</h3>
      <p>Height: {user.height}</p>
      <p>Weight: {user.weight}</p>
      <p>Hometown: {user.hometown}</p>
      <p>About: {user.about}</p>
    </div>
  );
};

export default UserDetails;
