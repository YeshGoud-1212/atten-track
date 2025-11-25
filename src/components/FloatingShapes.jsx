import React from 'react';

const FloatingShapes = () => {
  const shapes = Array.from({ length: 6 }, (_, i) => (
    <div
      key={i}
      className="floating-shape"
      style={{
        width: `${Math.random() * 100 + 50}px`,
        height: `${Math.random() * 100 + 50}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${Math.random() * 4 + 4}s`,
      }}
    />
  ));

  return <div className="floating-shapes">{shapes}</div>;
};

export default FloatingShapes;
