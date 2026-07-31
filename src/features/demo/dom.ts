// Redirects common document targets into the preview so demos cannot replace the application shell.
export function createScopedDocument(mount: HTMLElement): Document {
  const targets = new Map<string, HTMLElement>();
  const targetFor = (id: string) => {
    if (id === "app" || id === "root") return mount;
    let target = targets.get(id);
    if (!target) {
      target = document.createElement("div");
      target.id = id;
      mount.append(target);
      targets.set(id, target);
    }
    return target;
  };

  return new Proxy(document, {
    get(target, property) {
      if (property === "body") return mount;
      if (property === "getElementById") return (id: string) => targetFor(id);
      if (property === "querySelector")
        return (selector: string) =>
          selector === "#app" || selector === "#root" ? mount : mount.querySelector(selector);
      if (property === "querySelectorAll") return (selector: string) => mount.querySelectorAll(selector);
      const value = Reflect.get(target, property, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
