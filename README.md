# 📦 Optipack 
Optimización de Contenedores 3D

La aplicación calcula las dimensiones óptimas de contenedores 3D para maximizar el volumen dado un área superficial fija, utilizando Multiplicadores de Lagrange.

🔗 **Optipack**: [App](https://tanstack-start-app.optimizador-contenedores.workers.dev/)

---

## 🎯 ¿Qué hace?

1. El usuario selecciona una forma geométrica
2. Ingresa el área lateral disponible (cm²)
3. La app calcula las dimensiones que maximizan el volumen
4. Muestra el desarrollo paso a paso del método de Lagrange

## 📐 Formas soportadas

| Forma | Restricción | Resultado óptimo |
|---|---|---|
| Cilindro (con tapa) | A = 2πr² + 2πrh | h = 2r |
| Cilindro (sin tapa) | A = πr² + 2πrh | h = r |
| Caja (con tapa) | A = 2(xy + xz + yz) | x = y = z (cubo) |
| Caja (sin tapa) | A = xy + 2xz + 2yz | x = y, z = x/2 |
| Cono | A = πr² + πr√(r²+h²) | h = 2√2·r |
| Pirámide | A = x² + 2x·√(x²/4+h²) | h ≈ 1.539·x |

## 🛠️ Tecnologías

- React + TypeScript
- TanStack Start
- Vite
- Tailwind CSS
- Cloudflare Workers

## 🚀 Instalación y uso

```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev

# Build de producción
npm run build
```

## 🏗️ Arquitectura

El proyecto sigue una arquitectura por capas:

```
src/
├── routes/           ← Presentación (páginas)
│   ├── __root.tsx    ← Layout HTML general
│   └── index.tsx     ← Página principal (controlador + UI)
│
├── components/       ← Presentación (componentes)
│   └── ShapeIcon.tsx ← Iconos SVG de las formas
│
├── lib/              ← Dominio (lógica)
│   └── shapes.ts     ← Matemática de Lagrange
│
├── server.ts         ← Infraestructura
├── start.ts          ← Infraestructura
└── router.tsx        ← Infraestructura
```

## 📚 Concepto matemático

Cada forma resuelve un problema de optimización con restricciones:

> **Maximizar** V(x₁, x₂, ...) sujeto a A(x₁, x₂, ...) = constante

Usando la condición de Lagrange: ∇V = λ∇A

Se obtienen las derivadas parciales, se plantea el sistema de ecuaciones y se resuelve para encontrar la relación óptima entre las dimensiones.

## 👥 Autores

Josefina Carabajal,
Jhaziel Mamani,
Lilian Laime,
Elias Torres,
Gaston Maidana

