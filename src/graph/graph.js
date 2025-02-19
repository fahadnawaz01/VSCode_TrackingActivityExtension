// ./graph/graph.js
(function () {
  // IIFE
  console.log("graph.js loaded!");

  document.addEventListener("DOMContentLoaded", function () {
    // Correct DOMContentLoaded usage
    console.log("DOM fully loaded!");
    const ctx = document.getElementById("graph-container").getContext("2d");
    let myChart;
    if (ctx) {
      // Check if ctx is valid

      window.addEventListener("message", (event) => {
        const message = event.data;

        if (message.command === "updateData") {
          const data = message.data;

         // console.log("Received data:", data);
          if (!data || Object.keys(data).length === 0) {
            // Handle the case where there is no data
            if (myChart) {
              myChart.destroy();
            }
            ctx.font = "20px Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(
              "No data available",
              ctx.canvas.width / 2,
              ctx.canvas.height / 2
            );

            return; // or display a "No data" message
          }

          const labels = data.labels;
          const values = data.values;

         // console.log("labels" + labels);
          //console.log("Values" + values);
          if (myChart) {
            myChart.destroy();
          }

          myChart = new Chart(ctx, {
            type: "bar",
            data: {
              labels: labels,
              datasets: [
                {
                  label: "Time Spent (Hours)",
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
              // Add some options to the chart
              scales: {
                y: {
                  beginAtZero: true, // Start y-axis at 0
                },
              },
            },
          });
        }
      });
    } else {
      console.error("Could not get canvas context!");
    }
  });
})();
