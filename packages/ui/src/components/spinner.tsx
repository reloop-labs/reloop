import React from "react";

const Spinner = ({
  size = 20,
  color = "#000",
}: {
  size?: number;
  color?: string;
}) => {
  const bars = Array.from({ length: 12 });

  return (
    <div
      className="relative"
      style={{
        height: size,
        width: size,
      }}
    >
      <div
        className="absolute"
        style={{
          height: size,
          width: size,
          top: "50%",
          left: "50%",
        }}
      >
        {bars.map((_, i) => {
          const deg = i * 30;
          const delay = -(1.2 - i * 0.1);
          return (
            <div
              key={i}
              className="absolute rounded-[6px] opacity-15 animate-spinnerFade"
              style={{
                height: "8%",
                width: "24%",
                backgroundColor: color,
                top: "-3.9%",
                left: "-10%",
                transform: `rotate(${deg}deg) translate(146%)`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Spinner;
