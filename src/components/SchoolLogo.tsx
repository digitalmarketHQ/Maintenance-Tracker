import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
}

export default function SchoolLogo({ className = '', size = 80 }: SchoolLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Ring */}
        <circle cx="250" cy="250" r="235" fill="none" stroke="#374151" strokeWidth="3" />
        <circle cx="250" cy="250" r="225" fill="none" stroke="#d1d5db" strokeWidth="1" strokeDasharray="5,5" />

        {/* Text Paths */}
        <defs>
          <path
            id="textPathTop"
            d="M 50,250 A 200,200 0 0,1 450,250"
            fill="none"
          />
          <path
            id="textPathBottom"
            d="M 450,250 A 200,200 0 0,1 50,250"
            fill="none"
          />
          {/* Shadow filters for professional depth */}
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Top Text: MERIDIAN HEIGHTS */}
        <text className="font-display" fill="#1f2937" fontSize="35" fontWeight="800" letterSpacing="6">
          <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
            MERIDIAN HEIGHTS
          </textPath>
        </text>

        {/* Bottom Text: THE FUTURE IS HERE */}
        <text className="font-display" fill="#374151" fontSize="24" fontWeight="700" letterSpacing="4">
          <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
            THE FUTURE IS HERE
          </textPath>
        </text>

        {/* Left Stars */}
        <g fill="#4b5563">
          <polygon points="100,200 103,208 111,208 105,213 107,221 100,216 93,221 95,213 89,208 97,208" />
          <polygon points="85,250 88,258 96,258 90,263 92,271 85,266 78,271 80,263 74,258 82,258" />
          <polygon points="100,300 103,308 111,308 105,313 107,321 100,316 93,321 95,313 89,308 97,308" />
        </g>

        {/* Right Stars */}
        <g fill="#4b5563">
          <polygon points="400,200 403,208 411,208 405,213 407,221 400,216 393,221 395,213 389,208 397,208" />
          <polygon points="415,250 418,258 426,258 420,263 422,271 415,266 408,271 410,263 404,258 412,258" />
          <polygon points="400,300 403,308 411,308 405,313 407,321 400,316 393,321 395,313 389,308 397,308" />
        </g>

        {/* Inner Shield Group with Drop Shadow */}
        <g filter="url(#shadow)">
          {/* Crown on top of the shield */}
          <path
            d="M 210,165 L 215,145 L 230,152 L 250,132 L 270,152 L 285,145 L 290,165 Z"
            fill="#d97706"
            stroke="#b45309"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="215" cy="142" r="3" fill="#fef08a" />
          <circle cx="230" cy="149" r="3" fill="#fef08a" />
          <circle cx="250" cy="129" r="4" fill="#fef08a" />
          <circle cx="270" cy="149" r="3" fill="#fef08a" />
          <circle cx="285" cy="142" r="3" fill="#fef08a" />

          {/* Crown base */}
          <path d="M 205,165 Q 250,172 295,165 L 295,170 Q 250,177 205,170 Z" fill="#b45309" />

          {/* Shield Outline */}
          {/* A traditional medieval shield */}
          <path
            d="M 170,180 L 330,180 C 330,180 330,280 250,350 C 170,280 170,180 170,180 Z"
            fill="#991b1b"
            stroke="#1e293b"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* Inside divisions of the shield */}
          {/* Top-Right Green Section (Graduation Cap) */}
          <path
            d="M 280,180 L 326,180 C 326,200 326,215 320,225 C 305,225 285,225 280,225 Z"
            fill="#14532d"
            stroke="#1e293b"
            strokeWidth="2"
          />

          {/* Bottom-Left Green Section (Open Book) */}
          <path
            d="M 174,285 C 180,295 190,305 200,312 C 205,312 215,312 225,295 C 225,280 220,270 220,265 C 205,265 185,265 174,285 Z"
            fill="#14532d"
            stroke="#1e293b"
            strokeWidth="2"
          />

          {/* Graduation Cap Vector (top right) */}
          <g transform="translate(290, 192) scale(0.65)" stroke="#f8fafc" strokeWidth="2" fill="none">
            <polygon points="20,10 35,17 20,24 5,17" fill="#f8fafc" />
            <path d="M 10,19 L 10,25 Q 20,32 30,25 L 30,19" fill="#f8fafc" />
            <path d="M 30,17 L 35,27 L 37,27" />
            <circle cx="37" cy="27" r="1.5" fill="#f8fafc" />
          </g>

          {/* Open Book Vector (bottom left) */}
          <g transform="translate(182, 272) scale(0.65)" stroke="#f8fafc" strokeWidth="2.5" fill="none">
            {/* Left page */}
            <path d="M 25,12 C 17,9 10,12 5,14 L 5,28 C 10,26 17,23 25,26 Z" fill="#166534" />
            {/* Right page */}
            <path d="M 25,12 C 33,9 40,12 45,14 L 45,28 C 40,26 33,23 25,26 Z" fill="#166534" />
            {/* Pages details */}
            <path d="M 10,17 L 22,17" />
            <path d="M 10,21 L 22,21" />
            <path d="M 28,17 L 40,17" />
            <path d="M 28,21 L 40,21" />
          </g>

          {/* Central Torch of Knowledge & Progress */}
          <g transform="translate(232, 210)">
            {/* Flame */}
            <path
              d="M 18,10 C 18,10 28,2 25,18 C 25,25 18,30 18,35 C 18,30 11,25 11,18 C 8,2 18,10 18,10 Z"
              fill="#f59e0b"
            />
            <path
              d="M 18,15 C 18,15 23,8 21,20 C 21,24 18,27 18,30 C 18,27 15,24 15,20 C 13,8 18,15 18,15 Z"
              fill="#ef4444"
            />
            {/* Torch Handle */}
            <path
              d="M 14,35 L 22,35 L 20,65 L 16,65 Z"
              fill="#f1f5f9"
              stroke="#1e293b"
              strokeWidth="3.5"
            />
            {/* Torch Top Cap */}
            <path
              d="M 10,35 Q 18,38 26,35 L 28,42 Q 18,44 8,42 Z"
              fill="#e2e8f0"
              stroke="#1e293b"
              strokeWidth="3"
            />
            {/* Decorative Gold Rings on Torch */}
            <line x1="15" y1="48" x2="21" y2="48" stroke="#d97706" strokeWidth="4" />
            <line x1="16" y1="56" x2="20" y2="56" stroke="#d97706" strokeWidth="4" />
          </g>
        </g>
      </svg>
    </div>
  );
}
