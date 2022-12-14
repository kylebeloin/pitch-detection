export const options = {
  freqMin: 50,
  freqLow: 50,
  freqHigh: 200,
  freqMax: 500,
  freqRate: 100,
  sampleRate: 48000,
  enmax: 0.1,
  enmin: 0.5,
  disptime: 5,
  style: {
    BACKCOLOUR: "#fafafa",
    GRIDCOLOUR: "#DDDDDD",
    AMPCOLOUR: "#2a6cad",
    FREQCOLOUR: "#b8dcff",
    FREQWIDTH: 1,
    GRIDWIDTH: 3,
  },
};

export class AutoCorrelation {
  sampleRate: number;
  tmin: number;
  tmax: number;
  bias: Float32Array;
  ac: Float32Array;
  calculateFrequency: (
    a: Float32Array,
    O: number
  ) => { fx: number; tx: number; vs: any; en: number };
  constructor(
    freqMin: number,
    freqLow: number,
    freqHigh: number,
    freqMax: number,
    sampleRate: number
  ) {
    this.sampleRate = sampleRate;
    this.tmin = Math.round(this.sampleRate / freqMax);
    this.tmax = Math.round(this.sampleRate / freqMin);
    this.bias = new Float32Array(this.tmax + 1);
    this.ac = new Float32Array(this.tmax + 1);
    const m = Math.log(freqLow);
    const B = m * m;
    const D = 1;
    const E = 0.95;
    const v = Math.log(freqHigh);
    const w = v * v;
    const o = 1;
    const x = 0.95;
    let G = (m + v) / 2;
    const F = G * G;
    const H = 1;
    const t = 1;
    const q =
      B * G * o + m * H * w + D * F * v - D * G * w - B * H * v - m * F * o;
    const y =
      E * G * o + m * H * x + D * t * v - D * G * x - E * H * v - m * t * o;
    const J =
      B * t * o + E * H * w + D * F * x - D * t * w - B * H * x - E * F * o;
    const I =
      B * G * x + m * t * w + E * F * v - E * G * w - B * t * v - m * F * x;
    for (let r = this.tmin - 1; r <= this.tmax; r++) {
      G = Math.log(this.sampleRate / r);
      this.bias[r] = (G * G * y) / q + (G * J) / q + I / q;
    }
    this.calculateFrequency = function (a: Float32Array, O: number) {
      let Q = 0;
      for (let j = 0; j < O; j++) {
        Q += a[j] * a[j];
      }
      Q = Math.sqrt(Q / O);
      for (let f = this.tmin - 1; f <= this.tmax; f++) {
        let T = 0;
        let R = 0;
        let S = 0;
        for (let j = 0; j < O - f; j++) {
          S += a[j] * a[j + f];
          T += a[j] * a[j];
          R += a[j + f] * a[j + f];
        }
        this.ac[f] = (this.bias[f] * S) / Math.sqrt(T * R);
      }
      let N = this.tmin - 1;
      let d = this.ac[N];
      for (let f = this.tmin; f <= this.tmax; f++) {
        if (this.ac[f] > d) {
          d = this.ac[f];
          N = f;
        }
      }
      if (N <= this.tmin + 1 || N >= this.tmax - 1 || d < 0.5) {
        return { fx: 0, tx: N / this.sampleRate, vs: d, en: Q };
      }
      let K = this.ac[N - 1];
      let P = this.ac[N];
      let l = this.ac[N + 1];
      let g = (0.5 * (l - K)) / (2 * P - K - l);
      let h = N + g;
      let b = 2;
      if (d > 0.9) {
        for (let L = b; L > 1; L--) {
          let e = true;
          for (let M = 1; M < L; M++) {
            let c = Math.round((M * h) / L);
            if (this.ac[c] < 0.9 * d) {
              e = false;
            }
          }
          if (e) {
            h = h / L;
            break;
          }
        }
      }
      return { tx: h / this.sampleRate, fx: this.sampleRate / h, vs: d, en: Q };
    };
  }
}

export const processAudio = (view: Float32Array) => {
  const { freqMin, freqLow, freqHigh, freqMax, sampleRate } = options;
  let autoCorrelator = new AutoCorrelation(
    freqMin,
    freqLow,
    freqHigh,
    freqMax,
    sampleRate
  );

  let track = [];
  let animationLength = options.sampleRate / 20;
  let animationBuff = new Float32Array(animationLength);
  let animationPosition = 0;
  let enmin = 0.5;
  let enmax = 0.1;
  for (let i = 0; i < view.length; i++) {
    animationBuff[animationPosition++] = view[i].valueOf();
    if (animationPosition === animationLength) {
      let fxest = autoCorrelator.calculateFrequency(
        animationBuff,
        animationLength
      );
      if (fxest.en > 0) {
        enmin = fxest.en < enmin ? fxest.en : 0.99 * enmin + 0.01 * fxest.en;
        enmax = fxest.en > enmax ? fxest.en : 0.99 * enmax + 0.01 * fxest.en;
      }
      //					console.log("enmin="+enmin+" enmax="+enmax+" en="+fxest.en);
      fxest.en > 0.1 * enmax
        ? track.push([fxest.fx, fxest.en / enmax, fxest.vs])
        : track.push([0, 0, 0]);
      // stop after one screen in mode 2
      // shift analysis buffer by 10ms
      let j;
      for (
        animationPosition = 0, j = animationLength / 3;
        j < animationLength;
        j++, animationPosition++
      )
        animationBuff[animationPosition] = animationBuff[j];
    }
  }
  return track;
};

export const normalizeData = (data: number[][], canvas: HTMLCanvasElement) => {
  const [logFreqMin, logFreqMax] = [
    Math.log(options.freqMin),
    Math.log(options.freqMax),
  ];

  for (
    let i = data.length - canvas.width, x = 0;
    i < data.length - 1;
    i++, x++
  ) {
    if (i >= 1 && data[i][0] > 0) {
      let f1 = data[i - 1][0];
      let f2 = data[i][0];
      let f3 = data[i + 1][0];
      if (
        f1 > 0.45 * f2 &&
        f1 < 0.55 * f2 &&
        f3 > 0.45 * f2 &&
        f3 < 0.55 * f2
      ) {
      } else if (
        f1 > 1.8 * f2 &&
        f1 < 2.2 * f2 &&
        f3 > 1.8 * f2 &&
        f3 < 2.2 * f2
      ) {
        data[i][0] = 2 * f2;
      } else if (f1 < 0.75 * f2 && f3 < 0.75 * f2) data[i][0] = 0;
      else if (f1 > 1.25 * f2 && f3 > 1.25 * f2) data[i][0] = 0;
    }
  }

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const std = (arr: number[]) => {
    const m = mean(arr);
    return Math.sqrt(mean(arr.map((a) => Math.pow(a - m, 2))));
  };

  const isOutlier = (arr: number[]) => {
    // strip zero values
    const d = arr.filter((a) => a > 0);

    const m = mean(d);
    const s = std(arr);
    const z = (arr[0] - m) / s;
    return z > 3 || z < -3;
  };

  // const localMedian = (arr: number[], i: number) => {
  //   const window = 5;
  //   const start = Math.max(0, i - window);
  //   const end = Math.min(arr.length, i + window);
  //   const windowArr = arr.slice(start, end);
  //   windowArr.sort((a, b) => a - b);
  //   const median = windowArr[Math.floor(windowArr.length / 2)];
  //   console.log(median);
  //   return median;
  // };

  const localMean = (arr: number[], i: number) => {
    const window = 6;
    const start = Math.max(0, i - window);
    const end = Math.min(arr.length, i + window);
    const windowArr = arr.slice(start, end);
    const mean = windowArr.reduce((a, b) => a + b, 0) / windowArr.length;
    console.log(mean);
    return mean;
  };

  let currentTime = data.length / options.freqRate;
  let disptime = currentTime;

  let yData = [];

  for (let i = 0; i < data.length - 1; i++) {
    if (i >= 0 && data[i][0] > 0) {
      let x1 = (i - 0) / (disptime * options.freqRate);
      let x2 = (i + 1) / (disptime * options.freqRate);

      let y1 = (Math.log(data[i][0]) - logFreqMin) / (logFreqMax - logFreqMin);
      let y2 =
        (Math.log(data[i + 1][0]) - logFreqMin) / (logFreqMax - logFreqMin);
      let change = Math.abs(
        (2 * (data[i][0] - data[i + 1][0])) / (data[i][0] + data[i + 1][0])
      );
      if (data[i + 1][0] > 0 && change < 0.2) {
        let xMid = (x1 + x2) / 2;
        let yMid = (y1 + y2) / 2;
        yData.push([xMid, yMid]);
      } else if (data[i + 1][0] > 0 && change > 0.2) {
        data[i + 1][0] = data[i - 1][0];
      }
    } else {
      let x1 = i / (disptime * options.freqRate);
      let y1 = (Math.log(data[i][0]) - logFreqMin) / (logFreqMax - logFreqMin);
      yData.push([x1, y1]);
    }
  }

  return yData;
};

export const drawPitch = (
  data: any[][],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  const [logFreqMin, logFreqMax] = [
    Math.log(options.freqMin),
    Math.log(options.freqMax),
  ];
  // convert this draw function to return just the data

  for (
    let i = data.length - canvas.width, x = 0;
    i < data.length - 1;
    i++, x++
  ) {
    if (i >= 1 && data[i][0] > 0) {
      let f1 = data[i - 1][0];
      let f2 = data[i][0];
      let f3 = data[i + 1][0];
      if (f1 > 0.45 * f2 && f1 < 0.55 * f2 && f3 > 0.45 * f2 && f3 < 0.55 * f2)
        data[i][0] = f2 / 2;
      else if (f1 > 1.8 * f2 && f1 < 2.2 * f2 && f3 > 1.8 * f2 && f3 < 2.2 * f2)
        data[i][0] = 2 * f2;
      else if (f1 < 0.75 * f2 && f3 < 0.75 * f2) data[i][0] = 0;
      else if (f1 > 1.25 * f2 && f3 > 1.25 * f2) data[i][0] = 0;
    }
  }

  // use the length of the data array to determine the width of the canvas

  let currentTime = data.length / options.freqRate;
  let disptime = currentTime;

  ctx.clearRect(0, 0, canvas.width as number, canvas.height as number);
  ctx.fillStyle = options.style.BACKCOLOUR;

  ctx.fillRect(0, 0, canvas.width as number, canvas.height as number);

  ctx.strokeStyle = options.style.GRIDCOLOUR;
  ctx.lineWidth = 1;
  ctx.beginPath();

  let tshift = currentTime - Math.floor(currentTime / 0.1) * 0.1;
  for (let t = 0; t < disptime + tshift; t += 0.1) {
    let x = Math.round((canvas.width * (t - tshift)) / disptime);
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, canvas.height);
  }
  ctx.stroke();

  ctx.strokeStyle = options.style.GRIDCOLOUR;
  ctx.lineWidth = options.style.GRIDWIDTH;
  ctx.beginPath();
  tshift = currentTime - Math.floor(currentTime);
  for (let t = 0; t < disptime + tshift; t += 1) {
    let x = Math.round((canvas.width * (t - tshift)) / disptime);
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, canvas.height);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let f = 50; f <= options.freqMax; f += 50) {
    let y = Math.round(
      canvas.height -
        (canvas.height * (Math.log(f) - logFreqMin)) / (logFreqMax - logFreqMin)
    );
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }
  // ctx.stroke();

  ctx.strokeStyle = options.style.AMPCOLOUR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  let d1 = [];
  for (let i = 0; i < data.length - 1; i++) {
    let x1 = (i * canvas.width) / (disptime * options.freqRate);
    let x2 = ((i + 1) * canvas.width) / (disptime * options.freqRate);
    let y1 =
      (canvas.height * (Math.log(data[i][0]) - logFreqMin)) /
      (logFreqMax - logFreqMin);

    let y2 =
      (canvas.height * (Math.log(data[i + 1][0]) - logFreqMin)) /
      (logFreqMax - logFreqMin);
    let w1 = (canvas.height * data[i][1]) / 10;
    let w2 = (canvas.height * data[i + 1][1]) / 10;
    let change = Math.abs(
      (2 * (data[i][0] - data[i + 1][0])) / (data[i][0] + data[i + 1][0])
    );
    if (data[i + 1][0] > 0 && change < 0.2) {
      for (let x = x1; x <= x2; x++) {
        let m = (x - x1) / (x2 - x1);
        let yStart =
          canvas.height - ((1 - m) * y1 + m * y2) + ((1 - m) * w1 + m * w2) / 2;
        let yEnd =
          canvas.height - ((1 - m) * y1 + m * y2) - ((1 - m) * w1 + m * w2) / 2;
        d1.push([
          x / canvas.width,
          yStart / canvas.height,
          yEnd / canvas.height,
        ]);
        ctx.moveTo(x, yStart);
        ctx.lineTo(x, yEnd);
      }
    } else {
      let yStart = canvas.height - y1 + w1 / 2;
      let yEnd = canvas.height - y1 - w1 / 2;
      d1.push([x1, yStart, yEnd]);
      ctx.moveTo(x1, canvas.height - y1 + w1 / 2);
      ctx.lineTo(x1, canvas.height - y1 - w1 / 2);
    }
  }
  console.log(d1);
  ctx.stroke();

  ctx.strokeStyle = options.style.FREQCOLOUR;
  ctx.lineWidth = 2;
  ctx.beginPath();

  let d2 = [];

  for (let i = 0; i < data.length - 1; i++) {
    if (i >= 0 && data[i][0] > 0) {
      let x1 = ((i - 0) * canvas.width) / (disptime * options.freqRate);
      let x2 = ((i + 1) * canvas.width) / (disptime * options.freqRate);

      let y1 =
        (canvas.height * (Math.log(data[i][0]) - logFreqMin)) /
        (logFreqMax - logFreqMin);
      let y2 =
        (canvas.height * (Math.log(data[i + 1][0]) - logFreqMin)) /
        (logFreqMax - logFreqMin);
      let change = Math.abs(
        (2 * (data[i][0] - data[i + 1][0])) / (data[i][0] + data[i + 1][0])
      );
      if (data[i + 1][0] > 0 && change < 0.2) {
        let xMid = (x1 + x2) / 2;
        let yMid = (y1 + y2) / 2;
        d2.push([xMid / canvas.width, yMid / canvas.height]);
        ctx.moveTo(x1, canvas.height - y1);
        ctx.lineTo(x2, canvas.height - y2);
      } else {
        d2.push([x1 / canvas.width, y1 / canvas.height]);
        ctx.moveTo(x1, canvas.height - y1 - 1);
        ctx.lineTo(x1, canvas.height - y1 + 1);
      }
    } else {
      let x1 = ((i - 0) * canvas.width) / (disptime * options.freqRate);
      d2.push([x1, 0]);
    }
  }
  console.log(d2);
  ctx.stroke();
};
