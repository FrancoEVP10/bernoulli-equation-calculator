document.addEventListener('DOMContentLoaded', function() {
  const repeatCount = document.getElementById('repeatCount');
  const equationContainer = document.getElementById('equationContainer');
  const calculateButton = document.getElementById('calculateButton');
  const resultContainer = document.getElementById('result');
  let myChart; // Variable para almacenar la instancia del gráfico

  function createEquationInputs(count) {
      equationContainer.innerHTML = '';
      for (let i = 0; i < count; i++) {
          const equationDiv = document.createElement('div');
          equationDiv.className = 'equation';
          equationDiv.innerHTML = `
              <p>
                  <input type="number" class="pressure" step="0.01" required> +
                  <span class="fraction">
                      <span class="numerator">1</span>
                      <span class="denominator">2</span>
                  </span>
                  * <input type="number" class="density" step="0.01" required>
                  * <input type="number" class="velocity" step="0.01" required><sup>2</sup> +
                  <input type="number" class="density2" step="0.01" required> * 9.81 *
                  <input type="number" class="height" step="0.01" required> = 
                  <span class="result">constante</span>
              </p>
          `;
          equationContainer.appendChild(equationDiv);
      }
  }

  function updateChart(constants) {
      if (myChart) {
          myChart.destroy(); // Destruir gráfico anterior si existe
      }

      const labels = Array.from({ length: constants.length }, (_, i) => `Ecuación ${i + 1}`);
      const data = constants.map(c => c.toFixed(2));

      const ctx = document.getElementById('myChart').getContext('2d');
      myChart = new Chart(ctx, {
          type: 'line', // Tipo de gráfico: línea
          data: {
              labels: labels,
              datasets: [{
                  label: 'Resultados',
                  data: constants.map((c, i) => ({ x: i, y: c })),
                  fill: false, // No rellenar debajo de la línea
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 2,
                  pointRadius: 4,
                  pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                  pointBorderColor: 'rgba(75, 192, 192, 1)',
                  pointHoverRadius: 6,
                  pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
                  pointHoverBorderColor: 'rgba(220, 220, 220, 1)'
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  x: {
                      title: {
                          display: true,
                          text: 'Ecuación'
                      }
                  },
                  y: {
                      title: {
                          display: true,
                          text: 'Resultado'
                      }
                  }
              }
          }
      });
  }

  if (repeatCount) {
      repeatCount.addEventListener('change', function() {
          const count = parseInt(this.value, 10);
          createEquationInputs(count);
      });
  }

  if (calculateButton) {
    calculateButton.addEventListener('click', function(event) {
        event.preventDefault();
        const pressures = document.querySelectorAll('.pressure');
        const densities = document.querySelectorAll('.density');
        const velocities = document.querySelectorAll('.velocity');
        const heights = document.querySelectorAll('.height');

        const data = [];
        for (let i = 0; i < pressures.length; i++) {
            const p = parseFloat(pressures[i].value);
            const rho = parseFloat(densities[i].value);
            const v = parseFloat(velocities[i].value);
            const y = parseFloat(heights[i].value);

            data.push({ pressure: p, density: rho, velocity: v, height: y });
        }

        fetch('https://back-calculator-r0mm.onrender.com/calculate/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: data })
        })
        .then(response => response.json())
        .then(data => {
            const constants = data.constants;
            const resultSpans = document.querySelectorAll('.result');
            
            constants.forEach((constant, index) => {
                resultSpans[index].textContent = constant.toFixed(2);
            });

            // Mostrar el canvas después de calcular
            const chartContainer = document.getElementById('myChart').parentNode;
            chartContainer.style.display = 'block'; // Muestra el contenedor del canvas

            // Actualizar el gráfico con los nuevos resultados
            updateChart(constants);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}


  // Initialize with default value
  if (repeatCount) {
      createEquationInputs(parseInt(repeatCount.value, 10));
  }
});