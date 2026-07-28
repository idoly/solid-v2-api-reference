import {
  ArrowRight as arrowRight,
  Braces as braces,
  Check as check,
  ChevronRight as chevronRight,
  CircleGauge as circleGauge,
  Code2 as code2,
  Copy as copy,
  Database as database,
  ExternalLink as externalLink,
  GitBranch as github,
  Layers3 as layers3,
  Languages as languages,
  Menu as menu,
  Maximize2 as maximize2,
  Moon as moon,
  Play as play,
  RotateCcw as rotateCcw,
  Search as search,
  Server as server,
  Sparkles as sparkles,
  Sun as sun,
  Workflow as workflow,
  X as x,
  Zap as zap,
  createElement as createLucideElement,
  type IconNode,
} from "lucide";
import { untrack } from "solid-js";

type Props = Readonly<{
  size?: number;
}>;

function createIcon(node: IconNode) {
  return (props: Props) => {
    // Lucide creates DOM imperatively; untrack keeps prop reads out of the parent computation.
    const size = untrack(() => props.size ?? 24);
    return createLucideElement(node, {
      width: String(size),
      height: String(size),
      "aria-hidden": "true",
    });
  };
}

export const ArrowRight = createIcon(arrowRight);
export const Braces = createIcon(braces);
export const Check = createIcon(check);
export const ChevronRight = createIcon(chevronRight);
export const CircleGauge = createIcon(circleGauge);
export const Code2 = createIcon(code2);
export const Copy = createIcon(copy);
export const Database = createIcon(database);
export const ExternalLink = createIcon(externalLink);
export const Github = createIcon(github);
export const Layers3 = createIcon(layers3);
export const Languages = createIcon(languages);
export const Menu = createIcon(menu);
export const Maximize2 = createIcon(maximize2);
export const Moon = createIcon(moon);
export const Play = createIcon(play);
export const RotateCcw = createIcon(rotateCcw);
export const SearchIcon = createIcon(search);
export const Server = createIcon(server);
export const Sparkles = createIcon(sparkles);
export const Sun = createIcon(sun);
export const Workflow = createIcon(workflow);
export const X = createIcon(x);
export const Zap = createIcon(zap);
