import React, { useState } from 'react';
import { calculateAge } from './UserCard';

const UserDetails = ({ user, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [user.photo1, ...user.remainingPhotos];
  const genderMap = { male: '男性', female: '女性' };

  const handleImageClick = () => {
    setCurrentImageIndex((currentImageIndex + 1) % images.length);
  };

  const age = calculateAge(user.birthdate);

  return (
    <div className="p-5 bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
      <button onClick={onClose} className="btn btn-square btn-error absolute right-2 top-2">
        x
      </button>
      <div className="w-64 carousel rounded-box">
        {images.map((img, index) => (
          <div key={index} className="carousel-item w-full" onClick={handleImageClick}>
            <img src={img} className="w-full" alt="Profile" />
          </div>
        ))}
      </div>
      <h2 className="text-xl font-bold mt-4">{user.name}、{age}歳</h2>
      <p>性別: {genderMap[user.gender]}</p>
      <p>身長: {user.height}cm</p>
      <p>出身地: {user.hometown}</p>
      <p>体型: {user.weight}</p>
      <p>自己紹介: {user.bio}</p>
    </div>
  );
};

export default UserDetails;
