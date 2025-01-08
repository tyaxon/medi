// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAPiJ59b7glXYALVW4_mNmpeesjHFC-3Vg",
    authDomain: "po-medicamentos.firebaseapp.com",
    projectId: "po-medicamentos",
    storageBucket: "po-medicamentos.firebasestorage.app",
    messagingSenderId: "624490092257",
    appId: "1:624490092257:web:01972049cd5d8c053209a0",
    measurementId: "G-HP6CDNHSYS"
  };
  
  // Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

// Elementos de la interfaz
const medList = document.getElementById('medList');
const addMedicationBtn = document.getElementById('addMedicationBtn');
const nextDoseTimer = document.getElementById('nextDoseTimer');

// Función para actualizar el listado de medicamentos
function updateMedicationList() {
  // Limpia la lista actual
  medList.innerHTML = '';
  
  // Obtener los medicamentos de Firestore
  db.collection("medications").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const med = doc.data();
      const medItem = document.createElement('li');
      medItem.classList.add('med-item');
      
      if (med.done) {
        medItem.classList.add('done');
      }

      medItem.innerHTML = `
        <span>${med.name} - ${med.time}</span>
        <button class="button" onclick="markAsDone('${doc.id}')">${med.done ? 'Hecho' : 'Marcar como Hecho'}</button>
      `;
      medList.appendChild(medItem);
    });

    // Actualizar el siguiente temporizador
    updateNextDose();
  });
}

// Función para agregar un medicamento
addMedicationBtn.addEventListener('click', () => {
  const medName = "Tafirol";  // Cambiar según el medicamento
  const medTime = new Date().toLocaleString(); // Hora actual
  
  // Crear un nuevo medicamento
  const newMed = {
    name: medName,
    time: medTime,
    done: false
  };
  
  // Agregar a Firestore
  db.collection("medications").add(newMed).then(() => {
    updateMedicationList();
  });
});

// Función para marcar un medicamento como hecho
function markAsDone(docId) {
  const medRef = db.collection("medications").doc(docId);

  medRef.update({
    done: true
  }).then(() => {
    updateMedicationList();
  });
}

// Función para actualizar el temporizador del siguiente medicamento
function updateNextDose() {
  db.collection("medications").orderBy("time", "desc").limit(1).get().then((querySnapshot) => {
    const lastMed = querySnapshot.docs[0]?.data();
    
    if (!lastMed) {
      nextDoseTimer.textContent = `Añade un medicamento para comenzar.`;
      return;
    }

    const nextMedTime = new Date(lastMed.time).getTime() + 3 * 60 * 60 * 1000;
    const timeRemaining = nextMedTime - new Date().getTime();

    if (timeRemaining <= 0) {
      nextDoseTimer.textContent = `¡Es hora de tomar ${lastMed.done ? 'Ibuprofeno' : 'Tafirol'}!`;
    } else {
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60)); // horas
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)); // minutos
      nextDoseTimer.textContent = `Siguiente dosis en: ${hours} horas y ${minutes} minutos.`;
    }
  });
}

// Inicializar el contador
updateMedicationList();