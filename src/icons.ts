import {
  AlertTriangle as alertTriangle,
  ArrowRight as arrowRight,
  Braces as braces,
  Check as check,
  ChevronRight as chevronRight,
  CircleGauge as circleGauge,
  Code2 as code2,
  Database as database,
  ExternalLink as externalLink,
  GitBranch as github,
  Layers3 as layers3,
  Menu as menu,
  Minus as minus,
  Play as play,
  Plus as plus,
  RotateCcw as rotateCcw,
  Search as search,
  Server as server,
  Sparkles as sparkles,
  Trash2 as trash2,
  Workflow as workflow,
  X as x,
  Zap as zap,
  createElement as createLucideElement,
  type IconNode,
} from "lucide";
import { untrack } from "solid-js";

type IconProps = {
  size?: number;
};

function icon(node: IconNode) {
  return (props: IconProps) => {
    const size = untrack(() => props.size ?? 24);
    return createLucideElement(node, {
      width: String(size),
      height: String(size),
      "aria-hidden": "true",
    });
  };
}

export const AlertTriangle = icon(alertTriangle);
export const ArrowRight = icon(arrowRight);
export const Braces = icon(braces);
export const Check = icon(check);
export const ChevronRight = icon(chevronRight);
export const CircleGauge = icon(circleGauge);
export const Code2 = icon(code2);
export const Database = icon(database);
export const ExternalLink = icon(externalLink);
export const Github = icon(github);
export const Layers3 = icon(layers3);
export const Menu = icon(menu);
export const Minus = icon(minus);
export const Play = icon(play);
export const Plus = icon(plus);
export const RotateCcw = icon(rotateCcw);
export const Search = icon(search);
export const Server = icon(server);
export const Sparkles = icon(sparkles);
export const Trash2 = icon(trash2);
export const Workflow = icon(workflow);
export const X = icon(x);
export const Zap = icon(zap);
