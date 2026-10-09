import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const appDirectory = path.resolve(scriptDirectory, "..");
const previewHost = "127.0.0.1";
const previewPort = 3101;
const nextPort = 3103;
const gatewayUrl = new URL("http://localhost:8080");

const nextProcess = spawn(
  process.execPath,
  [
    path.join(appDirectory, "node_modules", "next", "dist", "bin", "next"),
    "start",
    "--hostname",
    previewHost,
    "--port",
    String(nextPort),
  ],
  {
    cwd: appDirectory,
    env: {
      ...process.env,
      INTERNAL_GATEWAY_URL: gatewayUrl.origin,
      COOKIE_SECURE: "false",
    },
    stdio: "inherit",
  },
);

const isGatewayRequest = (pathname) =>
  pathname.startsWith("/api/v1/") ||
  pathname.startsWith("/notification-socket") ||
  pathname.startsWith("/bidding-socket");

const makeUpstreamRequest = (request, response, useGateway) => {
  const target = useGateway
    ? { hostname: gatewayUrl.hostname, port: gatewayUrl.port }
    : { hostname: previewHost, port: nextPort };
  const headers = { ...request.headers, host: `${target.hostname}:${target.port}` };

  // The proxy makes a server-to-server request, so browser CORS headers do not apply.
  delete headers.origin;
  delete headers.referer;

  const upstream = http.request(
    {
      ...target,
      method: request.method,
      path: request.url,
      headers,
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    },
  );

  upstream.on("error", () => {
    if (!response.headersSent) {
      response.writeHead(502, { "content-type": "application/json; charset=utf-8" });
    }
    response.end(JSON.stringify({ message: "Không thể kết nối tới máy chủ." }));
  });

  request.pipe(upstream);
  return upstream;
};

const previewServer = http.createServer((request, response) => {
  const useGateway = isGatewayRequest(new URL(request.url ?? "/", "http://localhost").pathname);
  makeUpstreamRequest(request, response, useGateway);
});

const waitForNext = async () => {
  const deadline = Date.now() + 30_000;

  while (!shuttingDown && Date.now() < deadline) {
    if (nextProcess.exitCode !== null) return false;

    const ready = await new Promise((resolve) => {
      const request = http.get(`http://${previewHost}:${nextPort}/`, (response) => {
        response.resume();
        resolve(true);
      });
      request.setTimeout(1_000, () => request.destroy());
      request.on("error", () => resolve(false));
    });

    if (ready) return true;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return false;
};

previewServer.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  const useGateway = isGatewayRequest(pathname);
  const target = useGateway
    ? { hostname: gatewayUrl.hostname, port: gatewayUrl.port }
    : { hostname: previewHost, port: nextPort };
  const headers = { ...request.headers, host: `${target.hostname}:${target.port}` };
  delete headers.origin;
  delete headers.referer;

  const upstream = http.request({
    ...target,
    method: request.method,
    path: request.url,
    headers,
  });

  upstream.on("upgrade", (upstreamResponse, upstreamSocket, upstreamHead) => {
    const responseHeaders = upstreamResponse.rawHeaders;
    socket.write(`HTTP/${upstreamResponse.httpVersion} 101 Switching Protocols\r\n`);
    for (let index = 0; index < responseHeaders.length; index += 2) {
      socket.write(`${responseHeaders[index]}: ${responseHeaders[index + 1]}\r\n`);
    }
    socket.write("\r\n");
    if (upstreamHead.length) socket.write(upstreamHead);
    if (head.length) upstreamSocket.write(head);
    socket.pipe(upstreamSocket);
    upstreamSocket.pipe(socket);
  });

  upstream.on("response", (upstreamResponse) => {
    socket.write(`HTTP/${upstreamResponse.httpVersion} ${upstreamResponse.statusCode} ${upstreamResponse.statusMessage}\r\n`);
    for (let index = 0; index < upstreamResponse.rawHeaders.length; index += 2) {
      socket.write(`${upstreamResponse.rawHeaders[index]}: ${upstreamResponse.rawHeaders[index + 1]}\r\n`);
    }
    socket.write("\r\n");
    upstreamResponse.pipe(socket);
  });

  upstream.on("error", () => socket.destroy());
  upstream.end();
});

nextProcess.on("exit", (code) => {
  if (!shuttingDown) {
    console.error(`Next.js đã dừng${code === null ? "" : ` (mã ${code})`}.`);
    previewServer.close();
    process.exitCode = code ?? 1;
  }
});

let shuttingDown = false;
const stopPreview = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  previewServer.close();
  nextProcess.kill("SIGTERM");
};

process.on("SIGINT", stopPreview);
process.on("SIGTERM", stopPreview);

const startPreview = async () => {
  if (!(await waitForNext())) {
    console.error("Next.js không sẵn sàng trong 30 giây; preview chưa được mở.");
    stopPreview();
    process.exitCode = 1;
    return;
  }

  previewServer.listen(previewPort, previewHost, () => {
    console.log(`Web preview: http://localhost:${previewPort}`);
    console.log(`API gateway: ${gatewayUrl.origin} (same-origin proxy enabled)`);
    console.log("Nhấn Ctrl+C để dừng preview.");
  });
};

startPreview();
