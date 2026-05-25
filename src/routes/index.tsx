import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Calculator, Sparkles, X } from "lucide-react";
import { SHAPES, SHAPE_ORDER, type ShapeId, type ShapeResult } from "@/lib/shapes";
import { ShapeIcon } from "@/components/ShapeIcon";

export const Route = createFileRoute("/")({
  component: Index,
});

type View = "select" | "calc";

function Index() {
  const [view, setView] = useState<View>("select");
  const [shapeId, setShapeId] = useState<ShapeId | null>(null);
  const [stepsFor, setStepsFor] = useState<{ id: ShapeId; area: number } | null>(null);

  return (
    <main className="min-h-screen w-full">
      <header className="border-b border-border/60 backdrop-blur-sm bg-background/70 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">
              ∂
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">OptiContainer</h1>
              <p className="text-xs text-muted-foreground font-mono">Cálculo 2 · Multiplicadores de Lagrange</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground hidden md:flex items-center gap-2">
            <Sparkles className="size-4 text-accent" />
            Optimización de volumen
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {view === "select" && (
          <SelectView onPick={(id) => { setShapeId(id); setView("calc"); }} />
        )}
        {view === "calc" && shapeId && (
          <CalcView
            shapeId={shapeId}
            onBack={() => { setView("select"); setStepsFor(null); }}
            onOpenSteps={(area) => setStepsFor({ id: shapeId, area })}
          />
        )}
      </div>

      {stepsFor && (
        <StepsModal shapeId={stepsFor.id} area={stepsFor.area} onClose={() => setStepsFor(null)} />
      )}
    </main>
  );
}

function SelectView({ onPick }: { onPick: (id: ShapeId) => void }) {
  return (
    <section>
      <div className="mb-10">
        <p className="text-xs font-mono text-accent-foreground/70 uppercase tracking-widest mb-2">Paso 1 / 3</p>
        <h2 className="text-4xl font-semibold tracking-tight">Selecciona un contenedor</h2>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Elige la forma que quieres optimizar. Calcularemos las dimensiones que
          <span className="text-foreground"> maximizan el volumen </span>
          para un área lateral dada.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SHAPE_ORDER.map((id) => {
          const s = SHAPES[id];
          return (
            <button
              key={id}
              onClick={() => onPick(id)}
              className="group relative bg-card border border-border rounded-xl p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="aspect-square w-24 text-primary/80 group-hover:text-primary transition-colors">
                <ShapeIcon id={id} className="w-full h-full" />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-xs font-mono text-muted-foreground mt-1">óptimo: {s.relation}</p>
              </div>
              <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground/60 group-hover:text-accent">
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
  shapeId, onBack, onOpenSteps,
}: { shapeId: ShapeId; onBack: () => void; onOpenSteps: (area: number) => void }) {
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
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="size-4" /> Cambiar forma
        </button>

        <p className="text-xs font-mono text-accent-foreground/70 uppercase tracking-widest mb-2">Paso 2 / 3</p>
        <h2 className="text-3xl font-semibold tracking-tight">{shape.name}</h2>
        <p className="text-sm text-muted-foreground mt-2 font-mono">relación óptima · {shape.relation}</p>

        <div className="mt-8 p-6 bg-card border border-border rounded-xl">
          <div className="size-32 mx-auto text-primary">
            <ShapeIcon id={shapeId} className="w-full h-full" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Área lateral disponible</span>
            <div className="mt-2 flex">
              <input
                type="number"
                inputMode="decimal"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") calculate(); }}
                className="flex-1 rounded-l-md border border-border bg-background px-4 py-3 text-lg font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="1000"
                min="0"
              />
              <span className="inline-flex items-center px-4 rounded-r-md border border-l-0 border-border bg-muted text-sm font-mono text-muted-foreground">
                cm²
              </span>
            </div>
          </label>

          <button
            onClick={calculate}
            disabled={parsed == null}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground py-3 font-semibold tracking-wide transition hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Calculator className="size-4" /> CALCULAR
          </button>
        </div>
      </div>

      <div className="lg:pt-14">
        {!result ? (
          <div className="h-full min-h-[400px] border-2 border-dashed border-border rounded-xl grid place-items-center text-center p-8">
            <div>
              <div className="size-12 mx-auto rounded-full bg-muted grid place-items-center mb-3">
                <Calculator className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Ingresa un área y pulsa <span className="font-mono text-foreground">CALCULAR</span> para ver las dimensiones óptimas.
              </p>
            </div>
          </div>
        ) : (
          <ResultPanel shape={shape.name} result={result} onOpenSteps={() => onOpenSteps(parsed!)} />
        )}
      </div>
    </section>
  );
}

function ResultPanel({ shape, result, onOpenSteps }: {
  shape: string; result: ShapeResult; onOpenSteps: () => void;
}) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 py-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest opacity-80">📐 Dimensiones óptimas</span>
          <span className="text-xs opacity-70">{shape}</span>
        </div>
        <div className="p-6 space-y-3">
          {result.dims.map((d, i) => (
            <div key={i} className="flex items-baseline justify-between border-b border-border/50 pb-2 last:border-b-0">
              <span className="text-sm text-muted-foreground">{d.label} ({d.symbol})</span>
              <span className="font-mono text-2xl font-semibold">
                {d.value.toFixed(2)} <span className="text-sm text-muted-foreground">{d.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-accent/30 border border-accent rounded-xl p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-foreground/80 mb-2">📦 Volumen máximo</p>
        <p className="font-mono text-4xl font-bold text-foreground">
          {result.volume.toFixed(2)}
          <span className="text-lg text-muted-foreground ml-2">cm³</span>
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-success font-mono">
        <span className="size-2 rounded-full bg-success" />
        Relación óptima: {result.relation}
      </div>

      <button
        onClick={onOpenSteps}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card py-3 text-sm font-medium hover:border-primary hover:text-primary transition"
      >
        <BookOpen className="size-4" /> Ver método de cálculo
      </button>
    </div>
  );
}

function StepsModal({ shapeId, area, onClose }: { shapeId: ShapeId; area: number; onClose: () => void }) {
  const shape = SHAPES[shapeId];
  const A = area;
  const result = shape.compute(A);
  const steps = shape.steps(A, result);

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-6 animate-in fade-in duration-150">
      <div className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-accent-foreground/70">Paso 3 / 3</p>
            <h3 className="text-xl font-semibold">¿Cómo se calculó?</h3>
          </div>
          <button onClick={onClose} className="size-9 rounded-md hover:bg-muted grid place-items-center">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 py-3 bg-muted/50 border-b border-border flex items-center justify-between text-sm">
          <span><span className="text-muted-foreground">Forma:</span> <strong>{shape.name}</strong></span>
          <span className="font-mono"><span className="text-muted-foreground">A =</span> {A} cm²</span>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {steps.map((s, i) => (
            <div key={i}>
              <h4 className="font-mono text-xs uppercase tracking-widest text-primary mb-2">{s.title}</h4>
              <pre className="bg-card border border-border rounded-md p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed">
{s.lines.join("\n")}
              </pre>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Volver al cálculo
          </button>
        </div>
      </div>
    </div>
  );
}
