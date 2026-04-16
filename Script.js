// script.js - Frontend logic for Sports & Fitness Tracker
// Talks to our Express backend using fetch() API

const API_URL = 'http://localhost:3000/api/workouts';

// Run when page loads - fetch all workouts
document.addEventListener('DOMContentLoaded', () => {
  loadWorkouts();
});

// ---- LOAD ALL WORKOUTS ----
async function loadWorkouts() {
  const list = document.getElementById('workout-list');
  const loading = document.getElementById('loading');

  loading.classList.remove('hidden'); // show loading message
  list.innerHTML = ''; // clear old cards

  try {
    const res = await fetch(API_URL);
    const workouts = await res.json();

    loading.classList.add('hidden'); // hide loading

    if (workouts.length === 0) {
      // show empty message if no workouts
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🏃</div>
          <p>Start your fitness journey!</p>
          <small>Add your first workout above 👆</small>
        </div>
      `;
      return;
    }

    // create a card for each workout
    workouts.forEach(w => {
      list.innerHTML += createCard(w);
    });

  } catch (err) {
    loading.classList.add('hidden');
    list.innerHTML = `<p style="color:#d94f4f; font-weight:700;">⚠️ Could not connect to server. Is it running?</p>`;
    console.log('Fetch error:', err.message);
  }
}

// ---- CREATE A WORKOUT CARD (HTML string) ----
function createCard(workout) {
  // format date nicely
  const date = new Date(workout.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return `
    <div class="workout-card">
      <div class="card-name">👤 ${workout.name}</div>
      <div class="card-exercise">🏋️ ${workout.exercise}</div>
      <div class="card-duration">⏱️ ${workout.duration} minutes</div>
      <div class="card-date">📅 ${date}</div>
      <div class="card-footer">
        <button class="btn btn-danger" onclick="deleteWorkout('${workout._id}')">🗑️ Delete</button>
      </div>
    </div>
  `;
}

// ---- HANDLE FORM SUBMIT (add workout) ----
document.getElementById('workout-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // stop page from refreshing

  const name     = document.getElementById('name').value.trim();
  const exercise = document.getElementById('exercise').value.trim();
  const duration = document.getElementById('duration').value.trim();
  const msgBox   = document.getElementById('form-msg');

  // Form validation - don't let empty stuff through
  if (!name || !exercise || !duration) {
    showMsg(msgBox, '⚠️ Please fill in all fields!', 'error');
    return;
  }

  if (duration <= 0) {
    showMsg(msgBox, '⚠️ Duration must be at least 1 minute!', 'error');
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, exercise, duration: Number(duration) })
    });

    const data = await res.json();

    if (!res.ok) {
      showMsg(msgBox, `❌ ${data.error}`, 'error');
      return;
    }

    // Success!
    showMsg(msgBox, `✅ Workout added! Keep going, ${name}! 💪`, 'success');

    // clear form fields
    document.getElementById('workout-form').reset();

    // reload the workout list
    loadWorkouts();

  } catch (err) {
    showMsg(msgBox, '❌ Server error. Please try again.', 'error');
    console.log('POST error:', err.message);
  }
});

// ---- DELETE A WORKOUT ----
async function deleteWorkout(id) {
  // ask before deleting (good UX habit)
  if (!confirm('Delete this workout? 🗑️')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
      alert('Could not delete: ' + data.error);
      return;
    }

    // reload list after deletion
    loadWorkouts();

  } catch (err) {
    alert('Server error while deleting.');
    console.log('DELETE error:', err.message);
  }
}

// ---- BMI CALCULATOR ----
function calculateBMI() {
  const weight  = parseFloat(document.getElementById('weight').value);
  const height  = parseFloat(document.getElementById('height').value);
  const result  = document.getElementById('bmi-result');

  // validate inputs
  if (!weight || !height || weight <= 0 || height <= 0) {
    result.className = 'bmi-result bmi-underweight';
    result.classList.remove('hidden');
    result.innerHTML = '⚠️ Please enter valid weight and height!';
    return;
  }

  const heightM = height / 100;  // convert cm to meters
  const bmi = (weight / (heightM * heightM)).toFixed(1);

  let category = '';
  let emoji    = '';
  let cssClass = '';
  let tip      = '';

  if (bmi < 18.5) {
    category = 'Underweight';
    emoji    = '🥗';
    cssClass = 'bmi-underweight';
    tip      = 'Consider eating more nutritious food and consult a doctor.';
  } else if (bmi < 25) {
    category = 'Normal Weight';
    emoji    = '🎉';
    cssClass = 'bmi-normal';
    tip      = 'Great job! Keep maintaining a healthy lifestyle.';
  } else if (bmi < 30) {
    category = 'Overweight';
    emoji    = '🚶';
    cssClass = 'bmi-overweight';
    tip      = 'Try adding more cardio and a balanced diet.';
  } else {
    category = 'Obese';
    emoji    = '🏃';
    cssClass = 'bmi-obese';
    tip      = 'Please consult a doctor and start a fitness plan.';
  }

  result.className = `bmi-result ${cssClass}`;
  result.classList.remove('hidden');
  result.innerHTML = `
    <div style="font-size: 2rem; margin-bottom: 8px;">${emoji}</div>
    <div style="font-size: 1.4rem; margin-bottom: 6px;"><strong>BMI: ${bmi}</strong></div>
    <div style="font-size: 1rem; margin-bottom: 8px;">Category: <strong>${category}</strong></div>
    <div style="font-size: 0.88rem; opacity: 0.85;">${tip}</div>
  `;
}

// ---- HELPER: show message box ----
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `form-msg ${type}`;
  el.classList.remove('hidden');

  // auto-hide after 4 seconds
  setTimeout(() => {
    el.classList.add('hidden');
  }, 4000);
}