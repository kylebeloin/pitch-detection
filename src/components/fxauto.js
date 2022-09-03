export class fxauto {
  constructor(z, A, p, C, s) {
    var u = this;
    var n = this.constructor.prototype;
    this.srate = s;
    this.tmin = Math.round(this.srate / C);
    this.tmax = Math.round(this.srate / z);
    this.bias = new Float32Array(this.tmax + 1);
    this.ac = new Float32Array(this.tmax + 1);
    var m = Math.log(A);
    var B = m * m;
    var D = 1;
    var E = 0.95;
    var v = Math.log(p);
    var w = v * v;
    var o = 1;
    var x = 0.95;
    var G = (m + v) / 2;
    var F = G * G;
    var H = 1;
    var t = 1;
    var q =
      B * G * o + m * H * w + D * F * v - D * G * w - B * H * v - m * F * o;
    var y =
      E * G * o + m * H * x + D * t * v - D * G * x - E * H * v - m * t * o;
    var J =
      B * t * o + E * H * w + D * F * x - D * t * w - B * H * x - E * F * o;
    var I =
      B * G * x + m * t * w + E * F * v - E * G * w - B * t * v - m * F * x;
    for (var r = this.tmin - 1; r <= this.tmax; r++) {
      G = Math.log(this.srate / r);
      this.bias[r] = (G * G * y) / q + (G * J) / q + I / q;
    }
    this.CalculateFx = function (a, O) {
      var Q = 0;
      for (var j = 0; j < O; j++) {
        Q += a[j] * a[j];
      }
      Q = Math.sqrt(Q / O);
      for (var f = this.tmin - 1; f <= this.tmax; f++) {
        var T = 0;
        var R = 0;
        var S = 0;
        for (var j = 0; j < O - f; j++) {
          S += a[j] * a[j + f];
          T += a[j] * a[j];
          R += a[j + f] * a[j + f];
        }
        this.ac[f] = (this.bias[f] * S) / Math.sqrt(T * R);
      }
      var N = this.tmin - 1;
      var d = this.ac[N];
      for (var f = this.tmin; f <= this.tmax; f++) {
        if (this.ac[f] > d) {
          d = this.ac[f];
          N = f;
        }
      }
      if (N <= this.tmin + 1 || N >= this.tmax - 1 || d < 0.5) {
        return { fx: 0, tx: N / this.srate, vs: d, en: Q };
      }
      var K = this.ac[N - 1];
      var P = this.ac[N];
      var l = this.ac[N + 1];
      var g = (0.5 * (l - K)) / (2 * P - K - l);
      var h = N + g;
      var b = 2;
      if (d > 0.9) {
        for (var L = b; L > 1; L--) {
          var e = true;
          for (var M = 1; M < L; M++) {
            var c = Math.round((M * h) / L);
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
      return { tx: h / this.srate, fx: this.srate / h, vs: d, en: Q };
    };
  }
}