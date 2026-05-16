// Stage 6 — Priority Inbox
// Priority: Placement (3) > Result (2) > Event (1)

const API_URL = "http://4.224.186.213/evaluation-service/notifications";

const PRIORITY_WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

// Try different auth formats
async function fetchWithAuth(headers) {
  const response = await fetch(API_URL, { method: "GET", headers });
  return response;
}

async function fetchNotifications() {
  const tokenVariants = ["SfFuWg", "$fFuWg"];
  
  // Try different header formats
  for (const token of tokenVariants) {
    const attempts = [
      { "Authorization": `Bearer ${token}` },
      { "Authorization": token },
      { "x-access-code": token },
      { "x-api-key": token },
      { "token": token },
    ];

    for (const headers of attempts) {
      try {
        console.log(`Trying: ${JSON.stringify(headers)}`);
        const response = await fetchWithAuth({
          "Content-Type": "application/json",
          ...headers
        });
        if (response.ok) {
          console.log(`\n✅ Success with: ${JSON.stringify(headers)}\n`);
          const data = await response.json();
          return data.notifications;
        } else {
          console.log(`❌ Failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`Error: ${error.message}`);
      }
    }
  }
  return [];
}

function getPriorityWeight(type) {
  return PRIORITY_WEIGHTS[type] || 0;
}

function sortByPriorityAndRecency(notifications) {
  return notifications.sort((a, b) => {
    const weightDiff = getPriorityWeight(b.Type) - getPriorityWeight(a.Type);
    if (weightDiff !== 0) return weightDiff;
    return new Date(b.Timestamp) - new Date(a.Timestamp);
  });
}

function getTopPriorityNotifications(notifications, n = 10) {
  return sortByPriorityAndRecency(notifications).slice(0, n);
}

function displayNotifications(notifications, topN) {
  console.log("=".repeat(60));
  console.log(`   PRIORITY INBOX — TOP ${topN} NOTIFICATIONS`);
  console.log("=".repeat(60));
  console.log(`Priority: Placement(3) > Result(2) > Event(1)\n`);
  notifications.forEach((n, i) => {
    console.log(`#${i + 1}`);
    console.log(`  ID       : ${n.ID}`);
    console.log(`  Type     : ${n.Type} (Priority: ${getPriorityWeight(n.Type)})`);
    console.log(`  Message  : ${n.Message}`);
    console.log(`  Timestamp: ${n.Timestamp}`);
    console.log("-".repeat(60));
  });
}

async function main() {
  const TOP_N = 10;
  console.log("Fetching notifications from API...\n");
  const notifications = await fetchNotifications();
  if (notifications.length === 0) { 
    console.log("No notifications found. All auth attempts failed."); 
    return; 
  }
  console.log(`Total fetched: ${notifications.length}, Showing top ${TOP_N}:\n`);
  const top = getTopPriorityNotifications(notifications, TOP_N);
  displayNotifications(top, TOP_N);
  console.log("\nSUMMARY:");
  console.log(`  Placement: ${top.filter(n => n.Type === "Placement").length}`);
  console.log(`  Result   : ${top.filter(n => n.Type === "Result").length}`);
  console.log(`  Event    : ${top.filter(n => n.Type === "Event").length}`);
}

main();