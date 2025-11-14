import pandas as pd
import numpy as np
from datetime import datetime, time
import json

class GymRecommendationSystem:
    def __init__(self):
        # Base data from your information
        self.hours = {
            'Monday': {'open': time(6,0), 'close': time(23,0)},
            'Tuesday': {'open': time(6,0), 'close': time(23,0)},
            'Wednesday': {'open': time(6,0), 'close': time(23,0)},
            'Thursday': {'open': time(6,0), 'close': time(23,0)},
            'Friday': {'open': time(6,0), 'close': time(23,0)},
            'Saturday': {'open': time(8,0), 'close': time(23,0)},
            'Sunday': {'open': time(8,0), 'close': time(23,0)}
        }
        
        # Crowd patterns (from your charts)
        self.crowd_patterns = {
            'Monday': {
                '06:00': 0.2, '09:00': 0.4, '12:00': 0.9, '15:00': 0.6, '18:00': 0.95, '21:00': 0.7
            },
            'Tuesday': {
                '06:00': 0.3, '09:00': 0.5, '12:00': 0.8, '15:00': 0.7, '18:00': 0.95, '21:00': 0.6
            },
            'Wednesday': {
                '06:00': 0.2, '09:00': 0.4, '12:00': 0.9, '15:00': 0.6, '18:00': 0.95, '21:00': 0.7
            },
            'Thursday': {
                '06:00': 0.3, '09:00': 0.5, '12:00': 0.8, '15:00': 0.7, '18:00': 0.95, '21:00': 0.6
            },
            'Friday': {
                '06:00': 0.2, '09:00': 0.3, '12:00': 0.7, '15:00': 0.5, '18:00': 0.9, '21:00': 0.8
            },
            'Saturday': {
                '09:00': 0.4, '12:00': 0.7, '15:00': 0.8, '18:00': 0.9, '21:00': 0.6
            },
            'Sunday': {
                '09:00': 0.3, '12:00': 0.5, '15:00': 0.7, '18:00': 0.8, '21:00': 0.4
            }
        }
        
        # Equipment availability (simplified)
        self.equipment_availability = {
            'weight_room': {'hours': 'extended', 'peak_wait': 15},
            'cardio': {'hours': 'extended', 'peak_wait': 10},
            'basketball': {'schedule': 'variable', 'conflict_risk': 0.3},
            'squash': {'hours': 'limited', 'conflict_risk': 0.4}
        }
        
        # Demographic estimates (based on typical gym distributions)
        self.demographics = {
            'early_morning': {'male': 0.7, 'female': 0.3, 'asian': 0.4, 'caucasian': 0.4, 'other': 0.2},
            'midday': {'male': 0.6, 'female': 0.4, 'asian': 0.35, 'caucasian': 0.45, 'other': 0.2},
            'evening_peak': {'male': 0.65, 'female': 0.35, 'asian': 0.4, 'caucasian': 0.4, 'other': 0.2},
            'late_evening': {'male': 0.7, 'female': 0.3, 'asian': 0.45, 'caucasian': 0.35, 'other': 0.2}
        }

    def get_time_slot_category(self, hour):
        if 5 <= hour < 9:
            return 'early_morning'
        elif 9 <= hour < 12:
            return 'mid_morning'
        elif 12 <= hour < 15:
            return 'midday'
        elif 15 <= hour < 17:
            return 'afternoon'
        elif 17 <= hour < 20:
            return 'evening_peak'
        else:
            return 'late_evening'

    def calculate_score(self, time_slot, user_preferences):
        """
        Calculate a fitness score for a given time slot based on user preferences
        """
        score = 100
        
        # Extract components
        day = time_slot['day']
        hour = time_slot['hour']
        time_str = f"{hour:02d}:00"
        
        # Crowd factor (most important)
        if day in self.crowd_patterns and time_str in self.crowd_patterns[day]:
            crowd_level = self.crowd_patterns[day][time_str]
            # User preference: lower crowds are better
            crowd_preference = user_preferences.get('crowd_tolerance', 0.5)
            crowd_score = (1 - abs(crowd_level - crowd_preference)) * 40
            score *= (crowd_score / 40)
        
        # Equipment availability
        equipment_pref = user_preferences.get('equipment_priority', [])
        equipment_bonus = 0
        for equipment in equipment_pref:
            if equipment in self.equipment_availability:
                # Reduce score during peak hours for high-demand equipment
                if crowd_level > 0.7:
                    equipment_bonus -= 10
                else:
                    equipment_bonus += 5
        score += equipment_bonus
        
        # Demographic preferences
        time_category = self.get_time_slot_category(hour)
        demo_prefs = user_preferences.get('demographic_preferences', {})
        
        for demo, preference in demo_prefs.items():
            if demo in self.demographics[time_category]:
                actual_ratio = self.demographics[time_category][demo]
                # Score based on how close actual ratio is to preference
                demo_score = (1 - abs(actual_ratio - preference)) * 20
                score *= (demo_score / 20)
        
        # Time of day preference
        preferred_times = user_preferences.get('preferred_times', [])
        if hour in preferred_times:
            score += 15
        
        return max(0, score)

    def generate_recommendations(self, user_preferences):
        """
        Generate top 10 gym timings based on user preferences
        """
        recommendations = []
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        for day in days:
            for hour in range(6, 23):  # From 6 AM to 10 PM
                time_slot = {
                    'day': day,
                    'hour': hour,
                    'time_string': f"{day} {hour:02d}:00"
                }
                
                score = self.calculate_score(time_slot, user_preferences)
                
                recommendations.append({
                    'day': day,
                    'time': f"{hour:02d}:00",
                    'score': score,
                    'crowd_level': self.crowd_patterns[day].get(f"{hour:02d}:00", 0.5),
                    'time_category': self.get_time_slot_category(hour)
                })
        
        # Sort by score and return top 10
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:10]

# Example usage
def main():
    gym_system = GymRecommendationSystem()
    
    # Example user preferences
    user_prefs = {
        'crowd_tolerance': 0.3,  # Prefer less crowded (0-1 scale)
        'equipment_priority': ['weight_room', 'cardio'],
        'demographic_preferences': {
            'female': 0.4,  # Prefer 40% female ratio
            'male': 0.6,    # Prefer 60% male ratio  
            'asian': 0.3,   # Prefer 30% Asian
            'caucasian': 0.5 # Prefer 50% Caucasian
        },
        'preferred_times': [9, 10, 14, 15]  # Preferred hours (9AM, 10AM, 2PM, 3PM)
    }
    
    recommendations = gym_system.generate_recommendations(user_prefs)
    
    print("Top 10 RIMAC Gym Timings:")
    print("=" * 50)
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec['day']} at {rec['time']}")
        print(f"   Score: {rec['score']:.1f} | Crowd Level: {rec['crowd_level']:.1%}")
        print(f"   Time Category: {rec['time_category']}")
        print()

if __name__ == "__main__":
    main()
