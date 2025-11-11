import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';

interface ProfileAvatarProps {
  size?: number;
  backgroundColor?: string;
}

export default function ProfileAvatar({ size = 40, backgroundColor = '#f0f0f0' }: ProfileAvatarProps) {
  const scale = size / 40; // Base size is 40
  
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        {/* Face */}
        <Circle 
          cx="20" 
          cy="20" 
          r="18" 
          fill="#F5F5F5" 
          stroke="#333" 
          strokeWidth="0.5"
        />
        
        {/* Hair */}
        <Path 
          d="M 8 18 Q 20 6 32 18 Q 30 12 20 12 Q 10 12 8 18 Z" 
          fill="#333"
        />
        
        {/* Face outline */}
        <Ellipse 
          cx="20" 
          cy="23" 
          rx="12" 
          ry="14" 
          fill="#F8F8F8" 
          stroke="#333" 
          strokeWidth="0.3"
        />
        
        {/* Eyes */}
        <Circle cx="16" cy="19" r="1" fill="#333" />
        <Circle cx="24" cy="19" r="1" fill="#333" />
        
        {/* Nose */}
        <Path d="M 20 21 Q 19 22 20 23" stroke="#333" strokeWidth="0.3" fill="none" />
        
        {/* Mouth */}
        <Path d="M 18 25 Q 20 26 22 25" stroke="#333" strokeWidth="0.4" fill="none" />
        
        {/* Red Jacket/Collar */}
        <Path 
          d="M 8 32 Q 12 30 20 30 Q 28 30 32 32 L 32 40 L 8 40 Z" 
          fill="#DC143C"
          stroke="#B91C3C"
          strokeWidth="0.3"
        />
        
        {/* Jacket collar details */}
        <Path 
          d="M 15 30 Q 17 32 20 32 Q 23 32 25 30" 
          stroke="#B91C3C" 
          strokeWidth="0.4" 
          fill="none"
        />
        
        {/* Shirt/Tie area */}
        <Path 
          d="M 18 30 L 18 35 L 22 35 L 22 30" 
          fill="#FFFFFF"
          stroke="#333"
          strokeWidth="0.2"
        />
        
        {/* Simple tie */}
        <Path 
          d="M 19.5 30 L 19.5 34 L 20.5 34 L 20.5 30" 
          fill="#333"
        />
      </Svg>
    </View>
  );
}