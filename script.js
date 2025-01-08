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
  
  // Inicializar Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore(app);
  
  // Referencia a la colección de medicamentos en Firestore
  const medicationsRef = db.collection('medications');
  
  // Elementos del DOM
  const addMedicationBtn = document.getElementById('addMedicationBtn');
  const nextDoseTimer = document.getElementById('nextDoseTimer');
  const medicationList = document.getElementById('medicationList');
  
  // Lista para almacenar los medicamentos
  let medications = [];
  
  // Función para actualizar la lista de medicamentos en la interfaz
  function updateMedicationList() {
    medicationList.innerHTML = '';
    medications.forEach(med => {
      const li = document.createElement('li');
      li.textContent = `${med.name} - ${med.time}`;
      medicationList.appendChild(li);
    });
    updateNextDose();
  }
  
  // Función para actualizar el temporizador de la siguiente dosis
  function updateNextDose() {
    const lastMed = medications[medications.length - 1];
    if (!lastMed) {
      nextDoseTimer.textContent = 'Añade un medicamento para comenzar.';
      return;
    }
  
    // La siguiente dosis siempre será 4 horas después de la última dosis
    const nextMedTime = new Date(lastMed.time).getTime() + 4 * 60 * 60 * 1000;
    const timeRemaining = nextMedTime - new Date().getTime();
  
    if (timeRemaining <= 0) {
      nextDoseTimer.textContent = `¡Es hora de tomar ${lastMed.done ? 'Ibuprofeno' : 'Tafirol'}!`;
    } else {
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60)); // horas
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)); // minutos
      nextDoseTimer.textContent = `Siguiente dosis en: ${hours} horas y ${minutes} minutos.`;
    }
  }
  
  // Función para agregar un medicamento a Firebase y actualizar la lista
  addMedicationBtn.addEventListener('click', async () => {
    const lastMed = medications[medications.length - 1];
    let newTime;
    
    if (lastMed) {
      // Si ya hay medicamentos, tomamos el último y sumamos 4 horas
      newTime = new Date(lastMed.time).getTime() + 4 * 60 * 60 * 1000;
    } else {
      // Si no hay medicamentos previos, comenzamos desde la hora actual
      newTime = new Date().getTime() + 4 * 60 * 60 * 1000;
    }
  
    const medName = lastMed && lastMed.done ? 'Ibuprofeno' : 'Tafirol';
    const newMed = {
      name: medName,
      time: new Date(newTime).toLocaleString(),
      done: false
    };
  
    // Agregar el nuevo medicamento a Firebase
    await medicationsRef.add(newMed);
  
    // Actualizar la lista local y la interfaz
    medications.push(newMed);
    updateMedicationList();
  });
  
  // Función para obtener medicamentos desde Firebase
  async function getMedications() {
    const snapshot = await medicationsRef.get();
    medications.length = 0; // Limpiar la lista de medicamentos
    snapshot.forEach(doc => {
      medications.push(doc.data());
    });
    updateMedicationList();
  }
  
  // Inicializar y obtener medicamentos desde Firebase al cargar la página
  getMedications();
  