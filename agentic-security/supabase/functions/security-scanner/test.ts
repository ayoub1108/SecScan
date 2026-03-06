
// Simple test script to execute the security scanner function locally

const ENDPOINT = "http://localhost:54321/functions/v1/security-scanner";

// Call init-scan endpoint
async function testInitScan() {
  try {
    const response = await fetch(`${ENDPOINT}/init-scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repo: "test/repository",
      }),
    });
    
    const data = await response.json();
    console.log("Init Scan Response:", data);
  } catch (error) {
    console.error("Init Scan Error:", error);
  }
}

// Call scan-repo endpoint
async function testScanRepo() {
  try {
    const response = await fetch(`${ENDPOINT}/scan-repo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repo: "test/repository",
        branch: "main",
        useWebSearch: true,
        createIssues: true,
      }),
    });
    
    const data = await response.json();
    console.log("Scan Repo Response:", data);
  } catch (error) {
    console.error("Scan Repo Error:", error);
  }
}

// Call scan-results endpoint
async function testScanResults() {
  try {
    const response = await fetch(`${ENDPOINT}/scan-results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repo: "test/repository",
        limit: 3,
      }),
    });
    
    const data = await response.json();
    console.log("Scan Results Response:", data);
  } catch (error) {
    console.error("Scan Results Error:", error);
  }
}

// Run tests sequentially
async function runTests() {
  console.log("Testing Security Scanner Edge Function...");
  
  await testInitScan();
  await testScanRepo();
  await testScanResults();
  
  console.log("Tests completed.");
}

runTests();
