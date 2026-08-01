export function resolveFallbackUseCase(api, copy) {
  if (api.kind === "type") return copy.type;
  if (api.category === "internal-compiler") return copy.internalCompiler;
  if (api.category === "dom-web-runtime") return copy.domRuntime;
  if (api.category === "rendering-ssr") return copy.rendering;
  return copy.default;
}
