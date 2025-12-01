  // Project descriptions database (disimpan di localStorage)
  const projectDescriptions = {
    'proj-a': 'Robot Avoider adalah proyek pertama saya yang menggabungkan Arduino dengan sensor ultrasonik.  Alat ini mampu mendeteksi hambatan dan secara otomatis mengubah arah gerakannya.  Teknologi yang digunakan mencakup mikrokontroler, C++, dan pemrograman embedded system.',
    'proj-b': 'SmartHome Device adalah sistem otomasi rumah pintar yang mengintegrasikan berbagai sensor dan aktuator. Sistem ini dapat dikontrol melalui aplikasi mobile dan website. Fitur-fitur mencakup kontrol lampu, suhu, dan keamanan secara real-time.',
    'proj-c': 'Alat Pengukur Jarak adalah perangkat yang menggunakan teknologi ultrasonic untuk mengukur jarak dengan akurasi tinggi. Hasil pengukuran ditampilkan pada layar LCD dan dapat direkam dalam memori perangkat untuk analisis lebih lanjut.'
  };

  // Load descriptions from localStorage
  function loadProjectDescriptions() {
    const saved = localStorage.getItem('projectDescriptions');
    if (saved) {
      try {
        Object.assign(projectDescriptions, JSON.parse(saved));
      } catch (e) {
        console.error('Error loading descriptions:', e);
      }
    }
  }

  // Save descriptions to localStorage
  function saveProjectDescriptions() {
    localStorage. setItem('projectDescriptions', JSON.stringify(projectDescriptions));
  }

  // Project modal handler
  function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = modal. querySelector('.modal-close');
    const modalOverlay = modal.querySelector('.modal-overlay');
    const editBtn = document.getElementById('edit-description-btn');
    const saveBtn = document.getElementById('save-description-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const descriptionContainer = modal.querySelector('.modal-description-container');
    const editContainer = modal.querySelector('.modal-edit-container');
    const descriptionInput = document.getElementById('description-input');
    const descriptionText = document.getElementById('modal-description');
    let currentProjectId = null;

    // Open modal
    document.querySelectorAll('.card-project . btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e. preventDefault();
        currentProjectId = btn.dataset.project;
        const card = btn.closest('.card-project');
        const title = card.querySelector('h3'). textContent;
        const desc = projectDescriptions[currentProjectId] || '';
        
        document.getElementById('modal-title').textContent = title;
        descriptionText.textContent = desc;
        descriptionInput.value = desc;
        
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close modal
    function closeModal() {
      modal. setAttribute('aria-hidden', 'true');
      document.body. style.overflow = 'auto';
      descriptionContainer.style.display = 'block';
      editContainer.style. display = 'none';
      currentProjectId = null;
    }

    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });

    // Edit mode
    editBtn.addEventListener('click', () => {
      descriptionContainer.style.display = 'none';
      editContainer.style. display = 'block';
      descriptionInput.focus();
    });

    cancelBtn.addEventListener('click', () => {
      descriptionContainer. style.display = 'block';
      editContainer.style.display = 'none';
      descriptionInput.value = projectDescriptions[currentProjectId] || '';
    });

    // Save description
    saveBtn.addEventListener('click', () => {
      const newDescription = descriptionInput.value. trim();
      if (newDescription) {
        projectDescriptions[currentProjectId] = newDescription;
        saveProjectDescriptions();
        descriptionText.textContent = newDescription;
        descriptionContainer.style.display = 'block';
        editContainer.style. display = 'none';
      }
    });

    // Save on Enter (when focused on textarea)
    descriptionInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        saveBtn.click();
      }
    });
  }

  loadProjectDescriptions();
  initProjectModal();
