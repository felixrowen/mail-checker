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

export function runMailEchoCheck(domain: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const process = spawn("python", [
      "-c",
      `
import sys
sys.path.append('./src/scripts')
from mail_echo_check import check_mail_echo_with_smtp
from utils import parse_domain
import json

domain = "${domain}"
clean_domain = parse_domain(domain)
result = check_mail_echo_with_smtp(clean_domain)
print(json.dumps(result))
    `,
    ]);

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
          reject("Failed to parse JSON from Python mail echo check");
        }
      } else {
        reject(error || `Mail echo check exited with code ${code}`);
      }
    });
  });
}
