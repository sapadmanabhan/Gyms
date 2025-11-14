// gym_optimizer.js - Complete RIMAC Gym Optimizer
class GymOptimizer {
    constructor() {
        // All data built in - no external files needed
        this.crowdPatterns = {
            'Monday': {'06:00': 0.2, '09:00': 0.4, '12:00': 0.9, '15:00': 0.6, '18:00': 0.95, '21:00': 0.7},
            'Tuesday': {'06:00': 0.3, '09:00': 0.5, '12:00': 0.8, '15:00': 0.7, '18:00': 0.95, '21:00': 0.6},
            'Wednesday': {'06:00': 0.2, '09:00': 0.4, '12:00': 0.9, '15:00': 0.6, '18:00': 0.95, '21:00': 0.7},
            'Thursday': {'06:00': 0.3, '09:00': 0.5, '12:00': 0.8, '15:00': 0.7, '18:00': 0.95, '21:00': 0.6},
            'Friday': {'06:00': 0.2, '09:00': 0.3, '12:00': 0.7, '15:00': 0.5, '18:00': 0.9, '21:00': 0.8},
            'Saturday': {'09:00': 0.4, '12:00': 0.7, '15:00': 0.8, '18:00': 0.9, '21:00': 0.6},
            'Sunday': {'09:00': 0.3, '12:00': 0.5, '15:00': 0.7, '18:00': 0.8, '21:00': 0.4}
        };
        
        this.demographics = {
            'early_morning': {'male': 0.7, 'female': 0.3, 'asian': 0.4, 'caucasian': 0.4, 'other': 0.2},
            'mid_morning': {'male': 0.6, 'female': 0.4, 'asian': 0.35, 'caucasian': 0.45, 'other': 0.2},
            'midday': {'male': 0.6, 'female': 0.4, 'asian': 0.35, 'caucasian': 0.45, 'other': 0.2},
            'afternoon': {'male': 0.6, 'female': 0.4, 'asian': 0.35, 'caucasian': 0.45, 'other': 0.2},
            'evening_peak': {'male': 0.65, 'female': 0.35, 'asian': 0.4, 'caucasian': 0.4, 'other': 0.2},
            'late_evening': {'male': 0.7, 'female': 0.3, 'asian': 0.45, 'caucasian': 0.35, 'other': 0.2}
        };
        
        this.equipmentAvailability = {
            'weight_room': {'hours': 'extended', 'peak_wait': 15},
            'cardio': {'hours': 'extended', 'peak_wait': 10},
            'basketball': {'schedule': 'variable', 'conflict_risk': 0.3},
            'squash': {'hours': 'limited', 'conflict_risk': 0.4}
        };
    }

    getTimeSlotCategory(hour) {
        if (hour < 9) return 'early_morning';
        if (hour < 12) return 'mid_morning';
        if (hour < 15) return 'midday';
        if (hour < 17) return 'afternoon';
        if (hour < 20) return 'evening_peak';
        return 'late_evening';
    }

    getCrowdLevel(day, hour) {
        const timeKey = `${hour.toString().padStart(2, '0')}:00`;
        return this.crowdPatterns[day][timeKey] || 0.5;
    }

    calculateScore(timeSlot, userPrefs) {
        let score = 100;
        const crowdLevel = this.getCrowdLevel(timeSlot.day, timeSlot.hour);
        
        // Crowd factor (40% of score)
        const crowdPreference = userPrefs.crowd_tolerance || 0.5;
        const crowdScore = (1 - Math.abs(crowdLevel - crowdPreference)) * 40;
        score = score * (crowdScore / 40);
        
        // Time preference (30% of score)
        const preferredTimes = userPrefs.preferred_times || [];
        if (preferredTimes.includes(timeSlot.hour)) {
            score += 30;
        }
        
        // Equipment bonus (20% of score)
        const equipmentPrefs = userPrefs.equipment_priority || [];
        if (equipmentPrefs.length > 0) {
            score += 20;
        }
        
        // Demographic adjustment (10% of score)
        const timeCategory = this.getTimeSlotCategory(timeSlot.hour);
        const demoPrefs = userPrefs.demographic_preferences || {};
        if (demoPrefs.female) {
            const actualFemale = this.demographics[timeCategory].female;
            const demoScore = (1 - Math.abs(actualFemale - demoPrefs.female)) * 10;
            score = score * (demoScore / 10);
        }
        
        return Math.round(score);
    }

    generateRecommendations(userPrefs) {
        const recommendations = [];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        days.forEach(day => {
            const startHour = (day === 'Saturday' || day === 'Sunday') ? 9 : 6;
            
            for (let hour = startHour; hour <= 22; hour++) {
                const timeSlot = {
                    day: day,
                    hour: hour,
                    time: `${hour.toString().padStart(2, '0')}:00`
                };
                
                const score = this.calculateScore(timeSlot, userPrefs);
                const crowdLevel = this.getCrowdLevel(day, hour);
                
                recommendations.push({
                    day: day,
                    time: timeSlot.time,
                    score: score,
                    crowd_level: crowdLevel,
                    time_category: this.getTimeSlotCategory(hour)
                });
            }
        });
        
        return recommendations.sort((a, b) => b.score - a.score).slice(0, 10);
    }
}

function calculateRecommendations() {
    // Get user preferences from the form
    const userPrefs = {
        crowd_tolerance: parseFloat(document.getElementById('crowdTolerance').value),
        equipment_priority: Array.from(document.querySelectorAll('input[name="equipment"]:checked'))
                               .map(cb => cb.value),
        preferred_times: Array.from(document.querySelectorAll('input[name="time"]:checked'))
                            .map(cb => parseInt(cb.value)),
        demographic_preferences: {
            female: parseFloat(document.getElementById('femaleRatio').value) || 0.4
        }
    };

    const optimizer = new GymOptimizer();
    const results = optimizer.generateRecommendations(userPrefs);
    
    displayResults(results);
}

function displayResults(recommendations) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Top 10 Recommended Gym Times:</h2>';
    
    if (recommendations.length === 0) {
        resultsDiv.innerHTML += '<p>No recommendations found. Please adjust your preferences.</p>';
        return;
    }
    
    recommendations.forEach((rec, index) => {
        const crowdPercent = Math.round(rec.crowd_level * 100);
        const crowdText = crowdPercent < 40 ? 'Quiet' : 
                         crowdPercent < 70 ? 'Moderate' : 'Busy';
        
        resultsDiv.innerHTML += `
            <div class="result-item" style="padding: 10px; margin: 5px 0; background: #f5f5f5; border-radius: 3px;">
                <strong>${index + 1}. ${rec.day} at ${rec.time}</strong><br>
                Score: ${rec.score}/100 | Crowd: ${crowdText} (${crowdPercent}%)<br>
                Best for: ${rec.time_category.replace('_', ' ')}
            </div>
        `;
    });
}

// Initialize slider display
document.addEventListener('DOMContentLoaded', function() {
    const crowdSlider = document.getElementById('crowdTolerance');
    const crowdValue = document.getElementById('crowdValue');
    const femaleSlider = document.getElementById('femaleRatio');
    const femaleValue = document.getElementById('femaleValue');
    
    if (crowdSlider && crowdValue) {
        crowdSlider.addEventListener('input', function() {
            crowdValue.textContent = Math.round(this.value * 100) + '%';
        });
    }
    
    if (femaleSlider && femaleValue) {
        femaleSlider.addEventListener('input', function() {
            femaleValue.textContent = Math.round(this.value * 100) + '%';
        });
    }
});
}
