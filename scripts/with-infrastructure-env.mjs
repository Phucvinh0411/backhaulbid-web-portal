import { spawn } from "node:child_process";

import { loadFrontendEnvironment } from "./sharedInfrastructureEnv.mjs";

const commandAndArguments = process.argv.slice(2);

if (commandAndArguments.length === 0) {
  console.error(
    "Cách dùng: node scripts/with-infrastructure-env.mjs <command> [args...]",
  );
  process.exitCode = 1;
} else {
  try {
    const loadedEnvironment = loadFrontendEnvironment();
    const missingVariables = loadedEnvironment.missing;

    if (missingVariables.length > 0) {
      console.warn(
        `[shared-env] Thiếu cấu hình eKYC: ${missingVariables.join(", ")}. Trang eKYC sẽ hiển thị hướng dẫn cấu hình.`,
      );
    }

    const [command, ...argumentsForCommand] = commandAndArguments;
    const childProcess = spawn(command, argumentsForCommand, {
      env: loadedEnvironment.environment,
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    childProcess.on("error", (error) => {
      console.error(`[shared-env] Không thể chạy lệnh frontend: ${error.message}`);
      process.exitCode = 1;
    });

    childProcess.on("exit", (code, signal) => {
      process.exitCode = code ?? (signal ? 1 : 0);
    });
  } catch (error) {
    console.error(`[shared-env] ${error.message}`);
    process.exitCode = 1;
  }
}
