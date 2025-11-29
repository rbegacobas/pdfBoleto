(function(){
  const form = document.getElementById('pdf-form');
  const statusEl = document.getElementById('status');
  const generateBtn = document.getElementById('generate');
  const addPassengerBtn = document.getElementById('addPassenger');
  const passengerList = document.getElementById('passengerList');

  let passengerCount = 1;

  // Agregar nuevo campo de pasajero
  addPassengerBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'passenger-row';
    row.dataset.index = passengerCount;
    
    row.innerHTML = `
      <input
        type="text"
        name="passenger-${passengerCount}"
        placeholder="NOMBRE APELLIDO"
        required
        style="flex: 1;"
      />
      <button type="button" class="delete-btn" data-index="${passengerCount}">🗑️</button>
    `;
    
    // Agregar evento al botón de eliminar
    const deleteBtn = row.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
      const rows = passengerList.querySelectorAll('.passenger-row');
      if (rows.length === 1) {
        alert('Debe haber al menos un pasajero');
        return;
      }
      row.remove();
    });
    
    passengerList.appendChild(row);
    passengerCount++;
  });

  function setStatus(message, type) {
    statusEl.className = 'status ' + (type || '');
    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
  }

  function clearStatus(){ statusEl.className = 'status hidden'; statusEl.textContent = ''; }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    clearStatus();

    // Recopilar todos los nombres de pasajeros
    const passengers = [];
    const inputs = passengerList.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
      const name = input.value.trim();
      if (name) {
        passengers.push(name);
      }
    });
    
    if (passengers.length === 0) {
      setStatus('Agregue al menos un pasajero', 'error');
      return;
    }

    const data = {
      country: form.country.value,
      name: passengers.join('\n'), // Unir nombres con salto de línea
      entryDate: form.entryDate.value,
      exitDate: form.exitDate.value,
    };

    generateBtn.disabled = true;
    setStatus('Generando PDF, por favor espera...', 'loading');

    try {
      const resp = await fetch('/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if(!resp.ok){
        const err = await resp.json().catch(()=>({message:resp.statusText}));
        throw new Error(err.message || 'Error generando PDF');
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      // try to extract filename from headers
      const cd = resp.headers.get('Content-Disposition') || '';
      const m = cd.match(/filename="?([^";]+)"?/);
      const filename = m ? m[1] : `${data.country}_${data.name}.pdf`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatus('PDF generado. La descarga debería comenzar automáticamente.', null);
    } catch (error) {
      setStatus('Error: ' + (error.message || 'Error desconocido'), 'error');
    } finally {
      generateBtn.disabled = false;
      setTimeout(()=>clearStatus(), 4500);
    }
  });
})();
