// JavaScript implementation of the recommendation system
class GymOptimizer {
    constructor() {
        this.crowdPatterns = {
            'Monday': {'06:00': 0.2, '09:00': 0.4, '12:00': 0.9, '15:00': 0.6, '18:00': 0.95, '21:00': 0.7},
            // ... other days
        };
    }

    calculateRecommendations(userPrefs) {
        // Implementation of scoring algorithm
        let recommendations = [];
        
        // Generate scores for all time slots
        // Return top 10 recommendations
        
        return recommendations.slice(0, 10);
    }
}

function calculateRecommendations() {
    const userPrefs = {
        crowd_tolerance: parseFloat(document.getElementById('crowdTolerance').value),
        equipment_priority: Array.from(document.querySelectorAll('input[name="equipment"]:checked'))
                               .map(cb => cb.value),
        demographic_preferences: {
            female: parseFloat(document.getElementById('femaleRatio').value)
        }
    };

    const optimizer = new GymOptimizer();
    const results = optimizer.calculateRecommendations(userPrefs);
    
    displayResults(results);
}

function displayResults(recommendations) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Top 10 Recommended Times:</h2>';
    
    recommendations.forEach((rec, index) => {
        resultsDiv.innerHTML += `
            <div class="result-item">
                <strong>${index + 1}. ${rec.day} at ${rec.time}</strong><br>
                Score: ${rec.score.toFixed(1)} | Crowd: ${(rec.crowd_level * 100).toFixed(0)}%
            </div>
        `;
    });
}
