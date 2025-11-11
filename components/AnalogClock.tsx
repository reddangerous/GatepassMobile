import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

interface AnalogClockProps {
  size?: number;
  showDigital?: boolean;
}

export default function AnalogClock({ size = 100, showDigital = true }: AnalogClockProps) {
  const [time, setTime] = useState(() => {
    // Initialize with current time
    const now = new Date();
    try {
      const kenyaTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Nairobi"}));
      return isNaN(kenyaTime.getTime()) ? now : kenyaTime;
    } catch (error) {
      return now;
    }
  });

  useEffect(() => {
    const updateTime = () => {
      try {
        // Get current time in Kenya timezone
        const now = new Date();
        // Convert to Kenya time using Intl API
        const kenyaTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Nairobi"}));
        
        // Validate the date
        if (isNaN(kenyaTime.getTime())) {
          // Fallback: manually calculate UTC+3
          const utcTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
          const kenyaOffset = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
          setTime(new Date(utcTime.getTime() + kenyaOffset));
        } else {
          setTime(kenyaTime);
        }
      } catch (error) {
        console.error('Error updating time:', error);
        // Fallback to local time
        setTime(new Date());
      }
    };

    // Initial update
    updateTime();
    
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const radius = size / 2 - 10;
  const center = size / 2;

  // Calculate angles for hands - ensure we have valid numbers
  const seconds = time.getSeconds() || 0;
  const minutes = time.getMinutes() || 0;
  const hours = (time.getHours() || 0) % 12;

  const secondAngle = (seconds * 6) - 90; // 6 degrees per second
  const minuteAngle = (minutes * 6) - 90; // 6 degrees per minute
  const hourAngle = (hours * 30 + minutes * 0.5) - 90; // 30 degrees per hour + minute adjustment

  // Convert angles to radians for calculations
  const toRadians = (angle: number) => (angle * Math.PI) / 180;

  // Calculate hand positions with error checking
  const calculateHandPosition = (angle: number, length: number) => {
    const radians = toRadians(angle);
    const x = center + length * Math.cos(radians);
    const y = center + length * Math.sin(radians);
    
    // Ensure we don't return NaN
    return {
      x: isNaN(x) ? center : x,
      y: isNaN(y) ? center : y,
    };
  };

  const secondHandEnd = calculateHandPosition(secondAngle, radius - 20);
  const minuteHandEnd = calculateHandPosition(minuteAngle, radius - 30);
  const hourHandEnd = calculateHandPosition(hourAngle, radius - 50);

  // Generate hour markers
  const hourMarkers = [];
  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30) - 90;
    const position = calculateHandPosition(angle, radius - 15);
    
    hourMarkers.push(
      <SvgText
        key={i}
        x={position.x}
        y={position.y + 5}
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#333"
      >
        {i}
      </SvgText>
    );
  }

  // Generate minute markers
  const minuteMarkers = [];
  for (let i = 0; i < 60; i++) {
    if (i % 5 !== 0) { // Skip hour positions
      const angle = (i * 6) - 90;
      const outerPos = calculateHandPosition(angle, radius);
      const innerPos = calculateHandPosition(angle, radius - 5);
      
      minuteMarkers.push(
        <Line
          key={i}
          x1={outerPos.x}
          y1={outerPos.y}
          x2={innerPos.x}
          y2={innerPos.y}
          stroke="#ccc"
          strokeWidth="1"
        />
      );
    }
  }

  // Generate hour markers (thicker lines)
  const hourLines = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) - 90;
    const outerPos = calculateHandPosition(angle, radius);
    const innerPos = calculateHandPosition(angle, radius - 10);
    
    hourLines.push(
      <Line
        key={i}
        x1={outerPos.x}
        y1={outerPos.y}
        x2={innerPos.x}
        y2={innerPos.y}
        stroke="#666"
        strokeWidth="2"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.clockContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Clock face */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="#fff"
            stroke="#333"
            strokeWidth="3"
          />
          
          {/* Minute markers */}
          {minuteMarkers}
          
          {/* Hour markers */}
          {hourLines}
          
          {/* Hour numbers */}
          {hourMarkers}
          
          {/* Hour hand */}
          <Line
            x1={center}
            y1={center}
            x2={hourHandEnd.x}
            y2={hourHandEnd.y}
            stroke="#333"
            strokeWidth="6"
            strokeLinecap="round"
          />
          
          {/* Minute hand */}
          <Line
            x1={center}
            y1={center}
            x2={minuteHandEnd.x}
            y2={minuteHandEnd.y}
            stroke="#333"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Second hand */}
          <Line
            x1={center}
            y1={center}
            x2={secondHandEnd.x}
            y2={secondHandEnd.y}
            stroke="#FF3B30"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Center dot */}
          <Circle
            cx={center}
            cy={center}
            r="6"
            fill="#008000"
          />
        </Svg>
        
        {/* Clock brand */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>CHANDARIA</Text>
          <Text style={styles.subBrandText}>Kenya Time</Text>
        </View>
      </View>
      
      {showDigital && (
        <View style={styles.digitalTime}>
          <Text style={styles.digitalText}>
            {isNaN(time.getTime()) ? 
              'Loading...' : 
              time.toLocaleTimeString('en-US', { 
                hour: '2-digit',
                minute: '2-digit',
                hour12: true 
              })
            }
          </Text>
          <Text style={styles.timezoneText}>EAT (UTC+3)</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  clockContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: '#fff',
    borderRadius: 1000,
  },
  brandContainer: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  subBrandText: {
    fontSize: 6,
    color: '#666',
    marginTop: 2,
  },
  digitalTime: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  digitalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  timezoneText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});