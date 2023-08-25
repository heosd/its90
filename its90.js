class ITS90 {
    static degree_ga_ref = 29.7646;
    static degree_hg_ref = -38.8344;
    static w_ga_ref = 1.11807;
    static w_hg_ref = 0.844235;

    static A = [
        -2.13534729, 3.1832472, -1.80143597, 0.71727204, 0.50344027, -0.61899395,
        -0.05332322, 0.28021362, 0.10715224, -0.29302865, 0.04459872, 0.11868632,
        -0.05248134
    ];

    static B = [
        0.183324722, 0.240975303, 0.209108771, 0.190439972, 0.142648498,
        0.077993465, 0.012475611, -0.032267127, -0.075291522, -0.05647067,
        0.076201285, 0.123893204, -0.029201193, -0.091173542, 0.001317696,
        0.026025526
    ];

    static C = [
        2.78157254, 1.64650916, -0.1371439, -0.00649767, -0.00234444, 0.00511868,
        0.00187982, -0.00204472, -0.00046122, 0.00045724
    ];

    static D = [
        439.932854, 472.41802, 37.684494, 7.472018, 2.920828, 0.005184, -0.963864,
        -0.188732, 0.191203, 0.049025
    ];

    // -- Resistance Ratio "W"
    static Calcw(r_tpw, r) {
        return r / r_tpw;
    }

    // -- Reverse calculation
    static Calcr(r_tpw, w) {
        return r_tpw * w;
    }

    static Assertw_ga(w_ga) {
        return w_ga >= ITS90.w_ga_ref;
    }

    static Assertw_hg(w_hg) {
        return w_hg <= ITS90.w_hg_ref;
    }

    static DevFunctionHgGa(W, a, b) {
        return a * (W - 1) + b * Math.pow(W - 1, 2);
    }

    static ToK(C) {
        return C + 273.15;
    }

    static ToC(K) {
        return K - 273.15;
    }

    init(r_tpw, a, b) {
        this.r_tpw = r_tpw;
        this.coef_a = a;
        this.coef_b = b;
    }

    // -- init values from sprtForm
    initForm(obj) {
        this.init(obj.r_tpw, obj.coef_a, obj.coef_b);
    }

    calcw(r) {
        if (!isNaN(this.r_tpw)) {
            return ITS90.Calcw(this.r_tpw, r);
        }
    }

    calcr(w) {
        if (!isNaN(this.r_tpw)) {
            return ITS90.Calcr(this.r_tpw, w);
        }
    }

    static Ref1(Wr) {
        const base = (Math.pow(Wr, 1 / 6) - 0.65) / 0.35;
        const list = [];
        for (let i = 1; i <= 15; i++) {
            const B = ITS90.B[i];
            const v = B * Math.pow(base, i);
            list.push(v);
        }
        const sum = list.reduce((a, b) => a + b, 0);
        const e = ITS90.B[0] + sum;
        return e * 273.16;
    }

    static Ref2(Wr) {
        const e1 = 273.15 + ITS90.D[0];
        const list = [];
        for (let i = 1; i <= 9; i++) {
            const D = ITS90.D[i];
            const v = D * Math.pow((Wr - 2.64) / 1.64, i);
            list.push(v);
        }

        const sum = list.reduce((a, b) => a + b, 0);
        return e1 + sum;
    }

    static RefFunction(W, a, b) {
        if (isNaN(W)) {
            return undefined;
        }

        const deltaW = ITS90.DevFunctionHgGa(W, a, b);
        const Wr = W - deltaW;

        const result = {
            W: W,
            a: a,
            b: b,

            deltaW: deltaW,
            Wr: Wr
        };

        if (W <= 1) {
            result.t = ITS90.Ref1(Wr);
            result.ref = 1;
            result.refRangeK = [13.8033, 273.16];
            result.refRangeC = [-259.3467, 0.01];
        } else {
            result.t = ITS90.Ref2(Wr);
            result.ref = 2;
            result.refRangeK = [273.16, 1234.93];
            result.refRangeC = [0.01, 961.78];
        }

        result.t_c = ITS90.ToC(result.t);

        return result;
    }

    refFunction(W) {
        return ITS90.RefFunction(W, this.coef_a, this.coef_b);
    }

    static R2T(R, Rtpw, a, b) {
        const W = ITS90.Calcw(Rtpw, R);
        return ITS90.RefFunction(W, a, b);
    }

    r2t(R) {
        return ITS90.R2T(R, this.r_tpw, this.coef_a, this.coef_b);
    }
}