// gym_optimizer.js - Complete RIMAC Gym Optimizer
class GymOptimizer {
    constructor() {
        // All data built in - no external files needed
        this.crowdPatterns = {
            'Monday': {'06:00': 0.1, '07:00': 0.2, '08:00': 0.3, '09:00': 0.4, '10:00': 0.5, '11:00': 0.6, '12:00': 0.9, '13:00': 0.8, '14:00': 0.7, '15:00': 0.6, '16:00': 0.7, '17:00': 0.8, '18:00': 0.95, '19:00': 0.9, '20:00': 0.7, '21:00': 0.5, '22:00': 0.3},
            'Tuesday': {'06:00': 0.2, '07:00': 0.3, '08:00': 0.4, '09:00': 0.5, '10:00': 0.6, '11:00': 0.7, '12:00': 0.8, '13:00': 0.7, '14:00': 0.6, '15:00': 0.7, '16:00': 0.8, '17:00': 0.9, '18:00': 0.95, '19:00': 0.85, '20:00': 0.6, '21:00': 0.4, '22:00': 0.2},
            'Wednesday': {'06:00': 0.1, '07:00': 0.2, '08:00': 0.3, '09:00': 0.4, '10:00': 0.5, '11:00': 0.6, '12:00': 0.9, '13:00': 0.8, '14:00': 0.7, '15:00': 0.6, '16:00': 0.7, '17:00': 0.8, '18:00': 0.95, '19:00': 0.9, '20:00': 0.7, '21:00': 0.5, '22:00': 0.3},
            'Thursday': {'06:00': 0.2, '07:00': 0.3, '08:00': 0.4, '09:00': 0.5, '10:00': 0.6, '11:00': 0.7, '12:00': 0.8, '13:00': 0.7, '14:00': 0.6, '15:00': 0.7, '16:00': 0.8, '17:00': 0.9, '18:00': 0.95, '19:00': 0.85, '20:00': 0.6, '21:00': 0.4, '22:00': 0.2},
            'Friday': {'06:00': 0.1, '07:00': 0.2, '08:00': 0.3, '09:00': 0.3, '10:00': 0.4, '11:00': 0.5, '12:00': 0.7, '13:00': 0.6, '14:00': 0.5, '15:00': 0.5, '16:00': 0.6, '17:00': 0.7, '18:00': 0.9, '19:00': 0.8, '20:00': 0.7, '21:00': 0.6, '22:00': 0.4},
            'Saturday': {'09:00': 0.4, '10:00': 0.5, '11:00': 0.6, '12:00': 0.7, '13:00': 0.8, '14:00': 0.8, '15:00': 0.8, '16:00': 0.8, '17:00': 0.8, '18:00': 0.9, '19:00': 0.8, '20:00': 0.7, '21:00': 0.6, '22:00': 0.4},
            'Sunday': {'09:00': 0.3, '10:00': 0.4, '11:00': 0.5, '12:00': 0.5, '13:00': 0.6, '14:00': 0.6, '15:00': 0.7, '16:00': 0.7, '17:00': 0.7, '18:00': 0.8, '19:00': 0.7, '20:00': 0.6, '21:00': 0.4, '22:00': 0.3}
        };
        
        this.demographics = {
            'early_morning': {'male': 0.75, 'female': 0.25, 'asian': 0.45, 'caucasian': 0.40, 'other': 0.15},
            'mid_morning': {'male': 0.65, 'female': 0.35, 'asian': 0.40, 'caucasian': 0.45, 'other': 0.15},
            'midday': {'male': 0.60, 'female': 0.40, 'asian': 0.35, 'caucasian': 0.50, 'other': 0.15},
            'afternoon': {'male': 0.55, 'female': 0.45, 'asian': 0.40, 'caucasian': 0.45, 'other': 0.15},
            'evening_peak': {'male': 0.70, 'female': 0.30, 'asian': 0.45, 'caucasian': 0.40, 'other': 0.15},
            'late_evening': {'male': 0.75, 'female': 0.25, 'asian': 0.50, 'caucasian': 0.35, 'other': 0.15}
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
        
        // Crowd factor - match user preference (50% weight)
        const crowdPreference = (userPrefs.crowd_tolerance || 30) / 100;
        const crowdDifference = Math.abs(crowdLevel - crowdPreference);
        const crowdScore = (1 - crowdDifference) * 50;
        score *= (crowdScore / 50);
        
        // Gender preference (20% weight)
        const genderPref = userPrefs.gender_preference || 'both';
        const timeCategory = this.getTimeSlotCategory(timeSlot.hour);
        const maleRatio = this.demographics[timeCategory].male;
        const femaleRatio = this.demographics[timeCategory].female;
        
        let genderScore = 20;
        if (genderPref === 'male') {
            genderScore = maleRatio * 20;
        } else if (genderPref === 'female') {
            genderScore = femaleRatio * 20;
        }
        score *= (genderScore / 20);
        
        // Ethnicity preference (20% weight)
        const ethnicityPref = userPrefs.ethnicity_preference || 'none';
        if (ethnicityPref !== 'none') {
            const ethnicityRatio = this.demographics[timeCategory][ethnicityPref];
            const ethnicityScore = ethnicityRatio * 20;
            score *= (ethnicityScore / 20);
        }
        
        // Equipment bonus (10% weight)
        const equipmentPrefs = userPrefs.equipment_priority || [];
        if (equipmentPrefs.length > 0) {
            score += 10;
        }
        
        return Math.round(Math.max(0, Math.min(100, score)));
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
                const crowdPercent = Math.round(crowdLevel * 100);
                
                recommendations.push({
                    day: day,
                    time: timeSlot.time,
                    score: score,
                    crowd_level: crowdLevel,
                    crowd_percent: crowdPercent,
                    time_category: this.getTimeSlotCategory(hour)
                });
            }
        });
        
        return recommendations.sort((a, b) => b.score - a.score).slice(0, 10);
    }
}

function calculateRecommendations() {
    console.log("Button clicked!"); // Debug line
    
    // Get user preferences from the form
    const userPrefs = {
        crowd_tolerance: parseInt(document.getElementById('crowdTolerance').value),
        gender_preference: document.querySelector('input[name="gender"]:checked').value,
        ethnicity_preference: document.querySelector('input[name="ethnicity"]:checked').value,
        equipment_priority: Array.from(document.querySelectorAll('input[name="equipment"]:checked'))
                               .map(cb => cb.value)
    };

    console.log("User prefs:", userPrefs); // Debug line

    const optimizer = new GymOptimizer();
    const results = optimizer.generateRecommendations(userPrefs);
    
    console.log("Results:", results); // Debug line
    displayResults(results);
}

function displayResults(recommendations) {
    const resultsDiv = document.getElementById('results');
    
    if (recommendations.length === 0) {
        resultsDiv.innerHTML = '<div class="result-item">No recommendations found. Please adjust your preferences.</div>';
        return;
    }
    
    let html = '<h2>🎯 Top 10 Recommended Gym Times:</h2>';
    
    recommendations.forEach((rec, index) => {
        const crowdText = rec.crowd_percent < 30 ? 'Very Empty' : 
                         rec.crowd_percent < 50 ? 'Moderately Empty' :
                         rec.crowd_percent < 70 ? 'Moderately Crowded' :
                         rec.crowd_percent < 85 ? 'Very Crowded' : 'Extremely Crowded';
        
        html += `
            <div class="result-item">
                <strong>${index + 1}. ${rec.day} at ${rec.time}</strong><br>
                ⭐ Score: ${rec.score}/100 | 🚶 Crowd: ${crowdText} (${rec.crowd_percent}%)<br>
                🕒 Best Time For: ${rec.time_category.replace('_', ' ').toUpperCase()}
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

// Make function globally available
window.calculateRecommendations = calculateRecommendations;
