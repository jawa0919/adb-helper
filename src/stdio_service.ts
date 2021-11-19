/*
 * @FilePath     : /src/stdio_service.ts
 * @Date         : 2021-11-19 14:25:35
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  :
 */

import * as child_process from "child_process";

export abstract class StdIOService<T> {
  private nextRequestID = 1;
  private readonly activeRequests: { [key: string]: [(result: any) => void | Promise<void>, (error: any) => void | Promise<void>, string] | "CANCELLED" } = {};
  public process?: child_process.ChildProcessWithoutNullStreams;
  private messageBuffers: Buffer[] = [];

  protected createProcess(workingDirectory: string | undefined, binPath: string, args: string[]) {
    this.logTraffic(`Spawning ${binPath} with args ${JSON.stringify(args)}`);
    if (workingDirectory) {
      this.logTraffic(`..  in ${workingDirectory}`);
    }

    this.process = this.safeSpawn(workingDirectory, binPath, args, {});

    this.process.stdout.on("data", (data: Buffer | string) => this.handleStdOut(data));
    this.process.stderr.on("data", (data: Buffer | string) => this.handleStdErr(data));
    this.process.on("exit", (code, signal) => this.handleExit(code, signal));
    this.process.on("error", (error) => this.handleError(error));
  }

  safeSpawn(workingDirectory: string | undefined, binPath: string, args: string[], env: { [key: string]: string | undefined } | undefined): child_process.ChildProcessWithoutNullStreams {
    const quotedArgs = args.map((a) => `"${a.replace(/"/g, `\\"`)}"`);
    const customEnv = Object.assign({}, process.env, env);
    return child_process.spawn(`"${binPath}"`, quotedArgs, { cwd: workingDirectory, env: customEnv, shell: true });
  }

  protected handleStdOut(data: Buffer | string) {
    this.messageBuffers.push(Buffer.from(data));
    if (data.indexOf("\n") >= 0) {
      this.processMessageBuffer();
    }
  }

  protected processMessageBuffer() {
    let fullBuffer = Buffer.concat(this.messageBuffers);
    this.messageBuffers = [];

    // If the message doesn't end with \n then put the last part back into the buffer.
    const lastNewline = fullBuffer.lastIndexOf("\n");
    if (lastNewline !== fullBuffer.length - 1) {
      const incompleteMessage = fullBuffer.slice(lastNewline + 1);
      fullBuffer = fullBuffer.slice(0, lastNewline);
      this.messageBuffers.push(incompleteMessage);
    }

    // Process the complete messages in the buffer.
    fullBuffer
      .toString()
      .split("\n")
      .filter((m) => m.trim() !== "")
      .forEach((m) => this.handleMessage(`${m}\n`));
  }

  public async handleMessage(message: string): Promise<void> {
    this.logTraffic(`<== ${message.trimRight()}\r\n`);
  }

  protected handleStdErr(data: Buffer | string) {}

  protected handleExit(code: number | null, signal: NodeJS.Signals | null) {}

  protected handleError(error: Error) {}

  protected sendMessage(json: string) {
    this.logTraffic(`==> ${json}`);
    if (this.process) {
      this.process.stdin.write(json);
    } else {
      this.logTraffic(`  (not sent: no process)`);
    }
  }

  protected sendRequest<TReq, TResp>(method: string, params?: TReq): Promise<TResp> {
    const id = this.nextRequestID++;
    return new Promise<TResp>((resolve, reject) => {
      this.activeRequests[id.toString()] = [resolve, reject, method];

      const req = this.buildRequest(id, method, params);
      const json = "[" + JSON.stringify(req) + "]\r\n";
      this.sendMessage(json);
    });
  }

  protected buildRequest<TReq>(id: number, method: string, params?: TReq): { id: string; method: string; params?: TReq } {
    return {
      id: id.toString(),
      method,
      params,
    };
  }

  protected logTraffic(message: string, isError = false): void {
    console.log(message);

    // if (isError) this.logger.error(message);
    // else this.logger.info(message);
    // if (this.openLogFile !== this.logFile && this.logStream) {
    //   this.logStream.end();
    //   this.logStream = undefined;
    //   this.openLogFile = undefined;
    // }
    // if (!this.logFile) return;
    // if (!this.logStream) {
    //   this.logStream = fs.createWriteStream(this.logFile);
    //   this.openLogFile = this.logFile;
    // }
    // this.logStream.write(`[${new Date().toLocaleTimeString()}]: `);
    // if (this.maxLogLineLength && message.length > this.maxLogLineLength) this.logStream.write(message.substring(0, this.maxLogLineLength) + "…\r\n");
    // else this.logStream.write(message.trim() + "\r\n");
  }
}
