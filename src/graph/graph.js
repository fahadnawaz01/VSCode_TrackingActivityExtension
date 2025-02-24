(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const graphTypeSelect = document.getElementById("graph-type");
    const yearSelect = document.getElementById("year-select");
    const monthSelect = document.getElementById("month-select");
    const ctx = document.getElementById("graph-container").getContext("2d");
    let myChart;
    let vscodeData;

    if (ctx) {
      function populateDropdowns(data) {
        const years = data.year || {};
        const months = data.month || {};
        yearSelect.innerHTML = '<option value="">Select Year</option>';
        years.forEach((year) => {
          const option = document.createElement("option");
          option.value = year;
          option.text = year;
          yearSelect.appendChild(option);
        });

        monthSelect.disabled = true;
        monthSelect.innerHTML = '<option value="">Select Month</option>';
      }

      function updateChart() {
        const graphType = graphTypeSelect.value;
        const selectedYear = yearSelect.value;
        const selectedMonth = monthSelect.value;

        let chartData = {};

        if (graphType === "yearly") {
          if (
            selectedYear &&
            vscodeData &&
            vscodeData.year.includes(selectedYear)
          ) {
            chartData = allTimeTransformData(vscodeData.logs[selectedYear]);
          }
        } else if (graphType === "monthly") {
          if (
            selectedYear &&
            selectedMonth &&
            vscodeData &&
            vscodeData.year.includes(selectedYear) &&
            vscodeData.month.includes(`${selectedMonth}-${selectedYear}`)
          ) {
            // Check if vscodeData exists
            chartData = allTimeTransformData(
              vscodeData.logs[selectedYear][selectedMonth]
            );
          }
        }

        const labels = chartData.labels || [];
        const values = chartData.values || [];

        if (myChart) {
          myChart.destroy();
        }

        if (labels.length === 0 || values.length === 0) {
          ctx.font = "20px Arial";
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.fillText(
            "No data available",
            ctx.canvas.width / 2,
            ctx.canvas.height / 2
          );
          return;
        }

        myChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Time Spent (Minutes)",
                data: values,
                backgroundColor: [
                  // Add some colors
                  "rgba(255, 99, 132, 0.2)",
                  "rgba(54, 162, 235, 0.2)",
                  "rgba(255, 206, 86, 0.2)",
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(153, 102, 255, 0.2)",
                  "rgba(255, 159, 64, 0.2)",
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                  "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }

      graphTypeSelect.addEventListener("change", updateChart);
      yearSelect.addEventListener("change", () => {
        updateChart();
        const selectedYear = yearSelect.value;
        if (
          selectedYear &&
          vscodeData &&
          vscodeData.year.includes(selectedYear)
        ) {
          const months = vscodeData.month;

          monthSelect.innerHTML = '<option value="">Select Month</option>';
          months.forEach((month) => {
            if (month.endsWith(selectedYear)) {
              month = month.split("-")[0];
              const option = document.createElement("option");
              option.value = month;
              option.text = month;
              monthSelect.appendChild(option);
            }
          });
          monthSelect.disabled = false;
        } else {
          monthSelect.disabled = true;
          monthSelect.innerHTML = '<option value="">Select Month</option>';
        }
      });

      monthSelect.addEventListener("change", updateChart);

      window.addEventListener("message", (event) => {
        const message = event.data;
        if (message.command === "updateData") {
          vscodeData = message.data;
          populateDropdowns(message.data);
          updateChart();
        }
      });

      updateChart();
    } else {
      console.error("Could not get canvas context!");
    }
  });
})();

let data = {};

function transformData(logs) {
  if (!Array.isArray(logs)) {
    for (const key in logs) {
      transformData(logs[key]);
    }
  } else {
    for (const log of logs) {
      for (const i in log.fileType) {
        if (Array.isArray(log.fileType[i])) {
          const fileType = log.fileType[i][0];
          const value = log.fileType[i][1];

          if (data[fileType]) {
            data[fileType] += value;
          } else {
            data[fileType] = value;
          }
        }
      }
    }
  }
  return data;
}

function allTimeTransformData(logs) {
  data = {};
  const labels = [];
  const values = [];
  const transformedData = transformData(logs);

  for (const label in transformedData) {
    if (transformedData.hasOwnProperty(label)) {
      labels.push(label);
      values.push(transformedData[label]);
    }
  }

  return { labels, values };
}
