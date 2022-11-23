import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  public isReady = false;
  private ffmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async init() {
    // check if ffmpeg has already loaded
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load();
    this.isReady = true;
  }

  async getScreenshots(file: File) {
    // convert to binary
    const data = await fetchFile(file);

    // store to memory
    this.ffmpeg.FS('writeFile', file.name, data);

    // pick timestamps for generating images
    const seconds = [1, 2, 3];
    const commands: string[] = [];

    seconds.forEach((second) => {
      commands.push(
        // input
        '-i',
        file.name,
        // output options
        // grab screenshot from timestamp
        '-ss',
        `00:00:0${second}`,
        // configure number of frames (1)
        '-frames:v',
        '1',
        // resize image and maintain aspect ratio
        '-filter:v',
        'scale=510:-1',
        // output
        `output_0${second}.png`
      );
    });

    await this.ffmpeg.run(...commands);

    const screenshots: string[] = [];

    seconds.forEach((second) => {
      // grab the file from the isolated file system
      const screenshotFile = this.ffmpeg.FS(
        'readFile',
        `output_0${second}.png`
      );
      // convert binary to URL using blobs
      const screenshotBlob = new Blob([screenshotFile.buffer], {
        type: 'image/png',
      });
      const screenshotUrl = URL.createObjectURL(screenshotBlob);
      screenshots.push(screenshotUrl);
    });

    return screenshots;
  }
}
