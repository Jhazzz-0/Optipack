import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Calculator, X } from "lucide-react";
import { SHAPES, SHAPE_ORDER, type ShapeId, type ShapeResult } from "@/lib/shapes";
import { ShapeIcon } from "@/components/ShapeIcon";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
  CartesianGrid
} from "recharts";

export const Route = createFileRoute("/")({
  component: Index,
});

type View = "select" | "calc";

function getVolumeCurveData(shapeId: ShapeId, area: number, optimalVal: number) {
  const points: { val: number; volume: number }[] = [];
  
  let maxVal = 0;
  if (shapeId === "cyl-lid") {
    maxVal = Math.sqrt(area / (2 * Math.PI));
  } else if (shapeId === "cyl-nolid") {
    maxVal = Math.sqrt(area / Math.PI);
  } else if (shapeId === "box-lid") {
    maxVal = Math.sqrt(area / 2);
  } else if (shapeId === "box-nolid") {
    maxVal = Math.sqrt(area);
  } else if (shapeId === "cone") {
    maxVal = Math.sqrt(area / (2 * Math.PI));
  } else if (shapeId === "pyramid") {
    maxVal = Math.sqrt(area / 2);
  }

  const minVal = 0.05 * maxVal;
  const limitVal = 0.95 * maxVal;
  const step = (limitVal - minVal) / 30;

  for (let i = 0; i <= 30; i++) {
    const v = minVal + i * step;
    let vol = 0;
    if (shapeId === "cyl-lid") {
      vol = (area * v) / 2 - Math.PI * Math.pow(v, 3);
    } else if (shapeId === "cyl-nolid") {
      vol = (area * v) / 2 - (Math.PI * Math.pow(v, 3)) / 2;
    } else if (shapeId === "box-lid") {
      vol = (area * v) / 4 - Math.pow(v, 3) / 2;
    } else if (shapeId === "box-nolid") {
      vol = (area * v) / 4 - Math.pow(v, 3) / 4;
    } else if (shapeId === "cone") {
      const term = Math.pow(area, 2) * Math.pow(v, 2) - 2 * Math.PI * area * Math.pow(v, 4);
      vol = term > 0 ? (1 / 3) * Math.sqrt(term) : 0;
    } else if (shapeId === "pyramid") {
      const term = Math.pow(area, 2) * Math.pow(v, 2) - 2 * area * Math.pow(v, 4);
      vol = term > 0 ? (1 / 6) * Math.sqrt(term) : 0;
    }
    
    if (vol > 0) {
      points.push({
        val: Number(v.toFixed(2)),
        volume: Number(vol.toFixed(2)),
      });
    }
  }

  let optVol = 0;
  if (shapeId === "cyl-lid") {
    optVol = (area * optimalVal) / 2 - Math.PI * Math.pow(optimalVal, 3);
  } else if (shapeId === "cyl-nolid") {
    optVol = (area * optimalVal) / 2 - (Math.PI * Math.pow(optimalVal, 3)) / 2;
  } else if (shapeId === "box-lid") {
    optVol = (area * optimalVal) / 4 - Math.pow(optimalVal, 3) / 2;
  } else if (shapeId === "box-nolid") {
    optVol = (area * optimalVal) / 4 - Math.pow(optimalVal, 3) / 4;
  } else if (shapeId === "cone") {
    const term = Math.pow(area, 2) * Math.pow(optimalVal, 2) - 2 * Math.PI * area * Math.pow(optimalVal, 4);
    optVol = term > 0 ? (1 / 3) * Math.sqrt(term) : 0;
  } else if (shapeId === "pyramid") {
    const term = Math.pow(area, 2) * Math.pow(optimalVal, 2) - 2 * area * Math.pow(optimalVal, 4);
    optVol = term > 0 ? (1 / 6) * Math.sqrt(term) : 0;
  }

  points.push({
    val: Number(optimalVal.toFixed(2)),
    volume: Number(optVol.toFixed(2)),
  });

  points.sort((a, b) => a.val - b.val);

  return points.filter((p, index, self) => 
    index === self.findIndex((t) => t.val === p.val)
  );
}

function Index() {
  const [view, setView] = useState<View>("select");
  const [shapeId, setShapeId] = useState<ShapeId | null>(null);
  const [stepsFor, setStepsFor] = useState<{ id: ShapeId; area: number } | null>(null);

  return (
    <main className="min-h-screen w-full">
      <header className="border-b border-[#E8DCD0] bg-[#FFFFFF] sticky top-0 z-10 py-4 px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-2xl font-bold text-[#D93B2B]">OptiPack</span>
          {view === "calc" && (
            <button
              onClick={() => { setView("select"); setStepsFor(null); }}
              className="border border-[#D93B2B] bg-transparent text-[#D93B2B] py-2 px-5 rounded-[40px] transition-colors hover:bg-[#FFF3F0] text-sm font-medium cursor-pointer"
            >
              Cambiar forma
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {view === "select" && (
          <SelectView
            selectedId={shapeId}
            onPick={(id) => {
              setShapeId(id);
              setView("calc");
            }}
          />
        )}
        {view === "calc" && shapeId && (
          <CalcView
            shapeId={shapeId}
            onBack={() => {
              setView("select");
              setStepsFor(null);
            }}
            onOpenSteps={(area) => setStepsFor({ id: shapeId, area })}
          />
        )}
      </div>

      {stepsFor && (
        <StepsModal
          shapeId={stepsFor.id}
          area={stepsFor.area}
          onClose={() => setStepsFor(null)}
        />
      )}
    </main>
  );
}

function SelectView({
  selectedId,
  onPick,
}: {
  selectedId: ShapeId | null;
  onPick: (id: ShapeId) => void;
}) {
  return (
    <section>
      <div className="mb-10">
        <p className="text-xs font-mono text-[#7A7670] uppercase tracking-widest mb-2">Paso 1 / 3</p>
        <h2 className="text-4xl font-semibold tracking-tight text-[#2C2A29]">Selecciona un contenedor</h2>
        <p className="mt-3 text-[#7A7670] max-w-xl">
          Elige la forma que quieres optimizar. Calcularemos las dimensiones que
          <span className="text-[#2C2A29] font-medium"> maximizan el volumen </span>
          para un área lateral dada.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SHAPE_ORDER.map((id) => {
          const s = SHAPES[id];
          const isSelected = id === selectedId;
          return (
            <button
              key={id}
              onClick={() => onPick(id)}
              className={`group relative rounded-xl p-6 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 border-2 cursor-pointer ${
                isSelected
                  ? "border-[#D93B2B] bg-[#FFF3F0]"
                  : "bg-card border-[#E8DCD0] hover:border-[#D93B2B]"
              }`}
            >
              <div className="aspect-square w-24 text-[#D93B2B]/80 group-hover:text-[#D93B2B] transition-colors">
                <ShapeIcon id={id} className="w-full h-full" />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-[#2C2A29]">{s.name}</h3>
                <div className="mt-2 inline-flex items-center rounded-md bg-[#F0EEEA] px-2 py-0.5 text-xs font-mono font-medium text-[#D93B2B]">
                  {s.relation}
                </div>
              </div>
              <div className="absolute top-4 right-4 text-xs font-mono text-[#7A7670]/60 group-hover:text-[#D93B2B]">
                →
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CalcView({
  shapeId,
  onBack,
  onOpenSteps,
}: {
  shapeId: ShapeId;
  onBack: () => void;
  onOpenSteps: (area: number) => void;
}) {
  const shape = SHAPES[shapeId];
  const [area, setArea] = useState<string>("1000");
  const [result, setResult] = useState<ShapeResult | null>(null);

  const parsed = useMemo(() => {
    const n = Number(area);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [area]);

  const calculate = () => {
    if (parsed == null) return;
    setResult(shape.compute(parsed));
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10">
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-[#7A7670] hover:text-[#2C2A29] transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Cambiar forma
        </button>

        <p className="text-xs font-mono text-[#7A7670] uppercase tracking-widest mb-2">Paso 2 / 3</p>
        <h2 className="text-3xl font-semibold tracking-tight text-[#2C2A29]">{shape.name}</h2>
        
        <div className="mt-2 inline-flex items-center rounded-md bg-[#F0EEEA] px-3 py-1 text-sm font-mono font-medium text-[#D93B2B]">
          Relación óptima: {shape.relation}
        </div>

        <div className="mt-8 p-6 bg-card border border-[#E8DCD0] rounded-xl">
          <div className="size-32 mx-auto text-[#D93B2B]/80">
            <ShapeIcon id={shapeId} className="w-full h-full" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#2C2A29]">Área lateral disponible</span>
            <div className="mt-2 flex">
              <input
                type="number"
                inputMode="decimal"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") calculate();
                }}
                className="flex-1 rounded-l-md border border-[#E8DCD0] bg-card px-4 py-3 text-lg font-mono outline-none focus:border-[#D93B2B] focus:ring-2 focus:ring-[#D93B2B]/20 text-[#2C2A29]"
                placeholder="1000"
                min="0"
              />
              <span className="inline-flex items-center px-4 rounded-r-md border border-l-0 border-[#E8DCD0] bg-[#FAF7F2] text-sm font-mono text-[#7A7670]">
                cm²
              </span>
            </div>
          </label>

          <button
            onClick={calculate}
            disabled={parsed == null}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#D93B2B] text-white py-3 font-semibold tracking-wide transition hover:bg-[#B02012] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Calculator className="size-4" /> CALCULAR
          </button>
        </div>
      </div>

      <div className="lg:pt-14">
        {!result ? (
          <div className="h-full min-h-[400px] border-2 border-dashed border-[#E8DCD0] rounded-xl grid place-items-center text-center p-8">
            <div>
              <div className="size-12 mx-auto rounded-full bg-[#F0EEEA] grid place-items-center mb-3">
                <Calculator className="size-5 text-[#D93B2B]" />
              </div>
              <p className="text-sm text-[#7A7670]">
                Ingresa un área y pulsa <span className="font-mono text-[#2C2A29] font-medium">CALCULAR</span> para ver las dimensiones óptimas.
              </p>
            </div>
          </div>
        ) : (
          <ResultPanel
            shapeId={shapeId}
            shape={shape.name}
            result={result}
            area={Number(area)}
            onOpenSteps={() => onOpenSteps(parsed!)}
          />
        )}
      </div>
    </section>
  );
}

function ResultPanel({
  shapeId,
  shape,
  result,
  area,
  onOpenSteps,
}: {
  shapeId: ShapeId;
  shape: string;
  result: ShapeResult;
  area: number;
  onOpenSteps: () => void;
}) {
  const optimalVal = result.dims[0].value;
  const label = result.dims[0].label;
  const symbol = result.dims[0].symbol;

  const chartData = useMemo(() => {
    return getVolumeCurveData(shapeId, area, optimalVal);
  }, [shapeId, area, optimalVal]);

  const optVol = result.volume;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-card border border-[#E8DCD0] rounded-xl overflow-hidden shadow-sm">
        <div className="bg-[#D93B2B] text-white px-6 py-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest opacity-80">📐 Dimensiones óptimas</span>
          <span className="text-xs opacity-70">{shape}</span>
        </div>
        <div className="p-6 space-y-3">
          {result.dims.map((d, i) => (
            <div key={i} className="flex items-baseline justify-between border-b border-[#E8DCD0]/50 pb-2 last:border-b-0">
              <span className="text-sm text-[#7A7670]">{d.label} ({d.symbol})</span>
              <span className="font-mono text-2xl font-semibold text-[#2C2A29]">
                {d.value.toFixed(2)} <span className="text-sm text-[#7A7670]">{d.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#E07A5F]/15 border border-[#E07A5F]/30 rounded-xl p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-[#D93B2B] mb-2 font-medium">📦 Volumen máximo</p>
        <p className="font-mono text-4xl font-bold text-[#2C2A29]">
          {result.volume.toFixed(2)}
          <span className="text-lg text-[#7A7670] ml-2 font-normal">cm³</span>
        </p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-md bg-[#F0EEEA] px-3 py-1.5 text-sm font-mono font-medium text-[#D93B2B]">
        <span className="size-2 rounded-full bg-[#D93B2B]" />
        Relación óptima: {result.relation}
      </div>

      <div className="bg-card border border-[#E8DCD0] rounded-xl p-6 shadow-sm">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[#7A7670] mb-4">
          📈 Gráfico de Optimización (Volumen vs. {symbol})
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DCD0" />
              <XAxis
                dataKey="val"
                stroke="#7A7670"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#E8DCD0" }}
                label={{ value: `${label} (${symbol}) en cm`, position: "insideBottom", offset: -5, fill: "#7A7670", fontSize: 11 }}
              />
              <YAxis
                stroke="#7A7670"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#E8DCD0" }}
                label={{ value: "Volumen (cm³)", angle: -90, position: "insideLeft", offset: 10, fill: "#7A7670", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8DCD0",
                  borderRadius: "8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "#2C2A29"
                }}
                labelFormatter={(value) => `${label} (${symbol}): ${value} cm`}
                formatter={(value: any) => [`${value} cm³`, "Volumen"]}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#D93B2B"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#D93B2B" }}
              />
              <ReferenceDot
                x={Number(optimalVal.toFixed(2))}
                y={Number(optVol.toFixed(2))}
                r={6}
                fill="#D93B2B"
                stroke="#FFFFFF"
                strokeWidth={2}
                label={{
                  value: "Óptimo",
                  position: "top",
                  fill: "#D93B2B",
                  fontSize: 11,
                  fontWeight: "bold",
                  offset: 8
                }}
              />
              <ReferenceLine x={Number(optimalVal.toFixed(2))} stroke="#D93B2B" strokeDasharray="3 3" opacity={0.5} />
              <ReferenceLine y={Number(optVol.toFixed(2))} stroke="#D93B2B" strokeDasharray="3 3" opacity={0.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-[#7A7670] mt-3 font-mono leading-relaxed">
          El punto rojo representa la configuración que maximiza el volumen. Moverse hacia la izquierda o derecha reduce la capacidad del contenedor para la misma superficie lateral de {area} cm².
        </p>
      </div>

      <button
        onClick={onOpenSteps}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-[#E8DCD0] bg-card py-3 text-sm font-medium hover:border-[#D93B2B] hover:text-[#D93B2B] transition cursor-pointer"
      >
        <BookOpen className="size-4" /> Ver método de cálculo
      </button>
    </div>
  );
}

function StepsModal({
  shapeId,
  area,
  onClose,
}: {
  shapeId: ShapeId;
  area: number;
  onClose: () => void;
}) {
  const shape = SHAPES[shapeId];
  const A = area;
  const result = shape.compute(A);
  const steps = shape.steps(A, result);

  return (
    <div className="fixed inset-0 z-50 bg-[#2C2A29]/40 backdrop-blur-sm grid place-items-center p-6 animate-in fade-in duration-150">
      <div className="bg-card border border-[#E8DCD0] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-[#E8DCD0] flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#7A7670]">Paso 3 / 3</p>
            <h3 className="text-xl font-semibold text-[#2C2A29]">¿Cómo se calculó?</h3>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-md hover:bg-[#FAF7F2] grid place-items-center text-[#7A7670] hover:text-[#2C2A29] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 py-3 bg-[#FAF7F2] border-b border-[#E8DCD0] flex items-center justify-between text-sm">
          <span className="text-[#2C2A29]">
            <span className="text-[#7A7670]">Forma:</span> <strong>{shape.name}</strong>
          </span>
          <span className="font-mono text-[#2C2A29]">
            <span className="text-[#7A7670]">A =</span> {A} cm²
          </span>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {steps.map((s, i) => (
            <div key={i}>
              <h4 className="font-mono text-xs uppercase tracking-widest text-[#D93B2B] mb-2 font-semibold">
                {s.title}
              </h4>
              <pre className="bg-[#FAF7F2] border border-[#E8DCD0] rounded-md p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed text-[#2C2A29]">
                {s.lines.join("\n")}
              </pre>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-[#E8DCD0]">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#7A7670] hover:text-[#D93B2B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" /> Volver al cálculo
          </button>
        </div>
      </div>
    </div>
  );
}

