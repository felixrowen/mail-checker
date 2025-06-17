import { spawn } from "child_process";

export function runPythonCheck(domain: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const process = spawn("python", ["./src/scripts/main.py", domain]);

    let result = "";
    let error = "";

    process.stdout.on("data", (data) => {
      result += data.toString();
    });

    process.stderr.on("data", (data) => {
      error += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        try {
          const json = JSON.parse(result);
          resolve(json);
        } catch (err) {
          reject("Failed to parse JSON from Python");
        }
      } else {
        reject(error || `Python script exited with code ${code}`);
      }
    });
  });
}
