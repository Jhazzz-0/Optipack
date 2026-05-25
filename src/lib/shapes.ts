export type ShapeId =
  | "cyl-lid"
  | "cyl-nolid"
  | "box-lid"
  | "box-nolid"
  | "cone"
  | "pyramid";

export interface ShapeResult {
  dims: { label: string; symbol: string; value: number; unit: string }[];
  volume: number;
  relation: string;
}

export interface ShapeDef {
  id: ShapeId;
  name: string;
  icon: string; // svg path or label
  relation: string;
  compute: (A: number) => ShapeResult;
  steps: (A: number, r: ShapeResult) => { title: string; lines: string[] }[];
}

const fmt = (n: number, d = 2) => n.toFixed(d);

export const SHAPES: Record<ShapeId, ShapeDef> = {
  "cyl-lid": {
    id: "cyl-lid",
    name: "Cilindro (con tapa)",
    icon: "cyl-lid",
    relation: "h = 2r",
    compute: (A) => {
      // A = 2πr² + 2πrh, optimal h = 2r → 6πr² = A
      const r = Math.sqrt(A / (6 * Math.PI));
      const h = 2 * r;
      const V = Math.PI * r * r * h;
      return {
        dims: [
          { label: "Radio", symbol: "r", value: r, unit: "cm" },
          { label: "Altura", symbol: "h", value: h, unit: "cm" },
        ],
        volume: V,
        relation: "h = 2r",
      };
    },
    steps: (A, res) => {
      const r = res.dims[0].value;
      const h = res.dims[1].value;
      return [
        { title: "PASO 1 — Definir funciones", lines: [
          "Maximizar:  V(r,h) = π·r²·h",
          `Restricción: A(r,h) = 2πr² + 2πrh = ${A}`,
        ]},
        { title: "PASO 2 — Multiplicadores de Lagrange", lines: ["∇V = λ ∇A"] },
        { title: "PASO 3 — Sistema de ecuaciones", lines: [
          "(1)  ∂V/∂r = 2πrh = λ(4πr + 2πh)",
          "(2)  ∂V/∂h = πr²  = λ(2πr)",
        ]},
        { title: "PASO 4 — Resolver", lines: [
          "De (2):  λ = r / 2",
          "Sustituyendo en (1):  2πrh = (r/2)(4πr + 2πh)",
          "                       2h = 2r + h",
          "                       h = 2r",
        ]},
        { title: "PASO 5 — Dimensiones óptimas", lines: [
          `Con h = 2r:  2πr² + 2πr(2r) = 6πr² = ${A}`,
          `r = √(${A} / 6π) = ${fmt(r)} cm`,
          `h = 2r = ${fmt(h)} cm`,
        ]},
        { title: "VOLUMEN MÁXIMO", lines: [
          `V = π·r²·h = π·(${fmt(r)})²·(${fmt(h)}) = ${fmt(res.volume)} cm³`,
        ]},
      ];
    },
  },
  "cyl-nolid": {
    id: "cyl-nolid",
    name: "Cilindro (sin tapa)",
    icon: "cyl-nolid",
    relation: "h = r",
    compute: (A) => {
      // A = πr² + 2πrh, optimal h = r → 3πr² = A
      const r = Math.sqrt(A / (3 * Math.PI));
      const h = r;
      const V = Math.PI * r * r * h;
      return {
        dims: [
          { label: "Radio", symbol: "r", value: r, unit: "cm" },
          { label: "Altura", symbol: "h", value: h, unit: "cm" },
        ],
        volume: V,
        relation: "h = r",
      };
    },
    steps: (A, res) => {
      const r = res.dims[0].value;
      return [
        { title: "PASO 1 — Definir funciones", lines: [
          "Maximizar:  V(r,h) = π·r²·h",
          `Restricción: A(r,h) = πr² + 2πrh = ${A}`,
        ]},
        { title: "PASO 2 — Lagrange", lines: ["∇V = λ ∇A"] },
        { title: "PASO 3 — Sistema", lines: [
          "(1)  2πrh = λ(2πr + 2πh)",
          "(2)  πr²  = λ(2πr)",
        ]},
        { title: "PASO 4 — Resolver", lines: [
          "De (2):  λ = r / 2",
          "Sustituyendo en (1):  2πrh = (r/2)(2πr + 2πh)",
          "                       2h = r + h",
          "                       h = r",
        ]},
        { title: "PASO 5 — Dimensiones", lines: [
          `Con h = r:  πr² + 2πr·r = 3πr² = ${A}`,
          `r = √(${A} / 3π) = ${fmt(r)} cm`,
          `h = r = ${fmt(r)} cm`,
        ]},
        { title: "VOLUMEN MÁXIMO", lines: [
          `V = π·r²·h = ${fmt(res.volume)} cm³`,
        ]},
      ];
    },
  },
  "box-lid": {
    id: "box-lid",
    name: "Caja (con tapa)",
    icon: "box-lid",
    relation: "x = y = z (cubo)",
    compute: (A) => {
      // A = 2(xy+xz+yz), optimal cube x=y=z, 6x² = A
      const x = Math.sqrt(A / 6);
      const V = x ** 3;
      return {
        dims: [
          { label: "Lado", symbol: "x", value: x, unit: "cm" },
          { label: "Lado", symbol: "y", value: x, unit: "cm" },
          { label: "Altura", symbol: "z", value: x, unit: "cm" },
        ],
        volume: V,
        relation: "x = y = z",
      };
    },
    steps: (A, res) => {
      const x = res.dims[0].value;
      return [
        { title: "PASO 1 — Funciones", lines: [
          "Maximizar:  V(x,y,z) = x·y·z",
          `Restricción: A = 2(xy + xz + yz) = ${A}`,
        ]},
        { title: "PASO 2 — Lagrange", lines: ["∇V = λ ∇A"] },
        { title: "PASO 3 — Sistema", lines: [
          "yz = λ·2(y + z)",
          "xz = λ·2(x + z)",
          "xy = λ·2(x + y)",
        ]},
        { title: "PASO 4 — Resolver", lines: [
          "Por simetría:  x = y = z",
          `Sustituyendo:  6x² = ${A}`,
          `x = √(${A} / 6) = ${fmt(x)} cm`,
        ]},
        { title: "VOLUMEN MÁXIMO", lines: [
          `V = x³ = ${fmt(res.volume)} cm³`,
        ]},
      ];
    },
  },
  "box-nolid": {
    id: "box-nolid",
    name: "Caja (sin tapa)",
    icon: "box-nolid",
    relation: "x = y, z = x/2",
    compute: (A) => {
      // Open box, square base optimal: x=y, z=x/2 → A = x² + 4xz = x²+2x² = 3x²
      const x = Math.sqrt(A / 3);
      const z = x / 2;
      const V = x * x * z;
      return {
        dims: [
          { label: "Base", symbol: "x", value: x, unit: "cm" },
          { label: "Base", symbol: "y", value: x, unit: "cm" },
          { label: "Altura", symbol: "z", value: z, unit: "cm" },
        ],
        volume: V,
        relation: "x = y, z = x/2",
      };
    },
    steps: (A, res) => {
      const x = res.dims[0].value;
      const z = res.dims[2].value;
      return [
        { title: "PASO 1 — Funciones", lines: [
          "Maximizar:  V(x,y,z) = x·y·z",
          `Restricción: A = xy + 2xz + 2yz = ${A}  (sin tapa)`,
        ]},
        { title: "PASO 2 — Lagrange", lines: ["∇V = λ ∇A"] },
        { title: "PASO 3 — Sistema", lines: [
          "yz = λ(y + 2z)",
          "xz = λ(x + 2z)",
          "xy = λ·2(x + y)",
        ]},
        { title: "PASO 4 — Resolver", lines: [
          "Por simetría de base:  x = y",
          "De las ecuaciones se obtiene:  z = x / 2",
          `Sustituyendo:  x² + 4x(x/2) = 3x² = ${A}`,
          `x = √(${A} / 3) = ${fmt(x)} cm`,
          `z = x/2 = ${fmt(z)} cm`,
        ]},
        { title: "VOLUMEN MÁXIMO", lines: [
          `V = x²·z = ${fmt(res.volume)} cm³`,
        ]},
      ];
    },
  },
  cone: {
    id: "cone",
    name: "Cono",
    icon: "cone",
    relation: "h = 2√2 · r",
    compute: (A) => {
      // Total surface (base + lateral): A = πr² + πr√(r²+h²)
      // Optimal: h = 2√2 r → l = 3r → A = 4πr²
      const r = Math.sqrt(A / (4 * Math.PI));
      const h = 2 * Math.SQRT2 * r;
      const V = (1 / 3) * Math.PI * r * r * h;
      return {
        dims: [
          { label: "Radio", symbol: "r", value: r, unit: "cm" },
          { label: "Altura", symbol: "h", value: h, unit: "cm" },
        ],
        volume: V,
        relation: "h = 2√2 r",
      };
    },
    steps: (A, res) => {
      const r = res.dims[0].value;
      const h = res.dims[1].value;
      return [
        { title: "PASO 1 — Funciones", lines: [
          "Maximizar:  V(r,h) = (1/3)π·r²·h",
          `Restricción: A = πr² + πr√(r² + h²) = ${A}`,
        ]},
        { title: "PASO 2 — Lagrange", lines: ["∇V = λ ∇A,  con l = √(r² + h²)"] },
        { title: "PASO 3 — Sistema", lines: [
          "(1)  (2/3)πrh = λ(2πr + π(2r² + h²)/l)",
          "(2)  (1/3)πr² = λ·πrh/l",
        ]},
        { title: "PASO 4 — Resolver", lines: [
          "Combinando (1) y (2):  l = 3r",
          "Como l² = r² + h²:  9r² = r² + h²  ⇒  h² = 8r²",
          "Por lo tanto:  h = 2√2 · r",
        ]},
        { title: "PASO 5 — Dimensiones", lines: [
          `Con l = 3r:  A = πr² + πr(3r) = 4πr² = ${A}`,
          `r = √(${A} / 4π) = ${fmt(r)} cm`,
          `h = 2√2 · r = ${fmt(h)} cm`,
        ]},
        { title: "VOLUMEN MÁXIMO", lines: [
          `V = (1/3)π·r²·h = ${fmt(res.volume)} cm³`,
        ]},
      ];
    },
  },
  pyramid: {
    id: "pyramid",
    name: "Pirámide",
    icon: "pyramid",
    relation: "h ≈ 1.539 · x",
    compute: (A) => {
      // Square pyramid, total surface (base + 4 triangles)
      // A = x² + 2x·√(x²/4 + h²)
      // Optimal ratio h²/x² = (5 + 2√5)/4
      const ratio2 = (5 + 2 * Math.sqrt(5)) / 4;
      const ratio = Math.sqrt(ratio2); // h/x
      // A = x² + 2x · √(x²/4 + h²) = x² + 2x · x·√(1/4 + ratio²)
      const k = Math.sqrt(0.25 + ratio2);
      const x = Math.sqrt(A / (1 + 2 * k));
      const h = ratio * x;
      const V = (1 / 3) * x * x * h;
      return {
        dims: [
          { label: "Base", symbol: "x", value: x, unit: "cm" },
          { label: "Altura", symbol: "h", value: h, unit: "cm" },
        ],
        volume: V,
        relation: `h/x = √((5+2√5)/4) ≈ ${ratio.toFixed(3)}`,
      };
    },
    steps: (A, res) => {
      const x = res.dims[0].value;
      const h = res.dims[1].value;
      return [
        { title: "PASO 1 — Funciones", lines: [
          "Maximizar:  V(x,h) = (1/3)·x²·h",
          `Restricción: A = x² + 2x·√(x²/4 + h²) = ${A}`,
        ]},
        { title: "PASO 2 — Lagrange", lines: [
          "∇V = λ ∇A,  con apotema s = √(x²/4 + h²)",
        ]},
        { title: "PASO 3 — Sistema", lines: [
          "(1)  (2/3)xh = λ(2x + 2s + x²/s)",
          "(2)  (1/3)x² = λ(2x·h / s)",
        ]},
        { title: "PASO 4 — Resolver", lines: [
          "Tras eliminar λ y simplificar:",
          "  4h²/s = 2x + 2s + x²/s",
          "Sustituyendo s² = x²/4 + h² y llamando u = h²/x²:",
          "  u² − (5/2)u + 5/16 = 0",
          "  ⇒ u = (5 + 2√5) / 4",
          `  ⇒ h = x · √u ≈ ${(h / x).toFixed(4)} · x`,
        ]},
        { title: "PASO 5 — Dimensiones", lines: [
          `x = ${fmt(x)} cm`,
          `h = ${fmt(h)} cm`,
        ]},
        { title: "VOLUMEN MÁXIMO", lines: [
          `V = (1/3)·x²·h = ${fmt(res.volume)} cm³`,
        ]},
      ];
    },
  },
};

export const SHAPE_ORDER: ShapeId[] = [
  "cyl-lid",
  "cyl-nolid",
  "box-lid",
  "box-nolid",
  "cone",
  "pyramid",
];
